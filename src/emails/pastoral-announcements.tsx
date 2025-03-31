import { FeastWithMasses } from "@/common/getFeastsWithMasses";
import { VestmentColor } from "@/feast";
import { romanize } from '@/_components/Calendar/utils/romanize';
import { vestmentColorToTailwind } from '@/_components/Calendar/utils/vestmentColorToHex';
import { getMassLabel } from '@/_components/Calendar/utils/getMassLabel';
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
import { format, parse } from "date-fns";
import { pl } from 'date-fns/locale';
import React from 'react';

const testFeasts: FeastWithMasses[] = [
  {
    ...{ id: "1", title: "Test Feast", color: VestmentColor.VIOLET, date: parse("2025-01-01", "yyyy-MM-dd", new Date()), rank: 1 },
    masses: [{ time: "10:00", type: 'read', id: "1", tenant: "1", updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
  },
];

// MassesList component to display masses for each feast
const MassesList: React.FC<{ feastsWithMasses: FeastWithMasses[] }> = ({ feastsWithMasses }) => {
  if (feastsWithMasses.length === 0) {
    return <div>Brak nabożeństw tego dnia.</div>;
  }
  
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
            <Heading as="h3" style={{ fontSize: "18px", color: "#333", marginTop: "24px", marginBottom: "8px", fontWeight: 500 }}>
              <Text style={{ color: dayName === 'niedziela' ? '#C62828' : '#333', fontWeight: 600 }}>
                {dayNum} {monthName}, {dayName}
              </Text>
            </Heading>
            
            <Text style={{ fontSize: "16px", color: "#333", fontWeight: 500, margin: "10px 0 5px 0" }}>
              {feast.title}
            </Text>
            
            {commemoration && (
              <Text style={{ fontSize: "16px", color: "#333", fontWeight: 500, margin: "10px 0 5px 0" }}>
                {commemoration}
              </Text>
            )}
            
            <Text style={{ fontSize: "14px", color: "#555", margin: "0 0 15px 0", fontWeight: 200 }}>
              święto {romanize(feast.rank)} klasy · kolor szat:{" "}
              <span style={{ color: vestmentColor }}>{feast.color}</span>
            </Text>
            
            {feast.masses.length === 0 ? (
              <Text style={{ padding: "15px", backgroundColor: "#f8f9fa", color: "#4B5563", textAlign: "center" }}>
                Brak nabożeństw tego dnia.
              </Text>
            ) : (
              <Section>
                {feast.masses.map((service, idx) => (
                  <Row key={idx} style={{ padding: "12px 0", borderTop: "1px dotted #eee" }}>
                    <Column>
                      <Text style={{ color: "#4B5563" }}>{getMassLabel(service.type, service.time)}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            )}
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
  feastsWithMasses = [],
}: {
  title: string;
  content_html: string;
  copyright: string;
  slogan: string;
  feastsWithMasses: FeastWithMasses[];
}) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Helvetica"
          fallbackFontFamily={["Arial", "sans-serif"]}
          fontWeight={200}
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
              paddingBottom: "24px",
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
            color: "#4B5563",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: content_html }} />
        </Section>

        <Section style={{ paddingLeft: "24px", paddingRight: "24px" }}>
          <Heading as="h2" style={{ fontSize: "24px", color: "#333", marginBottom: "20px", paddingBottom: "8px", borderBottom: "1px solid #eee", fontWeight: 400 }}>
            Plan nabożeństw
          </Heading>
            { feastsWithMasses.length > 0 ? (
                <MassesList feastsWithMasses={feastsWithMasses} />
            ) : (
                <div>Brak nabożeństw tego dnia.</div>
            )}
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