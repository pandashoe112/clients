import { defineType, defineField, defineArrayMember } from 'sanity';

// A service is both a card on the homepage and, when "Has a landing page" is on,
// a full page at /services/<slug>. Everything below the summary is landing-page
// content, grouped so the client is not faced with one endless form.
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    { name: 'card', title: 'Service card', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'body', title: 'Page sections' },
    { name: 'faq', title: 'FAQs' }
  ],
  fields: [
    // --- card (also used on the homepage grid) ---
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'card', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' },
      group: 'card', validation: (r) => r.required()
    }),
    defineField({
      name: 'summary', title: 'Summary', type: 'text', rows: 3, group: 'card',
      description: 'Shown on the homepage service card.',
      validation: (r) => r.required().max(200)
    }),
    defineField({
      name: 'icon', title: 'Icon', type: 'string', group: 'card',
      options: {
        list: [
          { title: 'EV charging', value: 'ev' },
          { title: 'Solar battery', value: 'battery' },
          { title: 'Heat pump hot water', value: 'hotwater' },
          { title: 'LED lighting', value: 'lighting' },
          { title: 'Switchboard', value: 'switchboard' },
          { title: 'Induction cooking', value: 'induction' }
        ]
      },
      validation: (r) => r.required()
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', group: 'card', validation: (r) => r.required() }),

    defineField({
      name: 'hasPage', title: 'Has a landing page', type: 'boolean', group: 'card', initialValue: false,
      description: 'Turn on to publish a full page at /services/<slug>. Fill in the tabs above first.'
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
      name: 'heroTicks', title: 'Trust chips', type: 'array', of: [{ type: 'string' }], group: 'hero',
      description: 'Short proof points beside the heading, e.g. "Quote within 24 hours".',
      validation: (r) => r.max(4)
    }),
    defineField({ name: 'quoteHeading', title: 'Quote form heading', type: 'string', group: 'hero' }),
    defineField({ name: 'quoteText', title: 'Quote form intro', type: 'text', rows: 2, group: 'hero' }),

    // --- page sections ---
    defineField({ name: 'guaranteeEyebrow', title: 'Guarantee eyebrow', type: 'string', group: 'body' }),
    defineField({ name: 'guaranteeHeading', title: 'Guarantee heading', type: 'string', group: 'body' }),
    defineField({ name: 'guaranteeText', title: 'Guarantee text', type: 'text', rows: 4, group: 'body' }),
    defineField({
      name: 'guaranteeImage', title: 'Guarantee photo', type: 'image', options: { hotspot: true }, group: 'body',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (r) => r.required() })]
    }),

    defineField({ name: 'processEyebrow', title: 'Process eyebrow', type: 'string', group: 'body' }),
    defineField({ name: 'processHeading', title: 'Process heading', type: 'string', group: 'body' }),
    defineField({
      name: 'processSteps', title: 'Steps', type: 'array', group: 'body',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: (r) => r.required() })
        ],
        preview: { select: { title: 'title', subtitle: 'text' } }
      })],
      validation: (r) => r.max(6)
    }),

    defineField({ name: 'diffEyebrow', title: 'Why-us eyebrow', type: 'string', group: 'body' }),
    defineField({ name: 'diffHeading', title: 'Why-us heading', type: 'string', group: 'body' }),
    defineField({ name: 'diffIntro', title: 'Why-us intro', type: 'text', rows: 3, group: 'body' }),
    defineField({
      name: 'diffItems', title: 'Why-us points', type: 'array', group: 'body',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: (r) => r.required() })
        ],
        preview: { select: { title: 'title', subtitle: 'text' } }
      })]
    }),

    defineField({ name: 'workEyebrow', title: 'Our-work eyebrow', type: 'string', group: 'body' }),
    defineField({ name: 'workHeading', title: 'Our-work heading', type: 'string', group: 'body' }),
    defineField({ name: 'brandsHeading', title: 'Brands heading', type: 'string', group: 'body' }),
    defineField({ name: 'brandsText', title: 'Brands text', type: 'text', rows: 3, group: 'body' }),

    defineField({ name: 'relatedHeading', title: 'Related services heading', type: 'string', group: 'body' }),
    defineField({
      name: 'relatedServices', title: 'Related services', type: 'array', group: 'body',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
      validation: (r) => r.max(3)
    }),

    defineField({ name: 'ctaEyebrow', title: 'Final CTA eyebrow', type: 'string', group: 'body' }),
    defineField({ name: 'ctaHeading', title: 'Final CTA heading', type: 'string', group: 'body' }),
    defineField({ name: 'ctaText', title: 'Final CTA text', type: 'text', rows: 3, group: 'body' }),

    // --- FAQs ---
    defineField({ name: 'faqEyebrow', title: 'FAQ eyebrow', type: 'string', group: 'faq' }),
    defineField({ name: 'faqHeading', title: 'FAQ heading', type: 'string', group: 'faq' }),
    defineField({ name: 'faqNote', title: 'FAQ note', type: 'text', rows: 2, group: 'faq' }),
    defineField({
      name: 'faqs', title: 'Questions', type: 'array', group: 'faq',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (r) => r.required() })
        ],
        preview: { select: { title: 'question', subtitle: 'answer' } }
      })]
    })
  ],
  orderings: [{ title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'summary', hasPage: 'hasPage' },
    prepare: ({ title, subtitle, hasPage }) => ({
      title: hasPage ? `${title} (has page)` : title,
      subtitle
    })
  }
});
