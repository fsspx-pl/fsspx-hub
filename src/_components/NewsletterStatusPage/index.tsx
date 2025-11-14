import { fetchTenant } from '@/_api/fetchTenants';
import Link from 'next/link';

interface NewsletterStatusPageProps {
  subdomain: string;
  message: string;
  showWarning?: boolean;
}

export async function NewsletterStatusPage({
  subdomain,
  message,
  showWarning = false,
}: NewsletterStatusPageProps) {
  const tenant = await fetchTenant(subdomain);

  if (!tenant) {
    return null;
  }

  const chapelInfo = `${tenant.type} ${tenant.patron || ''} - ${tenant.city}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
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
                Ogłoszenia duszpasterskie z: <strong>{chapelInfo}</strong>
              </p>
            )}

            <div className="mt-8">
              <Link
                href={`/`}
                className="inline-block bg-[#C81910] text-white px-6 py-3 rounded-md font-medium hover:bg-[#A0150D] transition-colors"
              >
                Przejdź do najnowszych ogłoszeń
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

