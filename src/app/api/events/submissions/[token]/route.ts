import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { submissionData } = body;

    if (!submissionData) {
      return NextResponse.json(
        { message: 'submissionData is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config: configPromise });

    // Find submission by token
    const submissions = await payload.find({
      collection: 'form-submissions',
      where: {
        confirmationToken: {
          equals: token,
        },
      },
      limit: 1,
    });

    if (submissions.docs.length === 0) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      );
    }

    const submission = submissions.docs[0];

    // Update submission
    const updated = await payload.update({
      collection: 'form-submissions',
      id: submission.id,
      data: {
        submissionData,
      },
    });

    return NextResponse.json({
      message: 'Submission updated successfully',
      submission: updated,
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const payload = await getPayload({ config: configPromise });

    // Find submission by token
    const submissions = await payload.find({
      collection: 'form-submissions',
      where: {
        confirmationToken: {
          equals: token,
        },
      },
      limit: 1,
    });

    if (submissions.docs.length === 0) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      );
    }

    const submission = submissions.docs[0];

    // Cancel submission (update status instead of deleting)
    await payload.update({
      collection: 'form-submissions',
      id: submission.id,
      data: {
        status: 'cancelled',
      },
    });

    return NextResponse.json({
      message: 'Submission cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling submission:', error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

