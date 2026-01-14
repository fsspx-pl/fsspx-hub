import { FeastWithMasses } from "@/_components/Calendar";
import { Announcement, Media as MediaType, Tenant } from "@/payload-types";
import { formatInPolishTime } from "@/common/timezone";
import { romanize } from "@/_components/Calendar/utils/romanize";
import { vestmentColorToTailwind } from "@/_components/Calendar/utils/vestmentColorToHex";
import { VestmentColor } from "@/feast";
import { Service as ServiceType } from "@/payload-types";
import React from "react";
import { Media } from "@/_components/Media";
import { garamond } from "@/fonts";
import { RichText } from "@/_components/RichText";
import { DateDisplay } from "./DateDisplay";
import { AnnouncementAttachments } from "@/_components/AnnouncementAttachments";

interface PrintableAnnouncementsProps {
  title: string;
  content: any;
  feastsWithMasses: FeastWithMasses[];
  tenant: Tenant | null;
  attachments?: MediaType[];
  attachmentDisplay?: Announcement['attachmentDisplay'];
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
              {romanize(feast.rank)} klasy · kolor dnia:&nbsp;
              <span className={`${vestmentColor}`}>{feast.color}</span>
            </p>
            
            {feast.masses.length === 0 ? (
              <p className="text-gray-500 text-sm mt-2">
                Dla tego dnia nie zostały opublikowane żadne nabożeństwa.
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
        <div key={index} className="bg-gray-50 rounded print-day-block">
          <DayCell feast={feast} />
        </div>
      ))}
    </div>
  );
};

export function PrintableAnnouncements({
  title,
  content,
  feastsWithMasses,
  tenant,
  attachments = [],
  attachmentDisplay,
}: PrintableAnnouncementsProps) {
  const coverImage = tenant?.coverBackground as MediaType;
  const showAttachmentsAtBottom = attachmentDisplay?.displayMode === 'collect-bottom';

  return (
    <div className="bg-white">
      {/* First Page - Masses Schedule */}
      <div className="print-page">
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
              <h1 className={`text-4xl font-extrabold mb-1 text-gray-900 ${garamond.className}`}>Plan nabożeństw</h1>
              <p className="text-lg font-medium text-gray-700">
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
        </div>
      </div>

      {/* Second Page - Pastoral Announcements */}
      <div className="print-page page-break">
        <div className="h-full flex flex-col space-y-6">
          {/* Hero Tile for Pastoral Announcements */}
          <div 
            className="w-full h-48 bg-gray-50 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
              <Media
                resource={coverImage}
                fill
              />
            <div className="absolute inset-0 bg-white bg-opacity-70"></div>
            <div className="relative z-10 text-center">
              <h1 className={`text-4xl font-extrabold mb-1 text-gray-900 ${garamond.className}`}>Ogłoszenia duszpasterskie</h1>
              <p className="text-lg font-medium text-gray-700">
                {tenant?.city} - {tenant?.type} {tenant?.patron}
              </p>
            </div>
          </div>

          {/* Pastoral Announcements Content */}
          <div className="flex-1 min-h-0">
            <div className="overflow-hidden h-full">
              <div className="prose prose-lg max-w-none text-left prose-a:no-underline">
                <RichText data={content} hideAttachments={showAttachmentsAtBottom} />
              </div>
              {showAttachmentsAtBottom && attachments.length > 0 && (
                <div className="mt-4 print:mt-2">
                  <AnnouncementAttachments attachments={attachments} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 