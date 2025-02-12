export enum VestmentColor {
  WHITE,
  RED,
  VIOLET,
  GREEN,
  BLACK,
}

export type Feast = {
  id: string,
  color: VestmentColor
  date: Date
  rank: number
  tags?: string[]
  title: string
}

export type ApiFeast = Feast & {
  colors: string[]
}