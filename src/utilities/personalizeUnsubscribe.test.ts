import { personalizeUnsubscribeUrl } from './personalizeUnsubscribe';

describe('personalizeUnsubscribeUrl', () => {
  const baseHtml = '<p>Click here: {{UNSUBSCRIBE_URL}}</p>';

  it('returns original html when unsubscribeBaseUrl is missing', async () => {
    const html = await personalizeUnsubscribeUrl({
      html: baseHtml,
      email: 'test@example.com',
      getSubscriptionId: jest.fn().mockResolvedValue('abc123'),
    });

    expect(html).toBe(baseHtml);
  });

  it('returns original html when getSubscriptionId is missing', async () => {
    const html = await personalizeUnsubscribeUrl({
      html: baseHtml,
      email: 'test@example.com',
      unsubscribeBaseUrl: 'https://example.com/unsubscribe',
    });

    expect(html).toBe(baseHtml);
  });

  it('replaces placeholder with personalized unsubscribe URL', async () => {
    const html = await personalizeUnsubscribeUrl({
      html: `${baseHtml} and again {{UNSUBSCRIBE_URL}}`,
      email: 'user@example.com',
      unsubscribeBaseUrl: 'https://example.com/unsubscribe',
      getSubscriptionId: jest.fn().mockResolvedValue('sub-123'),
    });

    expect(html).toBe(
      '<p>Click here: https://example.com/unsubscribe/sub-123</p> and again https://example.com/unsubscribe/sub-123'
    );
  });

  it('calls onMissingSubscription when subscription is not found', async () => {
    const onMissing = jest.fn();

    const html = await personalizeUnsubscribeUrl({
      html: baseHtml,
      email: 'missing@example.com',
      unsubscribeBaseUrl: 'https://example.com/unsubscribe',
      getSubscriptionId: jest.fn().mockResolvedValue(null),
      onMissingSubscription: onMissing,
    });

    expect(html).toBe(baseHtml);
    expect(onMissing).toHaveBeenCalledWith('missing@example.com');
  });
});

