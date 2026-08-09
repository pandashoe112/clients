import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'suburb',
  title: 'Suburb',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Suburb', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'postcode', title: 'Postcode', type: 'string', validation: (r) => r.required().length(4) }),
    defineField({ name: 'order', title: 'Display order', type: 'number' })
  ],
  preview: { select: { title: 'name', subtitle: 'postcode' } }
});
