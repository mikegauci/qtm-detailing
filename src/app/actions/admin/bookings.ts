"use server";

import type { ActionResult } from "@/types/action-result";
import { requireAdmin } from "@/lib/supabase/admin";
import { revalidateBookings } from "@/lib/content/revalidate-cms";
import type { Enums } from "@/lib/supabase/types";
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
  vehicle_id?: string | null;
  booking_date: string;
  end_date?: string | null;
  notes?: string | null;
  status?: Enums<"booking_status">;
  service_ids: string[];
};

export async function createBooking(data: BookingInput): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, price")
    .in("id", data.service_ids);

  if (servicesError || !services?.length) {
    return { success: false, message: "Please select at least one service." };
  }

  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);
  const endDate = getBookingEndDate(data.booking_date, data.end_date);
  const dateError = validateBookingDateRange(data.booking_date, endDate);
  if (dateError) {
    return { success: false, message: dateError };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id ?? null,
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
    price_snapshot: Number(s.price),
  }));

  const { error: servicesInsertError } = await supabase
    .from("booking_services")
    .insert(serviceRows);

  if (servicesInsertError) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { success: false, message: servicesInsertError.message };
  }

  revalidateBookings();
  return { success: true, message: "Booking created.", id: booking.id };
}

export async function updateBooking(
  id: string,
  data: {
    customer_id?: string;
    vehicle_id?: string | null;
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

  return { success: true, message: "Booking updated." };
}

export async function createReferenceBooking(data: {
  customer_id: string;
  vehicle_id?: string | null;
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

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id ?? null,
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
  return { success: true, message: "Booking status updated." };
}

export async function deleteBooking(id: string): Promise<BookingActionResult> {
  const { supabase } = await requireAdmin();

  await supabase.from("booking_services").delete().eq("booking_id", id);

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

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
  return { success: true, message: "Service removed from booking." };
}
