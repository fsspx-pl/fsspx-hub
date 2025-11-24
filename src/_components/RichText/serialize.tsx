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

type LinkRenderer = (props: {
  key: string | number
  href: string
  newTab?: boolean | null
  children: React.ReactNode
  reference?: {
    value: string | Page
    relationTo: 'pages'
  } | null
}) => React.ReactNode

const serializeInternal = (
  children?: (Node | TextNode)[],
  linkRenderer?: LinkRenderer
): React.ReactNode[] | null =>
  children?.map((node, i) => {
    if (isText(node)) {
      return <Fragment key={i}>{serializeText(node)}</Fragment>
    }

    if (!node) {
      return null
    }

    const typedNode = node as Node
    const serializedChildren = typedNode.children 
      ? serializeInternal(typedNode.children, linkRenderer) 
      : undefined

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
        if (linkRenderer) {
          const href = typedNode.fields?.url || '#'
          return linkRenderer({
            key: i,
            href,
            newTab: typedNode.fields?.newTab,
            children: serializedChildren,
            reference: typedNode.fields?.doc ? {
              value: typedNode.fields.doc.value as Page,
              relationTo: typedNode.fields.doc.relationTo,
            } : null,
          })
        }
        
        // Default: use CMSLink for web
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

      case 'paragraph': {
        return <React.Fragment key={i}>
          <React.Fragment key={i}>{serializedChildren}</React.Fragment>
          <br />
        </React.Fragment>
      }

      case 'horizontalrule': {
        return <hr key={i} />
      }

      default:
        return <p key={i}>{serializedChildren}</p>
    }
  }) || null

export const serialize = (children?: (Node | TextNode)[]): React.ReactNode[] | null =>
  serializeInternal(children)

export const serializeForEmail = (children?: (Node | TextNode)[]): React.ReactNode[] | null =>
  serializeInternal(children, ({ key, href, newTab, children: linkChildren }) => {
    const newTabProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return (
      <a key={key} href={href} {...newTabProps} style={{ color: '#C81910', textDecoration: 'none' }}>
        {linkChildren}
      </a>
    )
  })
