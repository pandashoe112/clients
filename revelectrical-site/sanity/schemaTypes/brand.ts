import { defineType, defineField, defineArrayMember } from 'sanity';

// A brand is a name in the "Brands we install" menu and, when "Has a landing
// page" is on, a full page at /brands/<slug>. The page is deliberately two
// things at once: what the product is, for people searching the brand, and why
// we are the ones to fit it. Brands without a page still list in the menu.
//
// There are two ways to build the body of the page:
//
//   1. The fixed fields below - certification band, install steps, product
//      range, what-sets-them-apart grid - in that order. Evnex uses these.
//   2. The "Page builder" tab, which is a list of bands you order yourself.
//      Fill it in and it replaces the fixed set entirely. Fox ESS and
//      Sigenergy use it, because their copy runs battery, then chargers, then
//      a standalone offer, and that order changes per brand.
//
// Either way the page finishes the same: photos, service areas, related
// services, FAQs, closing CTA.
export default defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  groups: [
    { name: 'card', title: 'Brand', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Page builder' },
    { name: 'install', title: 'Our installation' },
    { name: 'products', title: 'Product range' },
    { name: 'body', title: 'Page sections' },
    { name: 'faq', title: 'FAQs' }
  ],
  fields: [
    // --- brand ---
    defineField({ name: 'name', title: 'Brand name', type: 'string', group: 'card', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' },
      group: 'card', validation: (r) => r.required()
    }),
    defineField({
      name: 'kind', title: 'What they make', type: 'string', group: 'card',
      description: 'Shown beside the name in the menu.',
      options: {
        list: [
          { title: 'EV chargers', value: 'charger' },
          { title: 'Solar batteries', value: 'battery' },
          { title: 'Chargers and batteries', value: 'both' }
        ]
      },
      validation: (r) => r.required()
    }),
    defineField({ name: 'logo', title: 'Brand logo', type: 'image', group: 'card' }),
    defineField({
      name: 'summary', title: 'Summary', type: 'text', rows: 2, group: 'card',
      description: 'One line about the brand, used on the brands index.',
      validation: (r) => r.max(200)
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', group: 'card' }),
    defineField({
      name: 'hasPage', title: 'Has a landing page', type: 'boolean', group: 'card', initialValue: false,
      description: 'Off means the brand still lists in the menu but is not a link. Fill in the tabs above before turning this on.'
    }),
    defineField({
      name: 'spacious', title: 'Roomier layout', type: 'boolean', group: 'card', initialValue: false,
      description: 'More space between bands and slightly larger body copy. For the premium end of the range, where the page should not feel crowded.'
    }),

    // --- SEO ---
    defineField({
      name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      description: 'Shown in Google and the browser tab. Aim for 50-60 characters.',
      validation: (r) => r.max(70)
    }),
    defineField({
      name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      description: 'The grey text under the Google result. Aim for 140-160 characters.',
      validation: (r) => r.max(180)
    }),

    // --- hero ---
    defineField({ name: 'heroHeading', title: 'Hero heading', type: 'string', group: 'hero' }),
    defineField({ name: 'heroIntro', title: 'Hero intro', type: 'text', rows: 3, group: 'hero' }),
    defineField({
      name: 'heroCtaLabel', title: 'Hero button label', type: 'string', group: 'hero',
      description: 'Defaults to "Get a free quote".'
    }),
    defineField({
      name: 'heroTicks', title: 'Hero tick list', type: 'array', group: 'hero',
      of: [defineArrayMember({ type: 'string' })]
    }),
    defineField({ name: 'heroImage', title: 'Hero image', type: 'image', group: 'hero' }),
    defineField({
      name: 'quoteHeading', title: 'Quote form heading', type: 'string', group: 'hero',
      description: 'The heading on the form beside the hero. Defaults to "Get a price for your <brand>".'
    }),
    defineField({ name: 'quoteText', title: 'Quote form intro', type: 'text', rows: 2, group: 'hero' }),

    // --- page builder ---
    //
    // Copy arrives from the client as headed sections in a document, and this
    // is the shape that takes without a translation step: a heading, an
    // opening line, some titled points, and - where the copy has one - a
    // table, a caveat and a button. Everything but the heading is optional, so
    // a band with three points and nothing else is just as valid.
    defineField({
      name: 'sections', title: 'Page bands', type: 'array', group: 'sections',
      description: 'Fill this in and it replaces the fixed sections on the tabs to the right. Leave it empty to use those instead.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'band',
          title: 'Content band',
          fields: [
            { name: 'heading', title: 'Heading', type: 'string', validation: (r: any) => r.required() },
            { name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'The small line above the heading.' },
            {
              name: 'intro', title: 'Intro', type: 'text', rows: 4,
              description: 'Links go in as [text](/where-to). Same in every text field on this band.'
            },
            {
              name: 'points', title: 'Points', type: 'array',
              of: [{
                type: 'object',
                fields: [
                  { name: 'title', title: 'Title', type: 'string' },
                  { name: 'text', title: 'Text', type: 'text', rows: 4 }
                ],
                preview: { select: { title: 'title', subtitle: 'text' } }
              }]
            },
            {
              name: 'specs', title: 'Spec panel', type: 'array',
              description: 'A plain two-column table of figures. One row each.',
              of: [{
                type: 'object',
                fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                  { name: 'value', title: 'Value', type: 'string' }
                ],
                preview: { select: { title: 'label', subtitle: 'value' } }
              }]
            },
            {
              name: 'compareColumns', title: 'Comparison columns', type: 'array',
              description: 'For an A-versus-B table. Name the columns here, then add rows below.',
              of: [{ type: 'string' }]
            },
            {
              name: 'compareRows', title: 'Comparison rows', type: 'array',
              of: [{
                type: 'object',
                fields: [
                  { name: 'label', title: 'Row label', type: 'string' },
                  { name: 'values', title: 'Values', type: 'array', of: [{ type: 'string' }], description: 'One per column, in order.' }
                ],
                preview: { select: { title: 'label' } }
              }]
            },
            {
              name: 'image', title: 'Photo', type: 'image',
              description: 'A band of nothing but text is the one thing to avoid. Every band that can carry a photo should.'
            },
            {
              name: 'imagePath', title: 'Or a photo already on the site', type: 'string',
              description: 'A path under /photos, e.g. /photos/foxess-stack-tall.webp. Ignored if you upload one above.'
            },
            { name: 'imageAlt', title: 'Photo description', type: 'string', description: 'What the photo shows, for screen readers.' },
            { name: 'note', title: 'Small print', type: 'text', rows: 3, description: 'Sits under the table in smaller, quieter type.' },
            { name: 'ctaLabel', title: 'Button label', type: 'string', description: 'Leave empty for no button.' },
            { name: 'ctaHref', title: 'Button link', type: 'string', description: 'Defaults to the quote form on this page.' },
            {
              name: 'tone', title: 'Background', type: 'string',
              options: {
                list: [
                  { title: 'Paper (white)', value: 'bg-paper' },
                  { title: 'Cream', value: 'bg-cream' },
                  { title: 'Deep green', value: 'bg-deep' }
                ]
              },
              initialValue: 'bg-paper'
            },
            { name: 'anchor', title: 'Anchor', type: 'string', description: 'Optional, for linking straight to this band.' }
          ],
          preview: { select: { title: 'heading', subtitle: 'eyebrow' } }
        }),
        defineArrayMember({
          type: 'object',
          name: 'offerBand',
          title: 'Standalone offer block',
          description: 'A full-width block on its own background, for an offer that is not part of the section above it.',
          fields: [
            { name: 'heading', title: 'Heading', type: 'string', validation: (r: any) => r.required() },
            { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
            {
              name: 'text', title: 'Body', type: 'array',
              description: 'One entry per paragraph.',
              of: [{ type: 'text', rows: 4 }]
            },
            {
              name: 'image', title: 'Photo', type: 'image',
              description: 'A band of nothing but text is the one thing to avoid. Every band that can carry a photo should.'
            },
            {
              name: 'imagePath', title: 'Or a photo already on the site', type: 'string',
              description: 'A path under /photos, e.g. /photos/foxess-stack-tall.webp. Ignored if you upload one above.'
            },
            { name: 'imageAlt', title: 'Photo description', type: 'string', description: 'What the photo shows, for screen readers.' },
            { name: 'ctaLabel', title: 'Button label', type: 'string' },
            { name: 'ctaHref', title: 'Button link', type: 'string' },
            { name: 'anchor', title: 'Anchor', type: 'string' }
          ],
          preview: { select: { title: 'heading', subtitle: 'eyebrow' } }
        })
      ]
    }),

    // --- our installation ---
    defineField({ name: 'certifiedHeading', title: 'Certification heading', type: 'string', group: 'install' }),
    defineField({
      name: 'certifiedText', title: 'Certification text', type: 'array', group: 'install',
      description: 'One entry per paragraph.',
      of: [defineArrayMember({ type: 'text', rows: 4 })]
    }),
    defineField({
      name: 'certifiedBadge', title: 'Certification badge', type: 'image', group: 'install',
      description: 'The badge the brand supplies to accredited installers.'
    }),
    defineField({
      name: 'certifiedImage', title: 'Certification photo', type: 'image', group: 'install',
      description: 'A photo for this band, used where there is no badge so the band is never text on its own.'
    }),
    defineField({
      name: 'certifiedImagePath', title: 'Or a photo already on the site', type: 'string', group: 'install',
      description: 'A path under /photos. Ignored if you upload one above.'
    }),
    defineField({
      name: 'certifiedPoints', title: 'What the accreditation means', type: 'array', group: 'install',
      of: [defineArrayMember({ type: 'string' })]
    }),
    defineField({ name: 'installHeading', title: 'Installation heading', type: 'string', group: 'install' }),
    defineField({ name: 'installIntro', title: 'Installation intro', type: 'text', rows: 3, group: 'install' }),
    defineField({
      name: 'installPoints', title: 'Installation points', type: 'array', group: 'install',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'text', title: 'Text', type: 'text', rows: 3 }
        ]
      })]
    }),
    defineField({ name: 'areasHeading', title: 'Service areas heading', type: 'string', group: 'install' }),
    defineField({ name: 'areasIntro', title: 'Service areas intro', type: 'text', rows: 3, group: 'install' }),

    // --- product range ---
    defineField({ name: 'productsHeading', title: 'Range heading', type: 'string', group: 'products' }),
    defineField({ name: 'productsIntro', title: 'Range intro', type: 'text', rows: 3, group: 'products' }),
    defineField({
      name: 'products', title: 'Products', type: 'array', group: 'products',
      description: 'Each becomes a card and a column in the comparison table. Do not put prices here - they are quoted per job.',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          { name: 'name', title: 'Name', type: 'string' },
          { name: 'tagline', title: 'Tagline', type: 'string' },
          { name: 'overview', title: 'Overview', type: 'text', rows: 3 },
          { name: 'bestFor', title: 'Best suited for', type: 'text', rows: 3 },
          { name: 'weInstall', title: 'What this one means for the install', type: 'text', rows: 3 },
          { name: 'image', title: 'Product image', type: 'image' },
          { name: 'power', title: 'Charging power', type: 'string' },
          { name: 'rangePerHour', title: 'Range per hour', type: 'string' },
          { name: 'cableLength', title: 'Cable length', type: 'string' },
          { name: 'connectivity', title: 'Connectivity', type: 'string' },
          { name: 'colours', title: 'Colour options', type: 'string' },
          { name: 'warranty', title: 'Warranty', type: 'string' }
        ],
        preview: { select: { title: 'name', subtitle: 'tagline', media: 'image' } }
      })]
    }),
    defineField({ name: 'specsHeading', title: 'Spec table heading', type: 'string', group: 'products' }),
    defineField({
      name: 'specRows', title: 'Detailed specifications', type: 'array', group: 'products',
      description: 'One row per spec. Put one value per product, in the same order as the products above. Use a dash for "not available".',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          { name: 'label', title: 'Row label', type: 'string' },
          { name: 'values', title: 'Values', type: 'array', of: [{ type: 'string' }] }
        ],
        preview: { select: { title: 'label' } }
      })]
    }),

    // --- the brand itself ---
    defineField({ name: 'aboutHeading', title: 'About heading', type: 'string', group: 'body' }),
    defineField({
      name: 'aboutText', title: 'About the brand', type: 'array', group: 'body',
      description: 'One entry per paragraph.',
      of: [defineArrayMember({ type: 'text', rows: 4 })]
    }),
    defineField({
      name: 'aboutPoints', title: 'What sets the brand apart', type: 'array', group: 'body',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'text', title: 'Text', type: 'text', rows: 3 }
        ]
      })]
    }),
    defineField({
      name: 'workHeading', title: 'Photo strip heading', type: 'string', group: 'body',
      description: 'Defaults to "<brand> installs we have done".'
    }),
    defineField({
      name: 'workSlug', title: 'Photo set', type: 'string', group: 'body',
      description: 'Which set of install photos to show. Leave empty to use the brand slug.'
    }),
    defineField({ name: 'relatedHeading', title: 'Related services heading', type: 'string', group: 'body' }),
    defineField({ name: 'relatedIntro', title: 'Related services intro', type: 'text', rows: 3, group: 'body' }),
    defineField({
      name: 'relatedServices', title: 'Related services', type: 'array', group: 'body',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })]
    }),

    // --- FAQs ---
    defineField({
      name: 'faqs', title: 'FAQs', type: 'array', group: 'faq',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          { name: 'question', title: 'Question', type: 'string' },
          { name: 'answer', title: 'Answer', type: 'text', rows: 4 }
        ],
        preview: { select: { title: 'question' } }
      })]
    }),
    defineField({ name: 'faqHeading', title: 'FAQ heading', type: 'string', group: 'faq', description: 'Defaults to "<brand> questions we get asked".' }),
    defineField({ name: 'faqNote', title: 'FAQ note', type: 'text', rows: 2, group: 'faq' }),

    // --- closing CTA ---
    defineField({ name: 'ctaEyebrow', title: 'Final CTA eyebrow', type: 'string', group: 'body' }),
    defineField({ name: 'ctaHeading', title: 'Final CTA heading', type: 'string', group: 'body' }),
    defineField({ name: 'ctaText', title: 'Final CTA text', type: 'text', rows: 3, group: 'body' })
  ],
  preview: {
    select: { title: 'name', subtitle: 'kind', media: 'logo' }
  }
});
