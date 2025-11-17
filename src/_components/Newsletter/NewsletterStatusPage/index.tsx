import { garamond } from '@/fonts';
import { getNewsletterTranslation } from '../translations';
import Link from 'next/link';
import { ReactNode } from 'react';

type NewsletterStatusPageVariant = 'success' | 'warning' | 'info';

interface NewsletterStatusPageProps {
  variant?: NewsletterStatusPageVariant;
  title?: string;
  message: string;
  chapelInfo?: string;
  subdomain: string;
  locale?: 'pl' | 'en';
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function NewsletterStatusPage({
  variant = 'success',
  title,
  message,
  chapelInfo,
  subdomain,
  locale = 'pl',
  showBackButton = true,
  backButtonText,
  backButtonHref,
  action,
  children,
}: NewsletterStatusPageProps) {
  const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
    getNewsletterTranslation(key, locale, 'subscribe');

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return (
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
        );
      case 'info':
        return (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case 'success':
      default:
        return (
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
        );
    }
  };

  const defaultBackHref = `/${subdomain}`;
  const defaultBackText = locale === 'pl' 
    ? 'Przejdź do najnowszych ogłoszeń' 
    : 'Go to latest announcements';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            {getIcon()}
            
            {title && (
              <h2 className={`text-2xl font-semibold text-gray-900 mb-4 ${garamond.className}`}>
                {title}
              </h2>
            )}
            
            <p className="text-lg text-gray-700 mb-4">
              {message}
            </p>

            {chapelInfo && (
              <p className="text-sm text-gray-600 mb-4">
                {locale === 'pl' ? 'Ogłoszenia duszpasterskie z:' : 'Pastoral announcements from:'} <strong>{chapelInfo}</strong>
              </p>
            )}

            {children}

            {action && (
              <div className="mt-8">
                {action}
              </div>
            )}

            {showBackButton && !action && (
              <div className="mt-8">
                <Link
                  href={backButtonHref || defaultBackHref}
                  className="inline-block bg-[#C81910] text-white px-6 py-3 rounded-md font-medium hover:bg-[#A0150D] transition-colors"
                >
                  {backButtonText || defaultBackText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

