import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'businessName', title: 'Business name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'phone', title: 'Phone (as displayed)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'phoneHref', title: 'Phone link', type: 'string', description: 'Format: tel:+61432555826', validation: (r) => r.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (r) => r.required().email() }),
    defineField({ name: 'licence', title: 'Licence number', type: 'string', description: 'Shown as REC 38205' }),
    defineField({ name: 'established', title: 'Established year', type: 'number' }),
    defineField({ name: 'ratingValue', title: 'Google rating', type: 'string', description: 'Update when the rating changes' }),
    defineField({ name: 'reviewCount', title: 'Number of reviews', type: 'number' }),
    defineField({ name: 'announcementText', title: 'Announcement bar text', type: 'string' }),
    defineField({ name: 'announcementCtaLabel', title: 'Announcement link label', type: 'string' }),
    defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
    defineField({ name: 'facebookUrl', title: 'Facebook URL', type: 'url' })
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) }
});
