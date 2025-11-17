import {
    Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import React from 'react';
import { newsletterTranslations } from "@/_components/Newsletter/translations";

type NewsletterConfirmationEmailProps = {
  confirmationUrl: string;
  chapelInfo: string;
  copyright?: string;
  locale?: 'pl' | 'en';
};

export default function NewsletterConfirmationEmail({
  confirmationUrl,
  chapelInfo = 'Kaplica św. Jana Chrzciciela - Poznań',
  copyright = "city.fsspx.pl",
  locale = 'pl',
}: NewsletterConfirmationEmailProps) {
  const t = (key: keyof typeof newsletterTranslations.pl) => 
    newsletterTranslations[locale]?.[key] || newsletterTranslations.pl[key];

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
        <Container className="mx-auto w-full max-w-[600px] p-0">
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
                marginBottom: "0px",
                textAlign: "center",
                color: "#333",
                }}
            >
                {t('emailConfirmationTitle')}
            </Text>
            </Section>

            <Section
            style={{
                paddingLeft: "16px",
                paddingRight: "16px",
                paddingTop: "24px",
                paddingBottom: "24px",
            }}
            >
            <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "16px" }}>
                {t('emailConfirmationGreeting')} <strong>{chapelInfo}</strong>!
            </Text>
            
            <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "24px" }}>
                {t('emailConfirmationInstructions')}
            </Text>

            <Section style={{ margin: "30px 0", textAlign: "center" }}>
                <Link
                href={confirmationUrl}
                style={{
                    backgroundColor: "#C81910",
                    color: "#ffffff",
                    padding: "12px 24px",
                    textDecoration: "none",
                    borderRadius: "4px",
                    display: "inline-block",
                    fontWeight: 500,
                }}
                >
                {t('emailConfirmationButton')}
                </Link>
            </Section>

            <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "12px" }}>
                {t('emailConfirmationFallback')}
            </Text>
            
            <Text style={{ 
                wordBreak: "break-all", 
                color: "#666", 
                fontSize: "12px",
                fontFamily: "monospace",
                backgroundColor: "#f3f4f6",
                padding: "8px",
                borderRadius: "4px",
                marginBottom: "24px",
            }}>
                {confirmationUrl}
            </Text>

            <Text style={{ 
                marginTop: "30px", 
                fontSize: "12px", 
                color: "#666",
                lineHeight: "1.6",
            }}>
                {t('emailConfirmationDisclaimer')} <strong>{chapelInfo}</strong>, {t('emailConfirmationIgnore')}
            </Text>
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
                    Ad maiorem Dei gloriam!
                </Text>
                </Row>
            </Section>
            <Section style={{ backgroundColor: "#e5e7eb", padding: "12px 0" }}>
                <Row>
                <Section style={{ textAlign: "center" }}>
                    <Text
                    style={{
                        fontSize: "14px",
                        color: "#6B7280",
                        marginBottom: "4px",
                    }}
                    >
                    © {new Date().getFullYear()} - {copyright}
                    </Text>
                    <Img
                    src="https://poznan.fsspx.pl/api/media/file/favicon.png"
                    width="16"
                    height="25"
                    alt="Heart with Cross"
                    style={{ margin: "0 auto" }}
                    />
                </Section>
                </Row>
            </Section>
            </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}

