# AGENTS - Email Components and Patterns Guideline

## Overview

This document provides technical guidance and best practices for building robust, maintainable, and optimized email UI components in this Next.js project. Components should be modular, easily reusable, and adhere to PayloadCMS-inspired structure.

---

## 🧩 Component Reuse

- **Always prefer composing with available React Email components** (`@react-email/components`) such as `<Container>`, `<Section>`, `<Row>`, `<Column>`, `<Img>`, `<Text>`, and `<Link>`.
- Write new presentational logic as *pure functions* and stateless components.
- Any new component should be exported from its respective directory under `src/_components/` and should always be documented with a Storybook story.

---

## Tailwind CSS Usage

- Use Tailwind CSS utility classes for all styling; do not use inline CSS except for special cases (e.g., dynamic values for widths, image URLs).
- Emails should be responsive and mobile-first, using container classes like `max-w-[600px]` and spacing utilities.

---

## Image Handling

- Always use the `<Img />` component for images in emails.
- Prefer using `.webp` if the image is available to optimize rendering performance.
- Specify `width`, `height`, and always set descriptive `alt` attributes.
- Images in emails do **not** support lazy loading due to email client limitations.

---

## Error Handling

- All props in mail components must validate required data and use guard clauses (early return) for unacceptable or missing states.
- Consider locale (e.g., `'en'`, `'pl'`) and handle fallbacks explicitly.

---

## Example: Reusable Email Button Component

```tsx
import { Link } from "@react-email/components";
import type { ReactNode } from "react";

type EmailButtonProps = {
  href: string;
  children: ReactNode;
  color?: string;
  backgroundColor?: string;
};

export function EmailButton({
  href,
  children,
  color = "#ffffff",
  backgroundColor = "#C81910",
}: EmailButtonProps) {
  if (!href) return null; // Guard: No href provided

  return (
    <Link
      href={href}
      style={{
        backgroundColor,
        color,
        padding: "12px 24px",
        borderRadius: "4px",
        textDecoration: "none",
        fontWeight: 500,
        display: "inline-block",
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  );
}
```

---

## Example: Translation Patterns

- Store translations in an object.
- Use a single source of truth pattern and destructure inside components:

```tsx
const translations = {
  pl: { title: '...', /* ... */},
  en: { title: '...', /* ... */},
};

export function Example({ locale = 'pl' }) {

