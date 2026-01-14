import { Announcement, Tenant } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { PrintPageButton } from './PrintPageButton'
import classes from './index.module.scss'

export const PrintButton: React.FC<{ data: Announcement }> = async ({ 
  data 
}) => {
  const id = data.id;

  if (!id) return null;

  // Only show for pastoral announcements
  if (data.type !== 'pastoral-announcements') return null;

  // Get tenant - it might be populated or just an ID string
  let tenant: Tenant | null = null;
  const tenantIdOrObject = data.tenant;

  if (!tenantIdOrObject) return null;

  if (typeof tenantIdOrObject === 'string') {
    // Tenant is just an ID, fetch it
    try {
      const payload = await getPayload({ config: configPromise });
      const fetchedTenant = await payload.findByID({
        collection: 'tenants',
        id: tenantIdOrObject,
        depth: 0,
      });
      tenant = fetchedTenant as Tenant;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }
  } else {
    // Tenant is already populated
    tenant = tenantIdOrObject as Tenant;
  }

  return (
    <div className={classes.fieldType}>
      <PrintPageButton
        pageId={id}
      />
    </div>
  )
} 