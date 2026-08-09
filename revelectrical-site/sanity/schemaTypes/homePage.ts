import { defineType, defineField, defineArrayMember } from 'sanity';

// Icons the client can pick from. Anything not on this list cannot be entered,
// so the design stays intact no matter what they type.
const ICONS = [
  { title: 'Shield', value: 'shield' },
  { title: 'Document', value: 'document' },
  { title: 'Chat', value: 'chat' },
  { title: 'Price tag', value: 'tag' },
  { title: 'Calendar', value: 'calendar' },
  { title: 'Phone', value: 'phone' }
];

const image = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (r) => r.required() })],
    validation: (r) => r.required()
  });

export default defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'body', title: 'Page sections' },
    { name: 'contact', title: 'Contact' }
  ],
  fields: [
    defineField({ name: 'seoTitle', title: 'Browser tab title', type: 'string', group: 'seo', validation: (r) => r.required().max(60) }),
    defineField({ name: 'seoDescription', title: 'Search description', type: 'text', rows: 3, group: 'seo', validation: (r) => r.required().max(160) }),

    defineField({ name: 'heroHeadingStart', title: 'Heading, first part', type: 'string', group: 'hero', validation: (r) => r.required() }),
    defineField({ name: 'heroHeadingHighlight', title: 'Heading, highlighted words', type: 'string', group: 'hero', description: 'Shown in lime', validation: (r) => r.required() }),
    defineField({ name: 'heroHeadingEnd', title: 'Heading, last part', type: 'string', group: 'hero' }),
    defineField({
      name: 'heroTicks', title: 'Tick list', type: 'array', group: 'hero',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.min(2).max(6).error('Between two and six items keeps the layout balanced')
    }),
    defineField({ name: 'heroIntro', title: 'Intro paragraph', type: 'text', rows: 4, group: 'hero', validation: (r) => r.required() }),
    { ...image('heroImage', 'Hero photo'), group: 'hero' },

    defineField({
      name: 'featureItems', title: 'Feature strip', type: 'array', group: 'body',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: ICONS }, validation: (r) => r.required() }),
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'text', title: 'Text', type: 'text', rows: 2, validation: (r) => r.required() })
        ],
        preview: { select: { title: 'title', subtitle: 'text' } }
      })],
      validation: (r) => r.length(4).error('The strip is built for exactly four items')
    }),

    defineField({ name: 'servicesHeading', title: 'Services heading', type: 'string', group: 'body', validation: (r) => r.required() }),
    defineField({ name: 'servicesIntro', title: 'Services intro', type: 'text', rows: 3, group: 'body' }),
    defineField({ name: 'servicesNote', title: 'Services footnote', type: 'string', group: 'body', description: 'Italic line under the service grid' }),

    defineField({ name: 'promptHeading', title: 'Photo panel heading', type: 'string', group: 'body' }),
    defineField({ name: 'promptText', title: 'Photo panel text', type: 'text', rows: 4, group: 'body' }),
    defineField({ name: 'promptCtaLabel', title: 'Photo panel button label', type: 'string', group: 'body' }),
    { ...image('promptImage', 'Photo panel image'), group: 'body' },

    defineField({ name: 'processHeading', title: 'How it works heading', type: 'string', group: 'body' }),
    defineField({
      name: 'processSteps', title: 'Steps', type: 'array', group: 'body',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: ICONS }, validation: (r) => r.required() }),
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: (r) => r.required() })
        ],
        preview: { select: { title: 'title', subtitle: 'text' } }
      })],
      validation: (r) => r.min(3).max(5)
    }),

    defineField({ name: 'areasHeading', title: 'Service areas heading', type: 'string', group: 'body' }),
    defineField({ name: 'areasText', title: 'Service areas text', type: 'text', rows: 4, group: 'body' }),

    defineField({ name: 'whyHeading', title: 'Why us heading', type: 'string', group: 'body' }),
    defineField({ name: 'whyParagraphs', title: 'Why us paragraphs', type: 'array', group: 'body', of: [defineArrayMember({ type: 'text', rows: 4 })] }),
    defineField({ name: 'whyPoints', title: 'Why us tick list', type: 'array', group: 'body', of: [defineArrayMember({ type: 'string' })] }),
    { ...image('whyImage', 'Why us photo'), group: 'body' },

    defineField({ name: 'galleryHeading', title: 'Gallery heading', type: 'string', group: 'body' }),
    defineField({ name: 'galleryIntro', title: 'Gallery intro', type: 'string', group: 'body' }),

    defineField({ name: 'brandsHeading', title: 'Brands heading', type: 'string', group: 'body' }),
    defineField({ name: 'brandsText', title: 'Brands text', type: 'text', rows: 3, group: 'body' }),
    defineField({
      name: 'brands', title: 'Brands', type: 'array', group: 'body',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
          defineField({
            name: 'logo', title: 'Logo', type: 'image',
            description: 'Optional. Brands without a logo show their name as text instead.'
          })
        ],
        preview: { select: { title: 'name', media: 'logo' } }
      })]
    }),

    defineField({ name: 'contactHeading', title: 'Contact heading', type: 'string', group: 'contact', validation: (r) => r.required() }),
    defineField({ name: 'contactIntro', title: 'Contact intro', type: 'text', rows: 3, group: 'contact' }),
    { ...image('contactImage', 'Contact photo'), group: 'contact' }
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) }
});
