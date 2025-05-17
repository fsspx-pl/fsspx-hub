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
import { addDays, format, isSunday, parse, setHours } from "date-fns";
import { pl } from 'date-fns/locale';
import React from 'react';
import { Service as ServiceType } from "@/payload-types";

const now = new Date();
const getMassTime = (time: string) => {
  return parse(time, "HH:mm", now).toISOString();
}

const referenceDate = parse("2025-03-30", "yyyy-MM-dd", now); // sunday
const feastBase = { title: "Test Feast", color: VestmentColor.VIOLET, date: referenceDate, rank: 1 } as Feast;
const testFeasts: FeastWithMasses[] = [
  {
    ...feastBase,
    commemorations: ["Świętych Apostołów Piotra i Pawła"],
    masses: [
      { 
        date: setHours(referenceDate, 10).toISOString(),
        category: 'mass',
        massType: 'read',
        tenant: 'test-tenant',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as ServiceType,
      { 
        date: setHours(referenceDate, 11).toISOString(),
        category: 'mass',
        massType: 'silent', 
        notes: 'Msza w intencji zmarłych ofiarodawców',
        tenant: 'test-tenant',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as ServiceType,
      { 
        date: setHours(referenceDate, 12).toISOString(),
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
        date: setHours(referenceDate, 12).toISOString(),
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
    return `Msza Św. ${massTypeMap[service.massType]}`;
  }
  return service.customTitle || '';
};

const MassesList: React.FC<{ feastsWithMasses: FeastWithMasses[] }> = ({ feastsWithMasses }) => {
  return (
    <Section style={{ margin: "0", padding: 0 }}>
      {feastsWithMasses.map((feast, feastIndex) => {
        const dayNum = format(feast.date, 'd', { locale: pl });
        const dayName = format(feast.date, 'EEEE', { locale: pl });
        const monthName = format(feast.date, 'MMMM', { locale: pl });
        const commemoration = feast.commemorations?.[0];
        const vestmentColor = vestmentColorToTailwind(feast.color as VestmentColor);

        return (
          <Section key={`${feastIndex}-${dayNum}-${monthName}`}>
            <Heading as="h3" style={{ fontSize: "18px", color: "#333", marginTop: "24px", marginBottom: "24px", fontWeight: 500 }}>
              <Text className={`${isSunday(feast.date) ? 'text-[#C62828]' : 'text-[#333]'} font-bold text-base p-0`}>
                {dayNum} {monthName}, {dayName}
              </Text>
            </Heading>
            
            <Text className="text-[#333] font-medium text-base mb-0">
              {feast.title}
            </Text>
            
            {commemoration && (
              <Text className="text-[#333] font-medium text-base mb-0 mt-0">
                {commemoration}
              </Text>
            )}
            
            <Text style={{ fontSize: "14px", color: "#555", margin: "0 0 15px 0" }}>
              święto {romanize(feast.rank)} klasy · kolor szat:&nbsp;
              <span className={`${vestmentColor}`}>{feast.color}</span>
            </Text>
            
            <Section className="rounded-md bg-[#f8f9fa] px-4 py-2">
              {feast.masses.length === 0 ? (
                <Text className="text-[#4B5563]">
                  Brak nabożeństw tego dnia.
                </Text>
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 1em" }}>
                    <tbody>
                      {feast.masses.map((service, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "4px 0", whiteSpace: "nowrap", verticalAlign: "top", width: "50px" }}>
                            <Text className="my-0 font-semibold">{format(service.date, 'HH:mm')}</Text>
                          </td>
                          <td style={{ padding: "4px 0" }}>
                            <Text className="my-0">{getServiceTitle(service)}</Text>
                            <Text className="text-[#6B7280] my-0 text-sm mt-1 leading-tight">{service.notes ?? ''}</Text>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
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
            src="https://poznan.fsspx.pl/api/media/file/logo_fsspx.png"
            width="300"
            height="40"
            alt="FSSPX Logo"
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
            paddingLeft: "24px",
            paddingRight: "24px",
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
                src="https://poznan.fsspx.pl/api/media/file/logo_fsspx_short.png"
                width="108"
                height="40"
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