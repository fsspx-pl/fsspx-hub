import { Page, Tenant } from '@/payload-types'
import { FieldLabel } from '@payloadcms/ui'
import React from 'react'
import { SendButton } from './SendButton'
import classes from './index.module.scss'

export const SendNewsletterButton: React.FC<{ data: Page }> = ({ 
  data 
}) => {

  const id = data.id;
  const campaignId = data.campaignId;
  const tenant = data.tenant as Tenant;
  const isDraft = data._status === 'draft';

  if (!id) return null;
  if (!tenant) return null;

  return (
    <div className={classes.fieldType}>
      <FieldLabel label="Send Newsletter" />
      <SendButton id={id} campaignId={campaignId} isDraft={isDraft} tenant={tenant}/>
    </div>
  )
}

export default SendNewsletterButton;