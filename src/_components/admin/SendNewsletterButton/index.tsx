import { Page } from '@/payload-types'
import React from 'react'
import { SendButton } from './SendButton'
import classes from './index.module.scss'

export const SendNewsletterButton: React.FC<{ data: Page }> = async ({ 
  data 
}) => {

  const id = data.id;
  const newsletterSent = data.newsletter?.sent;
  const tenantId = data.tenant as string;
  const isDraft = data._status === 'draft';

  if (!id) return null;

  if (!tenantId) return null;

  return (
    <div className={classes.fieldType}>
      <SendButton 
        id={id} 
        newsletterSent={newsletterSent} 
        isDraft={isDraft} 
        tenantId={tenantId}
      />
    </div>
  )
}

export default SendNewsletterButton;