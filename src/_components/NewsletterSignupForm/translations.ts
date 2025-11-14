/**
 * Translations for NewsletterSignupForm component
 * Structured to match PayloadCMS i18n format (flat objects per language)
 */
export const newsletterSignupTranslations = {
  pl: {
    title: 'Ogłoszenia duszpasterskie na Twojej skrzynce pocztowej.',
    description: 'Jeśli chcesz otrzymywać najnowsze ogłoszenia duszpasterskie z tej kaplicy na swoją skrzynkę pocztową, wprowadź swój adres email i kliknij przycisk "Zapisz się".',
    emailLabel: 'Adres email',
    emailPlaceholder: 'twoj@email.pl',
    submitButton: 'Zapisz się',
    submittingButton: 'Wysyłanie...',
    successTitle: 'Dziękujemy za subskrypcję!',
    successMessage: 'Sprawdź swoją skrzynkę pocztową i potwierdź subskrypcję, klikając link w wiadomości email.',
    errorEmailRequired: 'Proszę podać adres email',
    errorVerificationRequired: 'Proszę poczekać na weryfikację',
    errorVerificationFailed: 'Weryfikacja nie powiodła się. Spróbuj ponownie.',
    errorGeneric: 'Wystąpił błąd podczas subskrypcji. Spróbuj ponownie później.',
    errorSubscriptionFailed: 'Wystąpił błąd podczas subskrypcji',
    emailConfirmationTitle: 'Potwierdź subskrypcję ogłoszeń duszpasterskich',
    emailConfirmationGreeting: 'Dziękujemy za zainteresowanie ogłoszeniami duszpasterskimi z',
    emailConfirmationInstructions: 'Aby potwierdzić subskrypcję i rozpocząć otrzymywanie ogłoszeń duszpasterskich z tej kaplicy, kliknij poniższy link:',
    emailConfirmationButton: 'Potwierdź subskrypcję',
    emailConfirmationFallback: 'Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:',
    emailConfirmationDisclaimer: 'Jeśli nie zapisywałeś się do subskrypcji ogłoszeń duszpasterskich z',
    emailConfirmationIgnore: 'możesz zignorować tę wiadomość.',
  },
  en: {
    title: 'Subscribe to newsletter',
    description: 'Receive the latest pastoral announcements to your email inbox.',
    emailLabel: 'Email address',
    emailPlaceholder: 'your@email.com',
    submitButton: 'Subscribe',
    submittingButton: 'Submitting...',
    successTitle: 'Thank you for subscribing!',
    successMessage: 'Check your email inbox and confirm your subscription by clicking the link in the email message.',
    errorEmailRequired: 'Please provide an email address',
    errorVerificationRequired: 'Please wait for verification',
    errorVerificationFailed: 'Verification failed. Please try again.',
    errorGeneric: 'An error occurred during subscription. Please try again later.',
    errorSubscriptionFailed: 'An error occurred during subscription',
    emailConfirmationTitle: 'Confirm pastoral announcements subscription',
    emailConfirmationGreeting: 'Thank you for your interest in the pastoral announcements from',
    emailConfirmationInstructions: 'To confirm your subscription and start receiving pastoral announcements from this chapel, click the link below:',
    emailConfirmationButton: 'Confirm subscription',
    emailConfirmationFallback: 'If the button does not work, copy and paste the following link into your browser:',
    emailConfirmationDisclaimer: 'If you did not subscribe to the newsletter from',
    emailConfirmationIgnore: 'you can ignore this message.',
  },
} as const;

type Locale = 'pl' | 'en';
type TranslationKey = keyof typeof newsletterSignupTranslations.pl;

/**
 * Get translation for a given key and locale
 * Falls back to 'pl' if translation is not available
 */
export function getNewsletterTranslation(
  key: TranslationKey,
  locale: Locale = 'pl'
): string {
  return newsletterSignupTranslations[locale]?.[key] || newsletterSignupTranslations.pl[key];
}

