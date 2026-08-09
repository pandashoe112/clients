import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({ name: 'authorName', title: 'Reviewer name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'reviewedAt', title: 'Review date', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'rating', title: 'Rating', type: 'number', initialValue: 5, validation: (r) => r.required().min(1).max(5).integer() }),
    defineField({ name: 'body', title: 'Review text', type: 'text', rows: 6, validation: (r) => r.required() }),
    defineField({
      name: 'photo',
      title: 'Reviewer photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. Reviewers without a photo show initials instead.'
    })
  ],
  orderings: [{ title: 'Newest first', name: 'newest', by: [{ field: 'reviewedAt', direction: 'desc' }] }],
  preview: { select: { title: 'authorName', subtitle: 'body' } }
});
