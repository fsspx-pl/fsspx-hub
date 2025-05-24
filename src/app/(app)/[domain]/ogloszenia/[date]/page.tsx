import { fetchSettings } from "@/_api/fetchGlobals";
import { fetchLatestPage, fetchTenantPageByDate } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { BreadcrumbItem, Breadcrumbs } from "@/_components/Breadcrumbs";
import { Calendar, FeastWithMasses } from "@/_components/Calendar";
import { FeastDataProvider } from "@/_components/Calendar/context/FeastDataContext";
import { Gutter } from "@/_components/Gutter";
import { NewMediumImpact } from "@/_components/_heros/NewMediumImpact";
import { Media, Page as PageType, Settings, Tenant, User } from "@/payload-types";
import { format, parse, parseISO } from "date-fns";
import { Metadata } from "next";
import { getFeastsWithMasses } from "../../../../../common/getFeastsWithMasses";
import { formatAuthorName } from "../../../../../utilities/formatAuthorName";
import { enhanceFirstLetterInContent } from "./enhanceFirstLetterInContent";
import { garamond } from "@/fonts";
import Script from "next/script";
import { SenderForm } from "./SenderForm";

export async function generateStaticParams() {
  const tenants = await fetchTenants();
  const params = [];

  for (const tenant of tenants.filter((tenant) => tenant.domain)) {
    const latestPost = await fetchLatestPage(tenant.domain.split('.')[0]);
    if (latestPost?.createdAt) {
      const date = format(new Date(latestPost.createdAt), 'dd-MM-yyyy');
      params.push({
        domain: tenant.domain,
        date: date,
      });
    }
  }
  
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; date: string }>;
}): Promise<Metadata | null> {
  const { domain } = await params;
  const [subdomain] = domain.split(".");

  let settings: Settings | null = null;
  let tenant: Tenant | null = null;

  try {
    settings = await fetchSettings();
    tenant = await fetchTenant(subdomain);
  } catch (error) {
    console.error(error);
  }

  if (!tenant) return null;
  if (!settings?.copyright) return null;

  const copyright = settings?.copyright || "";
  const location = tenant
    ? `${tenant.city} - ${tenant.type} ${tenant.patron}`
    : "";
  const title = `${copyright} - ${location}`;
  return {
    title,
  };
}

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ domain: string; date: string }>;
}) {
  const now = new Date(); 
  const { domain, date } = await params;
  const isoDate = parse(date, 'dd-MM-yyyy', now).toISOString();
  const page = await fetchTenantPageByDate(domain, isoDate);
  const serverNow = now.toISOString();

  if (!page?.content_html) return null;

  const enhancedContentHtml = enhanceFirstLetterInContent(page.content_html, garamond);

  const tenant = page.tenant ? page.tenant as Tenant : null;
  const period = page?.period ? page.period as PageType['period'] : null;
  const feastsWithMasses: FeastWithMasses[] = period && tenant ? await getFeastsWithMasses(period, tenant) : [];
  const breadcrumbs: BreadcrumbItem[] = tenant ? getBreadcrumbs(tenant, page.title, period?.start as string) : [];

  const user = page.author ? page.author as User : null;
  const author = formatAuthorName(user);
  const authorAvatar = user?.avatar 
    ? user.avatar as Media 
    : null;

  return (
    <>
      <Script id="sender-universal">
        {`
          (function (s, e, n, d, er) {
            s['Sender'] = er;
            s[er] = s[er] || function () {
              (s[er].q = s[er].q || []).push(arguments)
            }, s[er].l = 1 * new Date();
            var a = e.createElement(n),
                m = e.getElementsByTagName(n)[0];
            a.async = 1;
            a.src = d;
            m.parentNode.insertBefore(a, m)
          })(window, document, 'script', 'https://cdn.sender.net/accounts_resources/universal.js', 'sender');
          sender('f511ddc3f98190')
        `}
      </Script>
      <Script id="sender-explicit">
        {`
  if (!window.senderFormsLoaded) {
    window.addEventListener("onSenderFormsLoaded", function () {
      senderForms.render('b82BgW', {
        onRender: (formId) => {
          debugger
          const formElement = document.querySelector('.sender-form-field');
          if (!formElement) return;
          const iframe = formElement.querySelector('iframe');
          if (!iframe) return;
          iframe.style.width = '100%';
        }
      })
    });
  }
        `}
</Script>
      <Gutter className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </Gutter>
      <NewMediumImpact
        image={tenant?.coverBackground as Media}
        title={page.title}
        author={author}
        authorAvatar={authorAvatar}
        createdAt={page.createdAt}
        updatedAt={page.updatedAt}
      />
      <Gutter className="mt-4 py-6 flex flex-col gap-8 lg:gap-12 md:flex-row">
        <div className="md:order-2 self-center md:self-auto w-full md:w-auto md:basis-1/3 justify-between">
          <FeastDataProvider
            initialFeasts={feastsWithMasses}
            initialDate={feastsWithMasses.length > 0 ? now.toISOString() : serverNow}
          >
            <Calendar />
          </FeastDataProvider>
        </div>
        <div>
        <div
          className="overflow-auto flex-1 prose prose-lg max-w-none text-justify md:text-left"
          dangerouslySetInnerHTML={{ __html: enhancedContentHtml }}
        >
        </div>
        <SenderForm />
        </div>
      </Gutter>
    </>
  );
}

function getBreadcrumbs(tenant: Tenant, title: string, date: string): BreadcrumbItem[] {
  return [
    {
      label: "Kaplice",
      disabled: true,
    },
    {
      label: tenant.city,
      href: "..",
    },
    {
      label: "Ogłoszenia",
      href: "..",
    },
    {
      label: `${title} (${format(parseISO(date), 'dd.MM.yyyy')})`,
      href: "",
    },
  ];
} 