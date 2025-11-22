import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sendEventConfirmationEmail } from '@/utilities/sendEventConfirmationEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { form, submissionData, turnstileToken } = body;

    if (!form || !submissionData) {
      return NextResponse.json(
        { message: 'Form and submissionData are required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config: configPromise });

    // Create form submission
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: typeof form === 'string' ? form : form,
        submissionData,
      },
    });

    // Find the event that uses this form and send confirmation email if needed
    const formId = typeof form === 'string' ? form : form;
    const events = await payload.find({
      collection: 'events',
      where: {
        form: {
          equals: formId,
        },
      },
      limit: 1,
    });

    if (events.docs.length > 0) {
      const event = events.docs[0];
      
      // If event requires opt-in, send confirmation email
      if (event.requiresOptIn && submission.confirmationToken) {
        try {
          await sendEventConfirmationEmail({
            submission,
            event,
            token: submission.confirmationToken as string,
            req: {
              headers: {
                host: request.headers.get('host') || undefined,
              },
            },
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the submission if email fails
        }
      } else if (!event.requiresOptIn) {
        // Auto-confirm if opt-in not required
        await payload.update({
          collection: 'form-submissions',
          id: submission.id,
          data: {
            status: 'confirmed',
          },
        });
      }
    }

    return NextResponse.json({
      message: 'Form submission created successfully',
      submission,
    });
  } catch (error) {
    console.error('Error creating form submission:', error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

