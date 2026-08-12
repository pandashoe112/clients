import { defineType, defineField, defineArrayMember } from 'sanity';

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
    defineField({ name: 'facebookUrl', title: 'Facebook URL', type: 'url' }),
    defineField({
      name: 'accreditations', title: 'Accreditation badges', type: 'array',
      description: 'Shown in the footer. Upload the badge artwork exactly as the brand supplies it — it is displayed at its own aspect ratio, so do not crop or recolour it.',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string', description: 'Used as the image alt text, e.g. "Evnex Certified Installer".', validation: (r) => r.required() }),
          defineField({ name: 'logo', title: 'Badge artwork', type: 'image', validation: (r) => r.required() }),
          defineField({ name: 'url', title: 'Link', type: 'url', description: 'Optional. Links the badge to the certifying brand.' })
        ],
        preview: { select: { title: 'name', media: 'logo' } }
      })]
    })
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) }
});
