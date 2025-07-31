/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment } from 'react'

import { CMSLink } from '@/_components/Link'
import { Page } from '@/payload-types'
import {
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
  IS_CODE,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
} from '@payloadcms/richtext-lexical'
import { SerializedElementNode } from 'lexical'

interface Node extends SerializedElementNode {
  fields: any
}

const isText = (node: any): node is { text: string; format: number } => 'text' in node

const serializeText = (node: { text: string; format: number }): React.ReactNode => {
  let text: React.ReactNode = <span dangerouslySetInnerHTML={{ __html: node.text }} />

  if (node.format & IS_BOLD) {
    text = <strong key={Math.random()}>{text}</strong>
  }

  if (node.format & IS_ITALIC) {
    text = <em key={Math.random()}>{text}</em>
  }

  if (node.format & IS_STRIKETHROUGH) {
    text = (
      <s key={Math.random()} style={{ textDecoration: 'line-through' }}>
        {text}
      </s>
    )
  }

  if (node.format & IS_UNDERLINE) {
    text = (
      <u key={Math.random()} style={{ textDecoration: 'underline' }}>
        {text}
      </u>
    )
  }

  if (node.format & IS_CODE) {
    text = <code key={Math.random()}>{text}</code>
  }

  if (node.format & IS_SUBSCRIPT) {
    text = <sub key={Math.random()}>{text}</sub>
  }

  if (node.format & IS_SUPERSCRIPT) {
    text = <sup key={Math.random()}>{text}</sup>
  }

  return text
}

export const serialize = (children?: (Node | { text: string; format: number })[]): React.ReactNode[] | null =>
  children?.map((node, i) => {
    if (isText(node)) {
      return <Fragment key={i}>{serializeText(node)}</Fragment>
    }

    if (!node) {
      return null
    }

    const serializedChildren = 'children' in node ? serialize(node.children) : undefined

    switch (node.type) {
      case 'heading':
        const Tag = node.tag as keyof JSX.IntrinsicElements
        return (
          <Tag key={i} className={`font-bold text-4xl`}>
            {serializedChildren}
          </Tag>
        )

      case 'list': {
        const Tag = node.tag as 'ul' | 'ol'
        return (
          <Tag
            key={i}
            className={`list-disc list-inside`}
          >
            {serializedChildren}
          </Tag>
        )
      }
      case 'listitem': {
        return <li key={i}>{serializedChildren}</li>
      }

      case 'quote': {
        return <blockquote key={i}>{serializedChildren}</blockquote>
      }
      case 'link': {
        return (
          <CMSLink
            key={i}
            type={node.fields.doc ? 'reference' : 'custom'}
            url={node.fields.url}
            reference={{
              value: node.fields.doc?.value as Page,
              relationTo: node.fields.doc?.relationTo,
            }}
            newTab={node.fields.newTab}
          >
            {serializedChildren}
          </CMSLink>
        )
      }

      default:
        return <p key={i}>{serializedChildren}</p>
    }
  }) || null
