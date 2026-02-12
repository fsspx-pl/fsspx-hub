"use client";

import { Tenant } from "@/payload-types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LocationCard } from "./LocationCard";

const Map = dynamic(() => import("./Map").then((mod) => ({ default: mod.Map })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
      <div className="text-[var(--text-secondary)]">Ładowanie mapy...</div>
    </div>
  ),
});

interface KapliceViewProps {
  tenants: Tenant[];
}

interface TenantWithCoordinates extends Tenant {
  coordinates?: [number, number];
}

export function KapliceView({ tenants }: KapliceViewProps) {
  const [tenantsWithCoords, setTenantsWithCoords] = useState<TenantWithCoordinates[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  useEffect(() => {
    const geocodeTenants = async () => {
      const geocoded = await Promise.all(
        tenants.map(async (tenant) => {
          if (!tenant.address?.street || !tenant.city) {
            return tenant;
          }

          try {
            const address = `${tenant.address.street}, ${tenant.address.zipcode} ${tenant.city}, Poland`;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
              return {
                ...tenant,
                coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
              };
            }
          } catch (error) {
            console.error(`Failed to geocode ${tenant.name}:`, error);
          }

          return tenant;
        })
      );

      setTenantsWithCoords(geocoded);
    };

    geocodeTenants();
  }, [tenants]);

  const selectedTenant = tenantsWithCoords.find((t) => t.id === selectedTenantId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] min-h-[600px] border-t border-[var(--bg-secondary)]">
      {/* Left Section - Location List */}
      <div className="flex-1 lg:w-1/2 overflow-y-auto bg-[var(--bg-primary)] border-r border-[var(--bg-secondary)]">
        <div className="p-6 lg:p-8">
          <h1 className="text-4xl lg:text-5xl font-serif mb-8 text-[var(--text-heading)]">
            Kaplice w Polsce
          </h1>
          <div className="space-y-4">
            {tenantsWithCoords.length === 0 ? (
              <div className="text-[var(--text-secondary)]">Ładowanie lokalizacji...</div>
            ) : (
              tenantsWithCoords.map((tenant) => (
                <LocationCard
                  key={tenant.id}
                  tenant={tenant}
                  isSelected={selectedTenantId === tenant.id}
                  onClick={() => setSelectedTenantId(tenant.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Map */}
      <div className="flex-1 lg:w-1/2 h-[400px] lg:h-auto relative">
        <Map
          tenants={tenantsWithCoords.filter((t) => t.coordinates)}
          selectedTenantId={selectedTenantId}
          onMarkerClick={setSelectedTenantId}
        />
      </div>
    </div>
  );
}
