import { defineType, defineField } from 'sanity';

// The price list behind the quote builder. Field labels are written for the
// client rather than for a developer: the person editing these is an
// electrician pricing his own work, not someone who knows what a slug is.
export default defineType({
  name: 'quoteItem',
  title: 'Price list item',
  type: 'document',
  description: 'One line a customer can add to a quote in the quote builder.',
  fieldsets: [
    { name: 'pricing', title: 'Pricing', options: { collapsible: false } },
    { name: 'display', title: 'How it shows up', options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: 'name', title: 'What the customer sees', type: 'string',
      description: 'Write it the way you would say it on the phone, e.g. "Switchboard upgrade, single phase".'
    }),
    defineField({
      name: 'blurb', title: 'One line of detail', type: 'text', rows: 2,
      description: 'The small print under the name. Say what is included so nobody is surprised.'
    }),
    defineField({
      name: 'category', title: 'Where it belongs', type: 'string',
      description: 'Decides which step of the quote builder this appears on.',
      options: {
        list: [
          { title: 'Chargers', value: 'ev' },
          { title: 'Batteries', value: 'battery' },
          { title: 'Accessories - lighting', value: 'lighting' },
          { title: 'Accessories - around the home', value: 'home' },
          { title: 'Safety and switchboard', value: 'switchboard' }
        ]
      }
    }),
    // Stored without GST because that is how a trade price is quoted to
    // yourself; the site adds GST for the customer-facing figure.
    defineField({
      name: 'price', title: 'Your price, EXCLUDING GST', type: 'number', fieldset: 'pricing',
      description: 'Whole dollars, no GST. The quote adds GST on top and shows the customer the inc-GST figure. Enter 1818 and the customer sees $2,000.'
    }),
    defineField({
      name: 'unit', title: 'Priced per what?', type: 'string', fieldset: 'pricing',
      description: 'Leave blank for a one-off price. Use "each" or "per metre" when the price repeats.'
    }),
    defineField({
      name: 'allowQty', title: 'Let the customer choose how many', type: 'boolean',
      initialValue: false, fieldset: 'pricing',
      description: 'Turn on for things people buy several of - downlights, power points, smoke alarms.'
    }),
    defineField({ name: 'maxQty', title: 'Most they can pick', type: 'number', initialValue: 20, fieldset: 'pricing' }),
    defineField({
      name: 'priceNote', title: 'Word before the price', type: 'string', fieldset: 'display',
      description: 'Use "from" when the price can move. Leave blank when it is fixed.'
    }),
    defineField({ name: 'popular', title: 'Show a "Popular" tag', type: 'boolean', initialValue: false, fieldset: 'display' }),
    defineField({
      name: 'order', title: 'Position in the list', type: 'number', fieldset: 'display',
      description: 'Lower numbers appear first.'
    }),
    defineField({
      name: 'active', title: 'Show this on the website', type: 'boolean', initialValue: true, fieldset: 'display',
      description: 'Turn off to retire an item without deleting it or losing its price.'
    })
  ],
  orderings: [
    { name: 'byOrder', title: 'List order', by: [{ field: 'order', direction: 'asc' }] },
    { name: 'byCategory', title: 'Category', by: [{ field: 'category', direction: 'asc' }, { field: 'order', direction: 'asc' }] },
    { name: 'byPrice', title: 'Price, highest first', by: [{ field: 'price', direction: 'desc' }] }
  ],
  preview: { select: { title: 'name', subtitle: 'blurb' } }
});
