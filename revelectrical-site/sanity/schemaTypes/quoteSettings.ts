import { defineType, defineField } from 'sanity';

// The wording and terms wrapped around every quote the builder produces.
export default defineType({
  name: 'quoteSettings',
  title: 'Quote builder settings',
  type: 'document',
  description: 'The wording and terms that wrap around every quote the builder produces.',
  groups: [
    { name: 'intro', title: 'Page wording', default: true },
    { name: 'terms', title: 'Inclusions and terms' },
    { name: 'numbers', title: 'GST and validity' }
  ],
  fields: [
    defineField({ name: 'introHeading', title: 'Page heading', type: 'string', group: 'intro' }),
    defineField({
      name: 'introText', title: 'Line under the heading', type: 'text', rows: 2, group: 'intro',
      description: 'Keep it to about 100 characters - it is held to two lines on the page.'
    }),
    defineField({ name: 'validDays', title: 'How many days a quote stays valid', type: 'number', initialValue: 30, group: 'numbers' }),
    defineField({
      name: 'gstRate', title: 'GST rate (%)', type: 'number', initialValue: 10, group: 'numbers',
      description: 'Leave at 10 unless the rate changes.'
    }),
    defineField({
      name: 'inclusions', title: 'What every quote includes', type: 'array', of: [{ type: 'string' }], group: 'terms',
      description: 'One per line. These are your selling points - the reasons you are worth the price.'
    }),
    defineField({
      name: 'exclusions', title: 'What is not included', type: 'array', of: [{ type: 'string' }], group: 'terms',
      description: 'One per line. This is what protects you from an argument later.'
    }),
    defineField({
      name: 'terms', title: 'Terms', type: 'array', of: [{ type: 'string' }], group: 'terms',
      description: 'Numbered on the quote.'
    }),
    defineField({
      name: 'closingNote', title: 'Note above the terms', type: 'text', rows: 3, group: 'terms',
      description: 'The paragraph that makes clear the quote is indicative until you confirm it.'
    })
  ],
  preview: { select: { title: 'introHeading' } }
});
