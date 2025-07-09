import { FeastWithMasses } from "@/_components/Calendar";
import { Media as MediaType, Tenant } from "@/payload-types";
import { formatInPolishTime } from "@/common/timezone";
import { romanize } from "@/_components/Calendar/utils/romanize";
import { vestmentColorToTailwind } from "@/_components/Calendar/utils/vestmentColorToHex";
import { VestmentColor } from "@/feast";
import { Service as ServiceType } from "@/payload-types";
import React from "react";
import { DateDisplay } from "./DateDisplay";
import { Media } from "@/_components/Media";

interface PrintableAnnouncementsProps {
  title: string;
  content_html: string;
  feastsWithMasses: FeastWithMasses[];
  tenant: Tenant | null;
}

const getServiceTitle = (service: ServiceType) => {
  if (service.category === 'mass' && service.massType) {
    const massTypeMap = {
      'sung': 'śpiewana',
      'read': 'czytana',
      'silent': 'cicha',
      'solemn': 'solenna'
    } as const;
    return `Msza św. ${massTypeMap[service.massType]}`;
  }
  return service.customTitle || '';
};

const PrintableMassesList: React.FC<{ feastsWithMasses: FeastWithMasses[] }> = ({ feastsWithMasses }) => {

  const DayCell: React.FC<{ feast: FeastWithMasses }> = ({ feast }) => {
    const commemoration = feast.commemorations?.[0];
    const vestmentColor = vestmentColorToTailwind(feast.color as VestmentColor);

    return (
      <div className="p-4">
        <div className="flex w-full">
          <div className="flex-1 pr-2">
            {/* Left side - Feast content */}
            <h3 className="text-gray-900 font-semibold mb-1 mt-0 leading-tight">
              {feast.title}
            </h3>
            
            {commemoration && (
              <p className="text-gray-900 font-medium mb-1 mt-0 leading-tight">
                {commemoration}
              </p>
            )}
            
            <p className="text-sm text-gray-600 pb-2 m-0">
              {romanize(feast.rank)} klasy · kolor szat:&nbsp;
              <span className={`${vestmentColor}`}>{feast.color}</span>
            </p>
            
            {feast.masses.length === 0 ? (
              <p className="text-gray-500 text-sm mt-2">
                Brak nabożeństw tego dnia.
              </p>
            ) : (
              <div className="mt-2">
                {feast.masses.map((service, idx) => (
                  <div key={idx} className="flex items-baseline">
                    <div className="w-12 flex-shrink-0 pr-2">
                      <span className="text-sm font-semibold">{formatInPolishTime(service.date, "HH:mm")}</span>
                    </div>
                    <div className="flex-1">
                        <p className="m-0 text-sm">{getServiceTitle(service)}</p>
                      {service.notes && (
                        <p className="text-gray-500 m-0 text-xs leading-tight">{service.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DateDisplay date={feast.date} className="w-12" />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {feastsWithMasses.map((feast, index) => (
        <div key={index} className="bg-gray-50 rounded">
          <DayCell feast={feast} />
        </div>
      ))}
    </div>
  );
};

export function PrintableAnnouncements({
  title,
  feastsWithMasses,
  tenant,
}: PrintableAnnouncementsProps) {
  const coverImage = tenant?.coverBackground as MediaType;

  return (
    <div className="h-full bg-white">
      <div className="h-full flex flex-col space-y-3">
        {/* Hero Tile */}
        <div 
          className="w-full h-48 bg-gray-50 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
            <Media
              resource={coverImage}
              fill
            />
          <div className="absolute inset-0 bg-white bg-opacity-70"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-2xl font-extrabold mb-1 text-gray-900">Plan nabożeństw</h1>
            <p className="text-lg font-semibold text-gray-700">
              {tenant?.city} - {tenant?.type} {tenant?.patron}
            </p>
          </div>
        </div>

        {/* Masses Schedule Tile */}
        <div className="flex-1 min-h-0">
          <div className="overflow-hidden h-full">
            <PrintableMassesList feastsWithMasses={feastsWithMasses} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-2 flex-shrink-0">
          <p>© {new Date().getFullYear()} - {tenant?.domain || 'fsspx.pl'} • Ad maiorem Dei gloriam!</p>
        </div>
      </div>
    </div>
  );
} 