import { defineType, defineField, defineArrayMember } from 'sanity';

// A brand is a name in the "Brands we install" menu and, when "Has a landing
// page" is on, a full page at /brands/<slug>. The page is deliberately two
// things at once: what the product is, for people searching the brand, and why
// we are the ones to fit it. Brands without a page still list in the menu.
export default defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  groups: [
    { name: 'card', title: 'Brand', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
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
      name: 'heroTicks', title: 'Hero tick list', type: 'array', group: 'hero',
      of: [defineArrayMember({ type: 'string' })]
    }),
    defineField({ name: 'heroImage', title: 'Hero image', type: 'image', group: 'hero' }),

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

    // --- why us ---
    defineField({ name: 'installHeading', title: 'Installation heading', type: 'string', group: 'body' }),
    defineField({ name: 'installIntro', title: 'Installation intro', type: 'text', rows: 3, group: 'body' }),
    defineField({
      name: 'installPoints', title: 'Installation points', type: 'array', group: 'body',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'text', title: 'Text', type: 'text', rows: 3 }
        ]
      })]
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

    // --- closing CTA ---
    defineField({ name: 'ctaHeading', title: 'Final CTA heading', type: 'string', group: 'body' }),
    defineField({ name: 'ctaText', title: 'Final CTA text', type: 'text', rows: 3, group: 'body' })
  ],
  preview: {
    select: { title: 'name', subtitle: 'kind', media: 'logo' }
  }
});
