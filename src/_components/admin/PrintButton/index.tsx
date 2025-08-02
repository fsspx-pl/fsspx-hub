import { Page } from '@/payload-types'
import { FieldLabel } from '@payloadcms/ui'
import React from 'react'
import { PrintPageButton } from './PrintPageButton'
import classes from './index.module.scss'

export const PrintButton: React.FC<{ data: Page }> = async ({ 
  data 
}) => {
  const id = data.id;
  const date = data.period?.start;
  const isDraft = data._status === 'draft';

  if (!id || !date) return null;

  // Only show for pastoral announcements
  if (data.type !== 'pastoral-announcements') return null;

  return (
    <div className={classes.fieldType}>
      <FieldLabel label="Print Version" />
      <PrintPageButton
        date={date} 
        isDraft={isDraft}
      />
    </div>
  )
} 