import { Page } from '@/payload-types'
import { FieldLabel } from '@payloadcms/ui'
import React from 'react'
import { SendButton } from './SendButton'
import classes from './index.module.scss'

export const SendNewsletterButton: React.FC<{ data: Page }> = ({ 
  data 
}) => {

  return (
    <div className={classes.fieldType}>
      <FieldLabel label="Send Newsletter" />
      <SendButton page={data}/>
    </div>
  )
}

export default SendNewsletterButton;