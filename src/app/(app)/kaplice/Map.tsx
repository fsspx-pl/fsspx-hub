"use client";

import { Tenant } from "@/payload-types";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Custom red marker icon
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  tenants: Array<Tenant & { coordinates?: [number, number] }>;
  selectedTenantId: string | null;
  onMarkerClick: (tenantId: string) => void;
}

function MapController({
  selectedTenant,
}: {
  selectedTenant: (Tenant & { coordinates?: [number, number] }) | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedTenant?.coordinates) {
      map.setView(selectedTenant.coordinates, 13, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedTenant, map]);

  return null;
}

export function Map({ tenants, selectedTenantId, onMarkerClick }: MapProps) {
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  // Calculate center of Poland if no tenants
  const center: [number, number] = [52.0, 19.0];
  const zoom = tenants.length > 0 ? 6 : 6;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tenants.map((tenant) => {
          if (!tenant.coordinates) return null;

          return (
            <Marker
              key={tenant.id}
              position={tenant.coordinates}
              icon={selectedTenantId === tenant.id ? redIcon : undefined}
              eventHandlers={{
                click: () => onMarkerClick(tenant.id),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold mb-1">{tenant.city}</h3>
                  {tenant.patron && <p className="text-gray-600 mb-1">{tenant.patron}</p>}
                  {tenant.address?.street && (
                    <p className="text-gray-600">
                      {tenant.address.street}
                      {tenant.address.zipcode && `, ${tenant.address.zipcode}`}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        <MapController selectedTenant={selectedTenant} />
      </MapContainer>
    </div>
  );
}
