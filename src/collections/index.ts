import { CollectionConfig } from 'payload';

import { Pages } from './Pages';
import { Media } from './Media';
import { Users } from './Users';
import { Tenants } from './Tenants';
import { Services } from './Services';
import { FeastTemplates } from './FeastTemplates';
import { ServiceWeeks } from './ServiceWeeks';
import { TenantWeeklyFeastTemplates } from './TenantWeeklyFeastTemplates';

export const collections: CollectionConfig[] = [
  Pages,
  Media,
  Users,
  Tenants,
  Services,
  FeastTemplates,
  TenantWeeklyFeastTemplates,
  ServiceWeeks,
]; 