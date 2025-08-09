import { Page } from '@/payload-types'
import { FieldLabel } from '@payloadcms/ui'
import React from 'react'
import { SendButton } from './SendButton'
import classes from './index.module.scss'
import { fetchTenantById } from '@/_api/fetchTenants'

export const SendNewsletterButton: React.FC<{ data: Page }> = async ({ 
  data 
}) => {

  const id = data.id;
  const campaignId = data.campaignId;
  const tenantId = data.tenant as string;
  const isDraft = data._status === 'draft';

  if (!id) return null;

  const tenant = await fetchTenantById(tenantId);
  if (!tenant?.mailingGroupId) return null;

  return (
    <div className={classes.fieldType}>
      <FieldLabel label="Send Newsletter" />
              <SendButton id={id} campaignId={campaignId} isDraft={isDraft} newsletterGroupId={tenant.mailingGroupId}/>
    </div>
  )
}

export default SendNewsletterButton;