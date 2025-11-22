import React, { Fragment } from 'react'

import { CMSLink } from '@/_components/Link'
import { Page } from '@/payload-types'
import { Heading } from '@/_components/Heading'

// Text format constants
const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4
const IS_SUBSCRIPT = 1 << 5
const IS_SUPERSCRIPT = 1 << 6

interface Node {
  type: string
  children?: (Node | TextNode)[]
  fields?: any
  tag?: string
}

interface TextNode {
  text: string
  format: number
}

const isText = (node: any): node is TextNode => 'text' in node

const serializeText = (node: TextNode): React.ReactNode => {
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

export const serialize = (children?: (Node | TextNode)[]): React.ReactNode[] | null =>
  children?.map((node, i) => {
    if (isText(node)) {
      return <Fragment key={i}>{serializeText(node)}</Fragment>
    }

    if (!node) {
      return null
    }

    const typedNode = node as Node
    const serializedChildren = typedNode.children ? serialize(typedNode.children) : undefined

    switch (typedNode.type) {
      case 'heading': {
        const tag = typedNode.tag || 'h1'
        const validHeadingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        const as = (validHeadingTags.includes(tag) ? tag : 'h1') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
        return (
          <Heading key={i} as={as}>
            {serializedChildren}
          </Heading>
        )
      }

      case 'list': {
        const tag = typedNode.tag || 'ul'
        if (tag === 'ol') {
          return (
            <ol key={i} className={`list-decimal list-inside`}>
              {serializedChildren}
            </ol>
          )
        } else {
          return (
            <ul key={i} className={`list-disc list-inside`}>
              {serializedChildren}
            </ul>
          )
        }
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
            type={typedNode.fields?.doc ? 'reference' : 'custom'}
            url={typedNode.fields?.url}
            reference={{
              value: typedNode.fields?.doc?.value as Page,
              relationTo: typedNode.fields?.doc?.relationTo,
            }}
            newTab={typedNode.fields?.newTab}
            className="text-[#C81910] no-underline"
          >
            {serializedChildren}
          </CMSLink>
        )
      }

      case 'linebreak': {
        return <br key={i} />
      }

      default:
        return <React.Fragment key={i}>{serializedChildren}</React.Fragment>
    }
  }) || null
