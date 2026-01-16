import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SendButton } from './SendButton';

// Mock Payload CMS UI hooks
const mockToast = {
  loading: jest.fn(() => 'toast-id'),
  success: jest.fn(),
  error: jest.fn(),
  dismiss: jest.fn(),
};

const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockGetData = jest.fn();

jest.mock('@payloadcms/ui', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  ConfirmationModal: ({ onConfirm }: any) => (
    <div>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ),
  toast: {
    loading: jest.fn(() => 'toast-id'),
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
  useModal: jest.fn(() => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  })),
  useForm: jest.fn(() => ({
    getData: mockGetData,
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('SendButton - skipCalendar functionality', () => {
  const mockProps = {
    id: 'test-announcement-id',
    newsletterSent: false,
    isDraft: false,
    tenantId: 'test-tenant-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetData.mockReturnValue({});
    // Mock fetch to handle both subscriber count and newsletter sending
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/newsletter-group/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ subscribersCount: 10 }),
        });
      }
      if (url.includes('/api/announcements/') && url.includes('/send-newsletter')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });
    });
  });

  it('should pass skipCalendar=true when checkbox is checked', async () => {
    mockGetData.mockReturnValue({
      newsletter: { skipCalendar: true },
    });

    const user = userEvent.setup();
    render(<SendButton {...mockProps} />);

    const sendButton = screen.getByText('Send Newsletter');
    await user.click(sendButton);

    // Wait for subscriber count fetch and modal to open
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/newsletter-group/test-tenant-id')
      );
    });

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled();
    });

    // Modal should be rendered, click confirm
    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    // Verify newsletter API was called with skipCalendar=true
    await waitFor(() => {
      const newsletterCalls = (global.fetch as jest.Mock).mock.calls.filter((call: any[]) =>
        call[0]?.includes('/api/announcements/test-announcement-id/send-newsletter')
      );
      expect(newsletterCalls.length).toBeGreaterThan(0);
      expect(newsletterCalls[newsletterCalls.length - 1][0]).toContain('skipCalendar=true');
      expect(newsletterCalls[newsletterCalls.length - 1][1]).toMatchObject({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  it('should pass skipCalendar=false when checkbox is unchecked', async () => {
    mockGetData.mockReturnValue({
      newsletter: { skipCalendar: false },
    });

    const user = userEvent.setup();
    render(<SendButton {...mockProps} />);

    const sendButton = screen.getByText('Send Newsletter');
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled();
    });

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      const newsletterCalls = (global.fetch as jest.Mock).mock.calls.filter((call: any[]) =>
        call[0]?.includes('/api/announcements/test-announcement-id/send-newsletter')
      );
      expect(newsletterCalls.length).toBeGreaterThan(0);
      expect(newsletterCalls[newsletterCalls.length - 1][0]).toContain('skipCalendar=false');
    });
  });

  it('should pass skipCalendar=false when newsletter field is undefined', async () => {
    mockGetData.mockReturnValue({});

    const user = userEvent.setup();
    render(<SendButton {...mockProps} />);

    const sendButton = screen.getByText('Send Newsletter');
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled();
    });

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      const newsletterCalls = (global.fetch as jest.Mock).mock.calls.filter((call: any[]) =>
        call[0]?.includes('/api/announcements/test-announcement-id/send-newsletter')
      );
      expect(newsletterCalls.length).toBeGreaterThan(0);
      expect(newsletterCalls[newsletterCalls.length - 1][0]).toContain('skipCalendar=false');
    });
  });

  it('should allow sending newsletter for draft pages', async () => {
    mockGetData.mockReturnValue({});

    const user = userEvent.setup();
    render(<SendButton {...mockProps} isDraft={true} />);

    // Button should not be disabled for draft pages
    const sendButton = screen.getByText('Send Newsletter');
    expect(sendButton).not.toBeDisabled();

    await user.click(sendButton);

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled();
    });
  });
});

