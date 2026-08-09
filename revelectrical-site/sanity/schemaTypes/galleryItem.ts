import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'galleryItem',
  title: 'Gallery item',
  type: 'document',
  fields: [
    defineField({
      name: 'image', title: 'Photo', type: 'image', options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (r) => r.required() })],
      validation: (r) => r.required()
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string', validation: (r) => r.required().max(40) }),
    defineField({ name: 'order', title: 'Display order', type: 'number' })
  ],
  preview: { select: { title: 'caption', media: 'image' } }
});
