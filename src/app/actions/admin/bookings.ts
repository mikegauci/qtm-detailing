"use server";

import type { ActionResult } from "@/types/action-result";
import { requireAdmin } from "@/lib/supabase/admin";
import { revalidateBookings } from "@/lib/content/revalidate-cms";
import type { Enums } from "@/lib/supabase/types";
import {
  removeGoogleCalendarEvent,
  syncBookingToGoogleCalendar,
} from "@/lib/google-calendar";
import {
  DEFAULT_BOOKING_END_TIME,
  DEFAULT_BOOKING_START_TIME,
  generateConfirmationCode,
  getBookingEndDate,
  validateBookingDateRange,
} from "@/lib/utils/booking";

type BookingActionResult = ActionResult<{ id?: string }>;

type BookingInput = {
  customer_id: string;
  vehicle_ids?: string[];
  booking_date: string;
  end_date?: string | null;
  notes?: string | null;
  status?: Enums<"booking_status">;
  service_ids: string[];
  service_prices?: Record<string, number>;
};

type BookingSupabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function syncBookingPrimaryVehicle(
  supabase: BookingSupabase,
  bookingId: string,
) {
  const { data } = await supabase
    .from("booking_vehicles")
    .select("vehicle_id")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true })
    .limit(1);

  await supabase
    .from("bookings")
    .update({ vehicle_id: data?.[0]?.vehicle_id ?? null })
    .eq("id", bookingId);
}

async function validateBookingVehicles(
  supabase: BookingSupabase,
  customerId: string,
  vehicleIds: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!vehicleIds.length) {
    return { ok: true };
  }

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, customer_id")
    .in("id", vehicleIds);

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!vehicles || vehicles.length !== vehicleIds.length) {
    return { ok: false, message: "One or more vehicles were not found." };
  }

  if (vehicles.some((vehicle) => vehicle.customer_id !== customerId)) {
    return {
      ok: false,
      message: "All vehicles must belong to the booking customer.",
    };
  }

  return { ok: true };
}

async function insertBookingVehicles(
  supabase: BookingSupabase,
  bookingId: string,
  vehicleIds: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!vehicleIds.length) {
    return { ok: true };
  }

  const { error } = await supabase.from("booking_vehicles").insert(
    vehicleIds.map((vehicleId) => ({
      booking_id: bookingId,
      vehicle_id: vehicleId,
    })),
  );

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Vehicle already on this booking." };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function createBooking(data: BookingInput): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, price")
    .in("id", data.service_ids);

  if (servicesError || !services?.length) {
    return { success: false, message: "Please select at least one service." };
  }

  const totalPrice = services.reduce(
    (sum, s) => sum + (data.service_prices?.[s.id] ?? Number(s.price)),
    0,
  );
  const endDate = getBookingEndDate(data.booking_date, data.end_date);
  const dateError = validateBookingDateRange(data.booking_date, endDate);
  if (dateError) {
    return { success: false, message: dateError };
  }

  const vehicleIds = [...new Set(data.vehicle_ids ?? [])];
  const vehicleValidation = await validateBookingVehicles(
    supabase,
    data.customer_id,
    vehicleIds,
  );
  if (!vehicleValidation.ok) {
    return { success: false, message: vehicleValidation.message };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: data.customer_id,
      vehicle_id: vehicleIds[0] ?? null,
      booking_date: data.booking_date,
      end_date: endDate,
      start_time: DEFAULT_BOOKING_START_TIME,
      end_time: DEFAULT_BOOKING_END_TIME,
      notes: data.notes ?? null,
      status: data.status ?? "booked",
      confirmation_code: generateConfirmationCode(),
      total_price: totalPrice,
    })
    .select("id")
    .single();

  if (error || !booking) {
    return { success: false, message: error?.message ?? "Failed to create booking." };
  }

  const serviceRows = services.map((s) => ({
    booking_id: booking.id,
    service_id: s.id,
    price_snapshot: data.service_prices?.[s.id] ?? Number(s.price),
  }));

  const { error: servicesInsertError } = await supabase
    .from("booking_services")
    .insert(serviceRows);

  if (servicesInsertError) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { success: false, message: servicesInsertError.message };
  }

  const vehiclesInsert = await insertBookingVehicles(
    supabase,
    booking.id,
    vehicleIds,
  );
  if (!vehiclesInsert.ok) {
    await supabase.from("booking_services").delete().eq("booking_id", booking.id);
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { success: false, message: vehiclesInsert.message };
  }

  revalidateBookings();
  await syncBookingToGoogleCalendar(booking.id);
  return { success: true, message: "Booking created.", id: booking.id };
}

export async function updateBooking(
  id: string,
  data: {
    customer_id?: string;
    booking_date?: string;
    end_date?: string | null;
    notes?: string | null;
    total_price?: number;
  },
): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  if (data.booking_date !== undefined || data.end_date !== undefined) {
    const { data: existing, error: fetchError } = await supabase
      .from("bookings")
      .select("booking_date, end_date")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return {
        success: false,
        message: fetchError?.message ?? "Booking not found.",
      };
    }

    const bookingDate = data.booking_date ?? existing.booking_date;
    const endDate = getBookingEndDate(
      bookingDate,
      data.end_date !== undefined ? data.end_date : existing.end_date,
    );
    const dateError = validateBookingDateRange(bookingDate, endDate);
    if (dateError) {
      return { success: false, message: dateError };
    }

    if (data.end_date === undefined && data.booking_date !== undefined) {
      data = { ...data, end_date: endDate };
    }
  }

  const { error } = await supabase.from("bookings").update(data).eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("customer_id")
    .eq("id", id)
    .single();

  revalidateBookings({
    bookingId: id,
    customerId: booking?.customer_id,
  });

  await syncBookingToGoogleCalendar(id);
  return { success: true, message: "Booking updated." };
}

export async function createReferenceBooking(data: {
  customer_id: string;
  vehicle_ids?: string[];
  booking_date: string;
  end_date?: string | null;
  notes?: string | null;
  total_price?: number | null;
}): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();
  const endDate = getBookingEndDate(data.booking_date, data.end_date);
  const dateError = validateBookingDateRange(data.booking_date, endDate);
  if (dateError) {
    return { success: false, message: dateError };
  }

  const vehicleIds = [...new Set(data.vehicle_ids ?? [])];
  const vehicleValidation = await validateBookingVehicles(
    supabase,
    data.customer_id,
    vehicleIds,
  );
  if (!vehicleValidation.ok) {
    return { success: false, message: vehicleValidation.message };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: data.customer_id,
      vehicle_id: vehicleIds[0] ?? null,
      booking_date: data.booking_date,
      end_date: endDate,
      start_time: DEFAULT_BOOKING_START_TIME,
      end_time: DEFAULT_BOOKING_END_TIME,
      notes: data.notes ?? null,
      status: "completed",
      confirmation_code: generateConfirmationCode(),
      total_price: data.total_price ?? 0,
    })
    .select("id")
    .single();

  if (error || !booking) {
    return {
      success: false,
      message: error?.message ?? "Failed to add past booking.",
    };
  }

  const vehiclesInsert = await insertBookingVehicles(
    supabase,
    booking.id,
    vehicleIds,
  );
  if (!vehiclesInsert.ok) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { success: false, message: vehiclesInsert.message };
  }

  revalidateBookings({ customerId: data.customer_id });
  return { success: true, message: "Past booking added.", id: booking.id };
}

export async function updateBookingStatus(
  id: string,
  status: Enums<"booking_status">,
): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidateBookings({ bookingId: id });
  await syncBookingToGoogleCalendar(id);
  return { success: true, message: "Booking status updated." };
}

export async function deleteBooking(id: string): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from("bookings")
    .select("google_event_id")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("booking_services").delete().eq("booking_id", id);
  await supabase.from("booking_vehicles").delete().eq("booking_id", id);

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  await removeGoogleCalendarEvent(existing?.google_event_id);
  revalidateBookings();
  return { success: true, message: "Booking deleted." };
}

export async function addBookingService(
  bookingId: string,
  serviceId: string,
  priceSnapshot?: number,
): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, price")
    .eq("id", serviceId)
    .single();

  if (serviceError || !service) {
    return { success: false, message: "Service not found." };
  }

  const snapshot =
    priceSnapshot !== undefined
      ? priceSnapshot
      : Number(service.price);

  const { error } = await supabase.from("booking_services").insert({
    booking_id: bookingId,
    service_id: serviceId,
    price_snapshot: snapshot,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: bookingServices } = await supabase
    .from("booking_services")
    .select("price_snapshot")
    .eq("booking_id", bookingId);

  const totalPrice =
    bookingServices?.reduce((sum, s) => sum + Number(s.price_snapshot), 0) ?? 0;

  await supabase
    .from("bookings")
    .update({ total_price: totalPrice })
    .eq("id", bookingId);

  revalidateBookings({ bookingId, scope: "list" });
  await syncBookingToGoogleCalendar(bookingId);
  return { success: true, message: "Service added to booking." };
}

export async function removeBookingService(
  bookingServiceId: string,
  bookingId: string,
): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("booking_services")
    .delete()
    .eq("id", bookingServiceId);

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: bookingServices } = await supabase
    .from("booking_services")
    .select("price_snapshot")
    .eq("booking_id", bookingId);

  const totalPrice =
    bookingServices?.reduce((sum, s) => sum + Number(s.price_snapshot), 0) ?? 0;

  await supabase
    .from("bookings")
    .update({ total_price: totalPrice })
    .eq("id", bookingId);

  revalidateBookings({ bookingId, scope: "list" });
  await syncBookingToGoogleCalendar(bookingId);
  return { success: true, message: "Service removed from booking." };
}

export async function addBookingVehicle(
  bookingId: string,
  vehicleId: string,
): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("customer_id")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return {
      success: false,
      message: bookingError?.message ?? "Booking not found.",
    };
  }

  const vehicleValidation = await validateBookingVehicles(
    supabase,
    booking.customer_id,
    [vehicleId],
  );
  if (!vehicleValidation.ok) {
    return { success: false, message: vehicleValidation.message };
  }

  const { data: existing } = await supabase
    .from("booking_vehicles")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("vehicle_id", vehicleId)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Vehicle already on this booking." };
  }

  const vehiclesInsert = await insertBookingVehicles(supabase, bookingId, [
    vehicleId,
  ]);
  if (!vehiclesInsert.ok) {
    return { success: false, message: vehiclesInsert.message };
  }

  await syncBookingPrimaryVehicle(supabase, bookingId);
  revalidateBookings({ bookingId, scope: "list" });
  await syncBookingToGoogleCalendar(bookingId);
  return { success: true, message: "Vehicle added to booking." };
}

export async function removeBookingVehicle(
  bookingId: string,
  vehicleId: string,
): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("booking_vehicles")
    .delete()
    .eq("booking_id", bookingId)
    .eq("vehicle_id", vehicleId);

  if (error) {
    return { success: false, message: error.message };
  }

  await syncBookingPrimaryVehicle(supabase, bookingId);
  revalidateBookings({ bookingId, scope: "list" });
  await syncBookingToGoogleCalendar(bookingId);
  return { success: true, message: "Vehicle removed from booking." };
}
