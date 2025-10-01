import type { Meta, StoryObj } from '@storybook/react'
import { Heading } from './index'

const meta: Meta<typeof Heading> = {
  title: 'Typography/Heading',
  component: Heading,
}

export default meta

type Story = StoryObj<typeof Heading>

export const Levels: Story = {
  render: () => (
    <div className="space-y-2">
      <Heading as="h1">Heading 1</Heading>
      <Heading as="h2">Heading 2</Heading>
      <Heading as="h3">Heading 3</Heading>
      <Heading as="h4">Heading 4</Heading>
      <Heading as="h5">Heading 5</Heading>
      <Heading as="h6">Heading 6</Heading>
    </div>
  ),
}



