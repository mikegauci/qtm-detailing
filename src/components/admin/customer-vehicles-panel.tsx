"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AddVehicleForm } from "@/components/admin/add-vehicle-form";
import { VehiclePhotoField } from "@/components/admin/vehicle-photo-field";
import type { Tables } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Vehicle = Tables<"vehicles">;

export function formatVehicleLabel(vehicle: Pick<Vehicle, "make" | "model">) {
  return [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Unnamed";
}

export function formatVehicleLabels(
  vehicles: Pick<Vehicle, "make" | "model">[],
) {
  return vehicles.map(formatVehicleLabel).join(", ");
}

type BaseProps = {
  customerId: string;
  vehicles: Vehicle[];
  idPrefix?: string;
  onUpdated?: () => void;
};

type ManageProps = BaseProps & {
  mode: "manage";
  onDeleteVehicle: (vehicleId: string) => void;
  deleteDisabled?: boolean;
};

type AssignProps = BaseProps & {
  mode: "assign";
  assignedVehicleIds: string[];
  onAssign: (
    vehicleId: string,
    source: "select" | "add",
  ) => void | Promise<void>;
  onUnassign: (vehicleId: string) => void | Promise<void>;
  assignDisabled?: boolean;
};

export function CustomerVehiclesPanel(props: ManageProps | AssignProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingVehicles, setPendingVehicles] = useState<
    Pick<Vehicle, "id" | "make" | "model">[]
  >([]);

  useEffect(() => {
    setPendingVehicles((current) =>
      current.filter(
        (pending) => !props.vehicles.some((vehicle) => vehicle.id === pending.id),
      ),
    );
  }, [props.vehicles]);

  const vehiclesForAssign = useMemo(() => {
    if (props.mode !== "assign") {
      return props.vehicles;
    }

    const knownIds = new Set(props.vehicles.map((vehicle) => vehicle.id));
    const extras = pendingVehicles.filter((pending) => !knownIds.has(pending.id));
    return [...props.vehicles, ...extras];
  }, [props.mode, props.vehicles, pendingVehicles]);

  async function handleVehicleAdded(id: string, label: string) {
    setShowAddForm(false);
    if (props.mode === "assign") {
      setPendingVehicles((current) => {
        if (current.some((vehicle) => vehicle.id === id)) {
          return current;
        }
        return [...current, { id, make: label, model: null }];
      });
      await props.onAssign(id, "add");
    }
    props.onUpdated?.();
  }

  const addForm = showAddForm ? (
    <AddVehicleForm
      customerId={props.customerId}
      idPrefix={props.idPrefix ?? "vehicle"}
      onSuccess={async ({ id, label }) => {
        await handleVehicleAdded(id, label);
      }}
      onCancel={() => setShowAddForm(false)}
    />
  ) : null;

  if (props.mode === "manage") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vehicles</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {addForm}

          {props.vehicles.length ? (
            <ul className="divide-y divide-white/10">
              {props.vehicles.map((vehicle) => (
                <li
                  key={vehicle.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0"
                >
                  <div className="flex gap-4">
                    <VehiclePhotoField
                      vehicleId={vehicle.id}
                      customerId={props.customerId}
                      photoUrl={vehicle.photo_url}
                      label={formatVehicleLabel(vehicle)}
                      onUpdated={props.onUpdated}
                    />
                    <div>
                      <p className="font-medium text-white">
                        {formatVehicleLabel(vehicle)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => props.onDeleteVehicle(vehicle.id)}
                    disabled={props.deleteDisabled}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            !showAddForm && (
              <p className="text-sm text-white/50">No vehicles on file.</p>
            )
          )}
        </CardContent>
      </Card>
    );
  }

  const assignedVehicles = vehiclesForAssign.filter((vehicle) =>
    props.assignedVehicleIds.includes(vehicle.id),
  );
  const unassignedVehicles = vehiclesForAssign.filter(
    (vehicle) => !props.assignedVehicleIds.includes(vehicle.id),
  );

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <Label>Vehicles</Label>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Done" : "Add vehicle"}
        </Button>
      </div>

      {assignedVehicles.length ? (
        <ul className="divide-y divide-white/10">
          {assignedVehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="flex items-center justify-between py-2 first:pt-0"
            >
              <p className="text-white">{formatVehicleLabel(vehicle)}</p>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => void props.onUnassign(vehicle.id)}
                disabled={props.assignDisabled}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        !showAddForm && (
          <p className="text-white/50">No vehicles assigned.</p>
        )
      )}

      {addForm}

      {!showAddForm && unassignedVehicles.length > 0 && (
        <Select
          value="placeholder"
          onValueChange={(value) => {
            if (value !== "placeholder") {
              void props.onAssign(value, "select");
            }
          }}
          disabled={props.assignDisabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Add existing vehicle..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder" disabled>
              Add existing vehicle...
            </SelectItem>
            {unassignedVehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {formatVehicleLabel(vehicle)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
