import { FeastWithMasses } from "@/common/getFeastsWithMasses";
import { Feast, VestmentColor } from "@/feast";
import { romanize } from '@/_components/Calendar/utils/romanize';
import { vestmentColorToTailwind } from '@/_components/Calendar/utils/vestmentColorToHex';
import {
  Column,
  Font,
  Head,
  Heading,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { addDays, isSunday, parse, parseISO, setHours } from "date-fns";
import { format } from "date-fns-tz";
import React from 'react';
import { Service as ServiceType } from "@/payload-types";
import { formatInPolishTime, polishTimeToUtc, createPolishDate } from "@/common/timezone";

const now = new Date();

const referenceDate = createPolishDate(2025, 3, 30); // March
const feastBase = { title: "Test Feast", color: VestmentColor.VIOLET, date: referenceDate, rank: 1 } as Feast;
const testFeasts: FeastWithMasses[] = [
  {
    ...feastBase,
    commemorations: ["Świętych Apostołów Piotra i Pawła"],
    masses: [
      { 
        date: createPolishDate(2025, 3, 30, 10).toISOString(),
        category: 'mass',
        massType: 'read',
        tenant: 'test-tenant',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as ServiceType,
      { 
        date: createPolishDate(2025, 3, 30, 11).toISOString(),
        category: 'mass',
        massType: 'silent', 
        notes: 'Msza w intencji zmarłych ofiarodawców',
        tenant: 'test-tenant',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as ServiceType,
      { 
        date: createPolishDate(2025, 3, 30, 12).toISOString(),
        category: 'other',
        customTitle: 'Nabożeństwo do świętego Józefa',
        notes: 'Po Mszy Św. odbędzie się nabożeństwo do świętego Józefa',
        tenant: 'test-tenant',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as ServiceType,
    ],
  },
  {
    ...{
      ...feastBase,
      date: addDays(referenceDate, 1),
      color: VestmentColor.RED,
      commemorations: ["Świętego Józefa"],
    },
    masses: [],
  },
  {
    ...{
      ...feastBase,
      date: addDays(referenceDate, 2),
      color: VestmentColor.GREEN,
      commemorations: ["Świętego Alfonsa Lwówskiego"],
    },
    masses: [
      { 
        date: createPolishDate(2025, 4, 1, 12).toISOString(),
        category: 'mass',
        massType: 'solemn',
        tenant: 'test-tenant',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as ServiceType,
    ],
  },
];

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

const MassesList: React.FC<{ feastsWithMasses: FeastWithMasses[] }> = ({ feastsWithMasses }) => {
  return (
    <Section style={{ margin: "0", padding: 0 }}>
      {feastsWithMasses.map((feast, feastIndex) => {
        const dayNum = formatInPolishTime(feast.date, 'd');
        const dayName = formatInPolishTime(feast.date, 'EEEE');
        const monthName = formatInPolishTime(feast.date, 'MMMM');
        const commemoration = feast.commemorations?.[0];
        const vestmentColor = vestmentColorToTailwind(feast.color as VestmentColor);

        return (
          <Section key={`${feastIndex}-${dayNum}-${monthName}`} className="rounded-md bg-[#f8f9fa] px-4 pb-2 mt-4">
            <Heading as="h3" style={{ fontSize: "18px", color: isSunday(feast.date) ? '#C62828' : "#333", marginBottom: "6px", fontWeight: 700 }}>
                {dayNum} {monthName}, {dayName}
            </Heading>
            
            <Text className="text-[#333] font-medium text-base mb-0 mt-0">
              {feast.title}
            </Text>
            
            {commemoration && (
              <Text className="text-[#333] font-medium text-base mb-0 mt-0">
                {commemoration}
              </Text>
            )}
            
            <Text style={{ fontSize: "14px", color: "#555", margin: "0" }}>
              {romanize(feast.rank)} klasy · kolor szat:&nbsp;
              <span className={`${vestmentColor}`}>{feast.color}</span>
            </Text>
            
            <Section>
              {feast.masses.length === 0 ? (
                <Text className="text-[#4B5563]">
                  Brak nabożeństw tego dnia.
                </Text>
              ) : (
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.5em" }}>
                  <tbody>
                    {feast.masses.map((service, idx) => (
                      <tr key={idx}>
                        <td style={{ whiteSpace: "nowrap", verticalAlign: "top", width: "50px" }}>
                          <Text className="my-0 font-semibold">{formatInPolishTime(service.date, "HH:mm")}</Text>
                        </td>
                        <td>
                          <Text className="my-0">{getServiceTitle(service)}</Text>
                          <Text className="text-[#6B7280] my-0 text-sm leading-tight">{service.notes ?? ''}</Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
          </Section>
        );
      })}
    </Section>
  );
};

export default function Email({
  title = "Pastoral Announcements (DD.MM.YYYY)",
  content_html = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br /> Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
  slogan = "Ad maiorem Dei gloriam!",
  copyright = "city.fsspx.pl",
  feastsWithMasses = testFeasts,
}: {
  title: string;
  content_html: string;
  copyright: string;
  slogan: string;
  feastsWithMasses: FeastWithMasses[];
}) {
  const currentYear = now.getFullYear();

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Helvetica"
          fallbackFontFamily={["Arial", "sans-serif"]}
          fontStyle="normal"
        />
        <style>
          {`
            body {
              font-size: 16px;
            }
          `}
        </style>
      </Head>
      <Tailwind>
        <Section style={{ marginTop: "40px", width: "100%" }}>
          <Img
            style={{ margin: "0 auto" }}
            src="https://poznan.fsspx.pl/api/media/file/long-1.png"
            width="342"
            height="50"
            alt={`${copyright} - logo`}
          />
          <Text
            style={{
              fontSize: "24px",
              fontWeight: 600,
              paddingTop: "12px",
              textAlign: "center",
            }}
          >
            {title ?? "Pastoral Announcements (DD.MM.YYYY)"}
          </Text>
        </Section>
        <Section
          style={{
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: content_html }} />
        </Section>

        <Section className="px-4">
          <Heading as="h2" style={{ fontSize: "24px", color: "#333", marginBottom: "0", borderBottom: "1px solid #eee", fontWeight: 400 }}>
            Plan nabożeństw
          </Heading>
          <MassesList feastsWithMasses={feastsWithMasses} />
        </Section>

        <Section style={{ marginTop: "40px" }}>
          <Section style={{ backgroundColor: "#f3f4f6", padding: "24px" }}>
            <Row>
              <Img
                src="https://poznan.fsspx.pl/api/media/file/short.png"
                width="163"
                height="50"
                alt="FSSPX Logo"
              />
            </Row>
            <Row>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#4B5563",
                }}
              >
                {slogan}
              </Text>
            </Row>
          </Section>
          <Section style={{ backgroundColor: "#e5e7eb", padding: "12px 0" }}>
            <Row>
              <Column style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#6B7280",
                    marginBottom: "4px",
                  }}
                >
                  © {currentYear} - {copyright}
                </Text>
                <Img
                  src="https://poznan.fsspx.pl/api/media/file/favicon.png"
                  width="16"
                  height="25"
                  alt="Heart with Cross"
                  style={{ margin: "0 auto" }}
                />
              </Column>
            </Row>
          </Section>
        </Section>
      </Tailwind>
    </Html>
  );
}