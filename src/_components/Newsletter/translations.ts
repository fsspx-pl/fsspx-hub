/**
 * Shared translations for Newsletter components
 * Supports both subscribe and unsubscribe modes
 * Structured to match PayloadCMS i18n format (flat objects per language)
 */
export const newsletterTranslations = {
  pl: {
    // Subscribe mode
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
    
    // Unsubscribe mode
    unsubscribeInfoTitle: 'Informacje o subskrypcji',
    topicLabel: 'Temat subskrypcji',
    warningLabel: 'Uwaga',
    unsubscribeWarning: 'Wypisanie się z subskrypcji spowoduje całkowite usunięcie Twojego adresu email z listy kontaktów. Nie będziesz już otrzymywać ogłoszeń duszpasterskich na temat',
    unsubscribeButton: 'Wypisz się z subskrypcji',
    unsubscribingButton: 'Wypisywanie...',
    unsubscribeSuccessMessage: 'Zostałeś wypisany z subskrypcji ogłoszeń duszpasterskich z:',
    redirecting: 'Przekierowywanie...',
    errorUnsubscribeFailed: 'Nie udało się wypisać z subskrypcji',
    errorUnsubscribeGeneric: 'Wystąpił błąd podczas wypisywania z subskrypcji',
    
    // Confirmation messages
    confirmationTitle: 'Subskrypcja potwierdzona!',
    confirmationMessage: 'Dziękujemy! Twoja subskrypcja ogłoszeń duszpasterskich została potwierdzona. Będziesz otrzymywać ogłoszenia duszpasterskie na swój adres email.',
    confirmationMessageAlready: 'Twoja subskrypcja ogłoszeń duszpasterskich została potwierdzona. Będziesz otrzymywać je na swój adres email po ich opublikowaniu.',
    
    // Email confirmation (used in emails)
    emailConfirmationTitle: 'Potwierdź subskrypcję ogłoszeń duszpasterskich',
    emailConfirmationGreeting: 'Dziękujemy za zainteresowanie ogłoszeniami duszpasterskimi z',
    emailConfirmationInstructions: 'Aby potwierdzić subskrypcję i rozpocząć otrzymywanie ogłoszeń duszpasterskich z tej kaplicy, kliknij poniższy link:',
    emailConfirmationButton: 'Potwierdź subskrypcję',
    emailConfirmationFallback: 'Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:',
    emailConfirmationDisclaimer: 'Jeśli nie zapisywałeś się do subskrypcji ogłoszeń duszpasterskich z',
    emailConfirmationIgnore: 'możesz zignorować tę wiadomość.',
    turnstileLabel: 'Weryfikacja antyspamowa',
  },
  en: {
    // Subscribe mode
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
    
    // Unsubscribe mode
    unsubscribeInfoTitle: 'Subscription Information',
    topicLabel: 'Subscription Topic',
    warningLabel: 'Warning',
    unsubscribeWarning: 'Unsubscribing will completely remove your email address from the contact list. You will no longer receive pastoral announcements for the topic',
    unsubscribeButton: 'Unsubscribe',
    unsubscribingButton: 'Unsubscribing...',
    unsubscribeSuccessMessage: 'You have been unsubscribed from pastoral announcements.',
    redirecting: 'Redirecting...',
    errorUnsubscribeFailed: 'Failed to unsubscribe',
    errorUnsubscribeGeneric: 'An error occurred while unsubscribing',
    
    // Confirmation messages
    confirmationTitle: 'Subscription Confirmed!',
    confirmationMessage: 'Thank you! Your subscription to pastoral announcements has been confirmed. You will receive pastoral announcements to your email address.',
    confirmationMessageAlready: 'Your subscription to pastoral announcements has been confirmed. You will receive them to your email address when they are published.',
    
    // Email confirmation (used in emails)
    emailConfirmationTitle: 'Confirm pastoral announcements subscription',
    emailConfirmationGreeting: 'Thank you for your interest in the pastoral announcements from',
    emailConfirmationInstructions: 'To confirm your subscription and start receiving pastoral announcements from this chapel, click the link below:',
    emailConfirmationButton: 'Confirm subscription',
    emailConfirmationFallback: 'If the button does not work, copy and paste the following link into your browser:',
    emailConfirmationDisclaimer: 'If you did not subscribe to the newsletter from',
    emailConfirmationIgnore: 'you can ignore this message.',
    turnstileLabel: 'Anti-spam verification',
  },
} as const;

type Locale = 'pl' | 'en';
type Mode = 'subscribe' | 'unsubscribe';
type TranslationKey = keyof typeof newsletterTranslations.pl;

/**
 * Get translation for a given key, locale, and mode
 * Falls back to 'pl' if translation is not available
 */
export function getNewsletterTranslation(
  key: TranslationKey,
  locale: Locale = 'pl',
  mode: Mode = 'subscribe'
): string {
  return newsletterTranslations[locale]?.[key] || newsletterTranslations.pl[key];
}

