import { User } from "@/payload-types";

export function formatAuthorName(user: User | null): string | undefined {
  if (!user) return undefined;

  return `${user.salutation === 'father' ? 'Ks.' : ''} ${user.firstName} ${user.lastName}`.trim();
}
