import React from 'react'
import { serialize } from './serialize'

interface RichTextProps {
  data: any
  className?: string
  hideAttachments?: boolean
}

export const RichText: React.FC<RichTextProps> = ({ data, className, hideAttachments }) => {
  if (!data || !data.root || !data.root.children) {
    return null
  }

  const serializedContent = serialize(data.root.children, hideAttachments)

  return (
    <div className={className}>
      {serializedContent}
    </div>
  )
}