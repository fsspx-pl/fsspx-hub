import { fetchEventBySlug } from '@/_api/fetchEvent';
import { Gutter } from '@/_components/Gutter';
import { Alert } from '@/_components/Alert';
import { Button } from '@/_components/Button';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export default async function ConfirmEventPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string; token: string }>;
}) {
  const { domain, slug, token } = await params;
  
  const event = await fetchEventBySlug(domain, slug);

  if (!event) {
    notFound();
  }

  const payload = await getPayload({ config: configPromise });

  // Find submission by token
  const submissions = await payload.find({
    collection: 'form-submissions',
    where: {
      and: [
        {
          confirmationToken: {
            equals: token,
          },
        },
        {
          form: {
            equals: typeof event.form === 'string' ? event.form : event.form.id,
          },
        },
      ],
    },
    limit: 1,
  });

  if (submissions.docs.length === 0) {
    return (
      <Gutter className="py-8">
        <Alert
          variant="error"
          title="Błąd"
          message="Nie znaleziono zgłoszenia z podanym tokenem."
        />
      </Gutter>
    );
  }

  const submission = submissions.docs[0];

  // Check if already confirmed
  if (submission.status === 'confirmed') {
    return (
      <Gutter className="py-8">
        <Alert
          variant="success"
          title="Już potwierdzone"
          message="Twoje zgłoszenie zostało już wcześniej potwierdzone."
        />
        <div className="mt-4">
          <Button href={`/wydarzenia/${slug}/manage/${token}`} variant="primary">
            Zarządzaj zgłoszeniem
          </Button>
        </div>
      </Gutter>
    );
  }

  // Confirm the submission
  try {
    await payload.update({
      collection: 'form-submissions',
      id: submission.id,
      data: {
        status: 'confirmed',
      },
    });

    return (
      <Gutter className="py-8">
        <Alert
          variant="success"
          title="Potwierdzone!"
          message="Twoje zgłoszenie zostało pomyślnie potwierdzone. Dziękujemy za zapis na wydarzenie!"
        />
        <div className="mt-4">
          <Button href={`/wydarzenia/${slug}/manage/${token}`} variant="primary">
            Zarządzaj zgłoszeniem
          </Button>
        </div>
      </Gutter>
    );
  } catch (error) {
    return (
      <Gutter className="py-8">
        <Alert
          variant="error"
          title="Błąd"
          message="Wystąpił błąd podczas potwierdzania zgłoszenia. Spróbuj ponownie później."
        />
      </Gutter>
    );
  }
}

