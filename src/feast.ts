export enum VestmentColor {
  WHITE = 'biały',
  RED = 'czerwony',
  VIOLET = 'fioletowy',
  GREEN = 'zielony',
  BLACK = 'czarny',
}

export type Feast = {
  id: string,
  color: VestmentColor
  date: Date
  rank: number
  tags?: string[]
  title: string
  commemorations?: string[]
}

export type ApiFeast = Feast & {
  colors: string[]
}