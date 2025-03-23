import {
  Html,
  Head,
  Font,
  Section,
  Text,
  Row,
  Column,
  Img,
} from "@react-email/components";

export default function Email({
  title = "Pastoral Announcements (DD.MM.YYYY)",
  content_html = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br /> Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
  slogan = "Ad maiorem Dei gloriam!",
  copyright = "city.fsspx.pl",
}: {
  title: string;
  content_html: string;
  copyright: string;
  slogan: string;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Helvetica"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
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
      <Section style={{ marginTop: "40px", width: "100%" }}>
        <Img
          style={{ margin: "0 auto" }}
          src="https://poznan.fsspx.pl/api/media/file/logo_fsspx.png"
          width="300"
          height="40"
          alt="FSSPX Logo"
        />
        <Text style={{ fontSize: "24px", fontWeight: 600, paddingTop: "12px", paddingBottom: "24px", textAlign: "center" }}>
          {title ?? 'Pastoral Announcements (DD.MM.YYYY)'}
        </Text>
      </Section>
      <Section style={{ paddingLeft: "24px", paddingRight: "24px", color: "#4B5563", fontFamily: "'Gothic A1', Arial, sans-serif", fontWeight: 200 }}>
        <div dangerouslySetInnerHTML={{ __html: content_html }} />
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
                fontWeight: 200,
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
                  fontFamily: "'Gothic A1', Arial, sans-serif",
                  fontWeight: 200,
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
    </Html>
  );
}
