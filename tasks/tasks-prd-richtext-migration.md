## Relevant Files

- `tasks/prd-richtext-migration.md` - The Product Requirements Document guiding this implementation.
- `src/_components/RichText/serialize.tsx` - This houses the custom serializers for rendering Lexical elements, starting with links.
- `src/app/(app)/[domain]/ogloszenia/[date]/(with-layout)/page.tsx` - The main announcements page that will be updated to use the `RichText` component.
- `src/app/(app)/[domain]/ogloszenia/[date]/(print)/print/page.tsx` - The print-friendly version of the announcements page that also needs migrating.
- `src/app/(app)/[domain]/ogloszenia/[date]/PrintableAnnouncements.tsx` - The component responsible for rendering the print layout, which currently uses `content_html`.
- `src/emails/pastoral-announcements.tsx` - The React Email template for newsletters, which will be updated to render rich text from its JSON state.
- `src/app/api/pages/[id]/send-newsletter/route.tsx` - The API endpoint that triggers the newsletter; it needs to be updated to pass the correct content payload to the email template.
- `src/collections/Pages/index.ts` - The Payload CMS definition for the 'Pages' collection, where the `lexicalHTML` field will be removed.
- `src/app/(app)/[domain]/ogloszenia/[date]/enhanceFirstLetterInContent.tsx` - **To be deleted.** This file is obsolete after the migration.
- `src/payload-types.ts` - The auto-generated types file for Payload collections, which will need to be regenerated.

### Notes

- After modifying the `Pages` collection, run `pnpm generate:types` to update the TypeScript definitions in `src/payload-types.ts`.
- Tests are not part of this scope but should be considered in a follow-up task to ensure the stability of the new implementation.

## Tasks

- [x] **1.0 Setup RichText Serialization**
  - [x] 1.1 Create the `src/_components/RichText/serialize.tsx` file.
  - [x] 1.2 Implement a custom `link` serializer within `serialize.tsx` that utilizes the existing `CMSLink` component.
  - [x] 1.3 Ensure the serializer correctly maps the `url`, `newTab`, and `doc` fields from the Lexical link node to the corresponding props of the `CMSLink` component.
  - [x] 1.4 Add default serializers for standard HTML elements (`h1`-`h6`, `ul`, `ol`, `li`, `blockquote`) to ensure they render correctly.

- [ ] **2.0 Migrate Announcements Page to RichText**
  - [ ] 2.1 In `src/app/(app)/[domain]/ogloszenia/[date]/(with-layout)/page.tsx`, remove the usage of `content_html` and the call to `enhanceFirstLetterInContent`.
  - [ ] 2.2 Replace the HTML rendering logic with the `<RichText />` component from `@payloadcms/richtext-lexical/react`.
  - [ ] 2.3 Pass the `page.content` field (the JSON state) to the `data` prop of the `RichText` component.
  - [ ] 2.4 Import and pass the custom serializers from `serialize.tsx` to the `RichText` component.
  - [ ] 2.5 Add a fallback (e.g., return `null` or render an empty fragment) for cases where `page.content` is null or undefined to resolve any linter errors.

- [ ] **3.0 Migrate Printable Announcements to RichText**
  - [ ] 3.1 In `src/app/(app)/[domain]/ogloszenia/[date]/(print)/print/page.tsx`, remove the usage of `enhanceFirstLetterInContent` and pass the `page.content` object to the `PrintableAnnouncements` component instead of `content_html`.
  - [ ] 3.2 Update the `PrintableAnnouncements` component (`src/app/(app)/[domain]/ogloszenia/[date]/PrintableAnnouncements.tsx`) to accept a `content` prop (Lexical JSON state).
  - [ ] 3.3 Inside `PrintableAnnouncements.tsx`, replace the `dangerouslySetInnerHTML` div with the `<RichText />` component, configured with the custom serializers.

- [ ] **4.0 Migrate Newsletter Email to RichText**
  - [ ] 4.1 Modify the `pastoral-announcements.tsx` email template to accept a `content` prop instead of `content_html`.
  - [ ] 4.2 Replace the `dangerouslySetInnerHTML` logic with the `<RichText />` component and the custom serializers.
  - [ ] 4.3 Update the API route in `src/app/api/pages/[id]/send-newsletter/route.tsx` to fetch `page.content` and pass it to the email template.

- [ ] **5.0 Code Cleanup and Finalization**
  - [ ] 5.1 Delete the file `src/app/(app)/[domain]/ogloszenia/[date]/enhanceFirstLetterInContent.tsx`.
  - [ ] 5.2 In `src/collections/Pages/index.ts`, remove the `lexicalHTML('content', { name: 'content_html' })` field hook.
  - [ ] 5.3 Run the command `pnpm generate:types` to update `src/payload-types.ts` and remove the `content_html` field.
  - [ ] 5.4 Conduct a final review of all modified files to ensure there are no type errors, linting issues, or console warnings.
