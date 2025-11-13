import { fetchSettings } from '@/_api/fetchGlobals';
import { fetchTenant } from '@/_api/fetchTenants';
import { Media, Settings, Tenant } from '@/payload-types';
import Image from 'next/image';
import Link from 'next/link';

interface NewsletterStatusPageProps {
  subdomain: string;
  title: string;
  message: string;
  showWarning?: boolean;
}

export async function NewsletterStatusPage({
  subdomain,
  title,
  message,
  showWarning = false,
}: NewsletterStatusPageProps) {
  const tenant = await fetchTenant(subdomain);
  const settings = await fetchSettings();

  if (!tenant || !settings) {
    return null;
  }

  const copyright = settings.copyright || '';
  const slogan = settings.slogan || 'Ad maiorem Dei gloriam!';
  const chapelInfo = `${tenant.type} ${tenant.patron || ''} - ${tenant.city}`;

  // Get logo URLs - use Media component URLs or fallback
  // For now, using the same pattern as the email template
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const longLogoUrl = tenant.coverBackground && typeof tenant.coverBackground !== 'string' && (tenant.coverBackground as Media).url
    ? (tenant.coverBackground as Media).url
    : `${baseUrl}/api/media/file/long-1.png`;
  
  const shortLogoUrl = `${baseUrl}/api/media/file/short.png`;
  const faviconUrl = `${baseUrl}/api/media/file/favicon.png`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="mb-4">
            <Image
              src={longLogoUrl}
              alt={`${copyright} - logo`}
              width={342}
              height={50}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mt-3">
            {title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            {showWarning ? (
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
            
            <p className="text-lg text-gray-700 mb-4">
              {message}
            </p>
            
            {chapelInfo && (
              <p className="text-sm text-gray-500 mb-6">
                Newsletter z: <strong>{chapelInfo}</strong>
              </p>
            )}

            <div className="mt-8">
              <Link
                href={`/${subdomain}/ogloszenia`}
                className="inline-block bg-[#C81910] text-white px-6 py-3 rounded-md font-medium hover:bg-[#A0150D] transition-colors"
              >
                Powrót do ogłoszeń
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <div className="mb-4">
              <Image
                src={shortLogoUrl}
                alt="FSSPX Logo"
                width={163}
                height={50}
                className="mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {slogan}
            </p>
          </div>
          
          <div className="bg-gray-200 rounded-lg py-3 px-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                © {new Date().getFullYear()} - {copyright}
              </p>
              <div className="flex justify-center">
                <Image
                  src={faviconUrl}
                  alt="Heart with Cross"
                  width={16}
                  height={25}
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

