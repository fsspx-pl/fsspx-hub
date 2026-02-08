"use client";

import { Tenant } from "@/payload-types";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface LocationCardProps {
  tenant: Tenant;
  isSelected?: boolean;
  onClick?: () => void;
}

export function LocationCard({ tenant, isSelected, onClick }: LocationCardProps) {
  const getImageUrl = (): string | null => {
    if (!tenant.coverBackground) return null;
    if (typeof tenant.coverBackground === "string") return null;
    const media = tenant.coverBackground as { url?: string };
    return media?.url || null;
  };

  const coverImage = getImageUrl();

  const tenantUrl = tenant.domain ? `/${tenant.domain}` : "#";

  return (
    <div
      className={`
        bg-[var(--bg-secondary)] rounded-lg p-4 cursor-pointer transition-all
        ${isSelected ? "ring-2 ring-[var(--color-primary)]" : "hover:shadow-lg"}
      `}
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Image */}
        {coverImage && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={coverImage}
              alt={tenant.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={tenantUrl}
              className="font-bold text-lg text-[var(--text-heading)] hover:text-[var(--color-primary)] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {tenant.city}
            </Link>
            <div className="flex gap-2 flex-shrink-0">
              {tenant.type && (
                <span
                  className={`
                    px-2 py-1 text-xs font-semibold rounded text-white
                    ${
                      tenant.type === "Kaplica"
                        ? "bg-yellow-600 dark:bg-yellow-700"
                        : "bg-pink-600 dark:bg-pink-700"
                    }
                  `}
                >
                  {tenant.type.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {tenant.patron && (
            <p className="text-sm text-[var(--text-primary)] mb-2">{tenant.patron}</p>
          )}

          {tenant.address?.street && (
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {tenant.address.street}
              {tenant.address.zipcode && `, ${tenant.address.zipcode} ${tenant.city}`}
            </p>
          )}

          <div className="flex flex-col gap-1">
            {tenant.address?.email && (
              <a
                href={`mailto:${tenant.address.email}`}
                className="flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-4 h-4" />
                {tenant.address.email}
              </a>
            )}

            {tenant.address?.phone && (
              <a
                href={`tel:${tenant.address.phone}`}
                className="flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-4 h-4" />
                {tenant.address.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
