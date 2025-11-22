import { fetchEventBySlug } from '@/_api/fetchEvent';
import { Gutter } from '@/_components/Gutter';
import { Alert } from '@/_components/Alert';
import { Button } from '@/_components/Button';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { ManageSubmissionForm } from '@/_components/ManageSubmissionForm';

export default async function ManageEventPage({
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

  return (
    <Gutter className="py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Zarządzaj zgłoszeniem
        </h1>
        <ManageSubmissionForm
          submission={submission}
          event={event}
          token={token}
        />
      </div>
    </Gutter>
  );
}

