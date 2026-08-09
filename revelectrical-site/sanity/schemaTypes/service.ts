import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: (r) => r.required().max(200) }),
    defineField({
      name: 'icon', title: 'Icon', type: 'string',
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
    defineField({ name: 'order', title: 'Display order', type: 'number', validation: (r) => r.required() })
  ],
  orderings: [{ title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'summary' } }
});
