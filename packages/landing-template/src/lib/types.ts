export interface SanityImage {
  _type: 'image'
  asset: {_ref: string; _type: 'reference'}
  hotspot?: {x: number; y: number; height: number; width: number}
  crop?: {top: number; bottom: number; left: number; right: number}
  alt?: string
}

export interface NavItem {
  label: string
  anchor: string
}

export interface LegalLink {
  label: string
  url: string
}

export interface Seo {
  title: string
  description: string
  canonicalUrl: string
  noindex?: boolean
  ogImage?: SanityImage
}

export interface Tracking {
  adsConversionId?: string
  adsConversionLabel?: string
  ga4Id?: string
}

export interface Header {
  logo: SanityImage
  logoAlt: string
  availabilityChip?: string
  ctaLabel: string
  navItems?: NavItem[]
}

export interface Hero {
  eyebrow?: string
  headlineLines: string[]
  subcopy: string
  ticks?: string[]
  backgroundImage: SanityImage
  primaryCtaLabel: string
  secondaryCtaLabel?: string
  review?: {show?: boolean; score?: number; count?: number}
}

export interface QuoteForm {
  heading: string
  subcopy?: string
  serviceOptions?: string[]
  submitLabel: string
  footnote?: string
}

export interface ThankYou {
  heading: string
  subcopy: string
  bullets?: string[]
}

export interface Business {
  name: string
  phone: string
  email?: string
  abn?: string
  streetAddress?: string
  suburb?: string
  state?: string
  postcode?: string
  serviceArea?: string
  about?: string
  legalLinks?: LegalLink[]
}

export interface LandingPage {
  seo: Seo
  tracking?: Tracking
  header: Header
  hero: Hero
  form: QuoteForm
  thankYou: ThankYou
  business: Business
}

/** Strip spaces and formatting so a displayed number works in a tel: link. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
