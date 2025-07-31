import React from 'react'
import { serialize } from './serialize'

interface RichTextProps {
  data: any
  className?: string
}

export const RichText: React.FC<RichTextProps> = ({ data, className }) => {
  if (!data || !data.root || !data.root.children) {
    return null
  }

  const serializedContent = serialize(data.root.children)

  return (
    <div className={className}>
      {serializedContent}
    </div>
  )
}