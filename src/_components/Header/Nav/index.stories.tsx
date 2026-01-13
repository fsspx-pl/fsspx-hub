import type { Meta, StoryObj } from '@storybook/react'
import { HeaderNav } from './index'
import { Header } from '@/payload-types'

const mockNavItems: Header['navItems'] = [
  {
    link: {
      type: 'custom',
      url: '/ogloszenia',
      label: 'Ogłoszenia',
      newTab: false,
    },
  },
  {
    link: {
      type: 'custom',
      url: '/wydarzenia',
      label: 'Wydarzenia',
      newTab: false,
    },
  },
  {
    link: {
      type: 'custom',
      url: '/kontakt',
      label: 'Kontakt',
      newTab: false,
    },
  },
]

const meta = {
  title: 'Components/Header/Nav',
  component: HeaderNav,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeaderNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    navItems: mockNavItems,
  },
}
