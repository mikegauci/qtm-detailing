import { getRelation } from "@/lib/admin/supabase-relations";

type VehicleRow = { make: string | null; model: string | null };

type BookingVehicleRelation = {
  vehicles: VehicleRow | VehicleRow[] | null;
};

export function getVehiclesFromBookingRelation(
  bookingVehicles: BookingVehicleRelation[] | null | undefined,
): VehicleRow[] {
  return (bookingVehicles ?? [])
    .map((row) => getRelation(row.vehicles))
    .filter((vehicle): vehicle is VehicleRow => Boolean(vehicle));
}

export function formatBookingVehiclesLabel(
  bookingVehicles: BookingVehicleRelation[] | null | undefined,
): string {
  const vehicles = getVehiclesFromBookingRelation(bookingVehicles);
  if (!vehicles.length) return "—";
  return vehicles
    .map((vehicle) => [vehicle.make, vehicle.model].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(", ") || "—";
}
