jest.mock('@aws-sdk/client-sesv2', () => {
  const mockSend = jest.fn().mockResolvedValue({ MessageId: 'test-message-id' });
  return {
    SESv2Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
    SendEmailCommand: jest.fn(),
    CreateContactCommand: jest.fn(),
    UpdateContactCommand: jest.fn(),
    GetContactCommand: jest.fn(),
  };
});

import { sendBulkEmailToRecipients } from '@/utilities/aws/ses';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sendBulkEmailToRecipients', () => {
  it('passes the full fromName to mail sending command', async () => {
    const fromName = 'District of Poland – FSSPX';
    await sendBulkEmailToRecipients({
      recipients: ['recipient@example.com'],
      subject: 'Test',
      fromName,
      fromEmail: 'news@example.com',
      replyTo: 'reply@example.com',
      htmlContent: '<p>Test</p>',
    });

    const lastInput = (SendEmailCommand as jest.Mock).mock.calls[0]?.[0];
    expect(lastInput).toBeDefined();
    expect(lastInput.FromEmailAddress).toBe(fromName);
  });
});
