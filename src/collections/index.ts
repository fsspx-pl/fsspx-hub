import { CollectionConfig } from 'payload';

import { Announcements } from './Pages';
import { Media } from './Media';
import { Users } from './Users';
import { Tenants } from './Tenants';
import { Services } from './Services';
import { FeastTemplates } from './FeastTemplates';
import { ServiceWeeks } from './ServiceWeeks';
import { NewsletterSubscriptions } from './NewsletterSubscriptions';
import { Events } from './Events';

export const collections: CollectionConfig[] = [
  Announcements,
  Media,
  Users,
  Tenants,
  Services,
  FeastTemplates,
  ServiceWeeks,
  NewsletterSubscriptions,
  Events,
]; 