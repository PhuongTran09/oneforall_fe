export type LegalInline = string | { b: string } | { a: string; href: string }

export type LegalBlock =
  | { type: 'p'; parts: LegalInline[] }
  | { type: 'ul'; items: LegalInline[][] }

export interface LegalSectionContent {
  id: string
  title: string
  tone?: 'warning'
  blocks: LegalBlock[]
}

export interface LegalDoc {
  title: string
  route: string
  description: string
  lastUpdated: string
  intro: string
  quickFactsTitle: string
  quickFacts: { label: string; text: string }[]
  sections: LegalSectionContent[]
}
