export interface MenteeStat {
  program: string
  subject: string
  solved: number
  total: number
  percentage: number
}

export interface Mentee {
  name: string
  email: string
  timestamp: string
  stats: MenteeStat[]
}
