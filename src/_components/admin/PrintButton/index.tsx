import React from 'react'
import { PrintPageButton } from './PrintPageButton'
import classes from './index.module.scss'
import { Page } from '@/payload-types'

export const PrintButton: React.FC<{ data: Page }> = async ({ 
  data 
}) => {
  const id = data.id;

  if (!id) return null;

  // Only show for pastoral announcements
  if (data.type !== 'pastoral-announcements') return null;

  const period = data.period as Page['period'] | undefined;
  const startDate = period?.start;
  if (!startDate) return null;

  const isDraft = data._status !== 'published';

  return (
    <div className={classes.fieldType}>
      <PrintPageButton
        date={startDate}
        isDraft={isDraft}
      />
    </div>
  )
} 