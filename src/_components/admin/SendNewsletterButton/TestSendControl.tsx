'use client'

import React, { useState } from 'react'
import { Button, toast, TextInput, useDocumentInfo } from '@payloadcms/ui'
import classes from './index.module.scss'

export const TestSendControl: React.FC<{ disabled?: boolean } > = ({ disabled }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const { id } = useDocumentInfo() as { id?: string }
  const handleChange = (val: unknown) => {
    if (typeof val === 'string') {
      setEmail(val)
      return
    }
    // Support event-like or object { value }
    const possibleValue = (val as any)?.target?.value ?? (val as any)?.value
    if (typeof possibleValue === 'string') setEmail(possibleValue)
  }

  const onSendTest = async () => {
    if (!id) {
      toast.error('Save the page before sending a test email')
      return
    }
    if (!email) {
      toast.error('Please enter a valid email')
      return
    }
    setIsLoading(true)
    const toastId = toast.loading('Sending test email...')
    try {
      const res = await fetch(`/api/pages/${id}/send-newsletter?testEmail=${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) {
        throw new Error('Failed to send test email')
      }
      toast.success('Test email sent')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send test email')
    } finally {
      setIsLoading(false)
      toast.dismiss(toastId)
    }
  }

  return (
    <div className={classes.testRow}>
      <TextInput
        path="testEmail"
        placeholder="Test email address"
        value={email}
        onChange={handleChange}
        className={classes.input}
      />
      <Button
        className={classes.button}
        buttonStyle='secondary'
        onClick={onSendTest}
        disabled={isLoading || disabled}
      >
        Send Test
      </Button>
    </div>
  )
}

export default TestSendControl


