import {defineField, defineType} from 'sanity'

/**
 * One document per landing page site.
 *
 * The document `_id` is the site slug (e.g. `affordable-car-accessories`) and is
 * what each Netlify build looks up via its SITE_ID environment variable. Keep it
 * stable — changing it orphans the site from its content.
 *
 * Scope rule: only content that changes per client *and* is worth editing without
 * a deploy lives here. Everything below the hero (services, brands, process,
 * gallery, reviews) is per-site code in `sites/<slug>/src/sections/`.
 */
export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing page',
  type: 'document',
  groups: [
    {name: 'seo', title: 'SEO', default: true},
    {name: 'tracking', title: 'Tracking'},
    {name: 'header', title: 'Header'},
    {name: 'hero', title: 'Hero'},
    {name: 'form', title: 'Quote form'},
    {name: 'thankYou', title: 'Thank you'},
    {name: 'business', title: 'Business'},
  ],
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal name',
      description: 'Only shown in this Studio, never on the site.',
      type: 'string',
      group: 'seo',
      validation: (Rule) => Rule.required(),
    }),

    // ---------------------------------------------------------------- SEO
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'title',
          title: 'Meta title',
          type: 'string',
          description: 'Shown in the browser tab and as the Google result headline. Aim for under 60 characters.',
          validation: (Rule) => Rule.required().max(70).warning('Titles over 60 characters usually get truncated in search results.'),
        }),
        defineField({
          name: 'description',
          title: 'Meta description',
          type: 'text',
          rows: 3,
          description: 'The grey summary text under the Google result. Aim for 140–155 characters.',
          validation: (Rule) => Rule.required().max(180).warning('Descriptions over 155 characters usually get truncated in search results.'),
        }),
        defineField({
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: 'The live address of this page, e.g. https://dashcams.example.com.au. Used for the canonical tag and social share links.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'ogImage',
          title: 'Social share image',
          type: 'image',
          description: 'Shown when the page is shared on Facebook, LinkedIn or in a text message. 1200×630 works best.',
          options: {hotspot: true},
        }),
        defineField({
          name: 'noindex',
          title: 'Hide from search engines',
          type: 'boolean',
          description: 'Turn on while the page is in draft or if it is a paid-traffic-only page you do not want indexed.',
          initialValue: false,
        }),
      ],
    }),

    // ----------------------------------------------------------- Tracking
    defineField({
      name: 'tracking',
      title: 'Tracking',
      type: 'object',
      group: 'tracking',
      description: 'Leave blank to load no tracking scripts at all.',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'adsConversionId',
          title: 'Google Ads conversion ID',
          type: 'string',
          description: 'Starts with AW- , e.g. AW-123456789.',
          validation: (Rule) =>
            Rule.regex(/^AW-[0-9]+$/, {name: 'Google Ads conversion ID'}).error('Must look like AW-123456789.'),
        }),
        defineField({
          name: 'adsConversionLabel',
          title: 'Google Ads conversion label',
          type: 'string',
          description: 'The short code Google gives you alongside the conversion ID, e.g. AbC-D_efG.',
        }),
        defineField({
          name: 'ga4Id',
          title: 'GA4 measurement ID',
          type: 'string',
          description: 'Starts with G- , e.g. G-ABCD1234.',
          validation: (Rule) =>
            Rule.regex(/^G-[A-Z0-9]+$/, {name: 'GA4 measurement ID'}).error('Must look like G-ABCD1234.'),
        }),
      ],
    }),

    // ------------------------------------------------------------- Header
    defineField({
      name: 'header',
      title: 'Header',
      type: 'object',
      group: 'header',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'logo',
          title: 'Logo',
          type: 'image',
          description: 'Used in the header and the footer. A transparent PNG or SVG works best.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'logoAlt',
          title: 'Logo alt text',
          type: 'string',
          description: 'Usually just the business name.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'navItems',
          title: 'Navigation links',
          type: 'array',
          description: 'The links across the top. Anchor must match a section on the page.',
          of: [
            defineField({
              name: 'navItem',
              type: 'object',
              fields: [
                defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
                defineField({
                  name: 'anchor',
                  title: 'Anchor',
                  type: 'string',
                  description: 'Section id without the #, e.g. why, services, work, reviews.',
                  validation: (Rule) =>
                    Rule.required().regex(/^[a-z0-9-]+$/, {name: 'anchor'}).error('Lowercase letters, numbers and hyphens only, with no leading #.'),
                }),
              ],
              preview: {select: {title: 'label', subtitle: 'anchor'}},
            }),
          ],
          validation: (Rule) => Rule.max(6).warning('More than six links gets cramped on smaller laptops.'),
        }),
        defineField({
          name: 'availabilityChip',
          title: 'Availability chip',
          type: 'string',
          description: 'The small green pill next to the phone number, e.g. "Available now". Leave blank to hide it.',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button label',
          type: 'string',
          description: 'The header button. It always scrolls to the quote form.',
          initialValue: 'Get a quote',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    // --------------------------------------------------------------- Hero
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow',
          type: 'string',
          description: 'The small uppercase line above the headline.',
        }),
        defineField({
          name: 'headlineLines',
          title: 'Headline',
          type: 'array',
          of: [{type: 'string'}],
          description: 'One entry per line. Two or three short lines reads best — this is the H1.',
          validation: (Rule) => Rule.required().min(1).max(3),
        }),
        defineField({
          name: 'subcopy',
          title: 'Sub-copy',
          type: 'text',
          rows: 3,
          description: 'The paragraph under the headline. Two sentences is about right.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'ticks',
          title: 'Tick list',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Short proof points with a tick beside them. Three is the sweet spot.',
          validation: (Rule) => Rule.max(4).warning('More than four ticks pushes the form below the fold on laptops.'),
        }),
        defineField({
          name: 'backgroundImage',
          title: 'Background image',
          type: 'image',
          description: 'Sits behind the hero under a dark overlay, so pick something with a clear subject and no text.',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Describe the photo for screen readers and image search.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'primaryCtaLabel',
          title: 'Primary button label',
          type: 'string',
          initialValue: 'Get a free quote',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'secondaryCtaLabel',
          title: 'Secondary button label',
          type: 'string',
          description: 'The call button. Leave blank to show only the primary button.',
        }),
        defineField({
          name: 'review',
          title: 'Review badge',
          type: 'object',
          description: 'The Google rating chip under the buttons.',
          options: {collapsible: true, collapsed: false},
          fields: [
            defineField({
              name: 'show',
              title: 'Show review badge',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'score',
              title: 'Score',
              type: 'number',
              description: 'Out of 5, e.g. 5.0.',
              validation: (Rule) => Rule.min(0).max(5),
            }),
            defineField({
              name: 'count',
              title: 'Number of reviews',
              type: 'number',
              validation: (Rule) => Rule.min(0).integer(),
            }),
          ],
        }),
      ],
    }),

    // --------------------------------------------------------------- Form
    defineField({
      name: 'form',
      title: 'Quote form',
      type: 'object',
      group: 'form',
      options: {collapsible: false},
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'Get a free quote', validation: (Rule) => Rule.required()}),
        defineField({
          name: 'subcopy',
          title: 'Sub-copy',
          type: 'text',
          rows: 2,
          description: 'The reassurance line under the heading.',
        }),
        defineField({
          name: 'fields',
          title: 'Questions',
          type: 'array',
          description:
            'The questions this client asks. Order here is the order on the page. Every submission also carries the Google Ads click ID and UTM tags automatically — you do not need to add those.',
          of: [
            defineField({
              name: 'formField',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  description: 'What the visitor sees, e.g. "Your name".',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'name',
                  title: 'Field name',
                  type: 'string',
                  description:
                    'The column name in the Netlify inbox, e.g. business_name. Lowercase, no spaces. Changing this on a live page splits your submission history.',
                  validation: (Rule) =>
                    Rule.required()
                      .regex(/^[a-z][a-z0-9_]*$/, {name: 'field name'})
                      .error('Lowercase letters, numbers and underscores only, starting with a letter.')
                      .custom((value) =>
                        ['form-name', 'form_location', 'bot-field', 'gclid', 'page_url'].includes(value ?? '')
                          ? 'That name is reserved by the form itself. Pick another.'
                          : true,
                      ),
                }),
                defineField({
                  name: 'type',
                  title: 'Type',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Short text', value: 'text'},
                      {title: 'Phone number', value: 'tel'},
                      {title: 'Email address', value: 'email'},
                      {title: 'Dropdown', value: 'select'},
                      {title: 'Long text', value: 'textarea'},
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'text',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'options',
                  title: 'Dropdown choices',
                  type: 'array',
                  of: [{type: 'string'}],
                  description: 'Only used when the type is Dropdown.',
                  hidden: ({parent}) => parent?.type !== 'select',
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder',
                  type: 'string',
                  description: 'Faint example text inside the box. Not used for dropdowns.',
                  hidden: ({parent}) => parent?.type === 'select',
                }),
                defineField({
                  name: 'required',
                  title: 'Required',
                  type: 'boolean',
                  initialValue: true,
                }),
              ],
              preview: {
                select: {title: 'label', subtitle: 'name', type: 'type'},
                prepare: ({title, subtitle, type}) => ({
                  title,
                  subtitle: `${subtitle} · ${type ?? 'text'}`,
                }),
              },
            }),
          ],
          validation: (Rule) =>
            Rule.required()
              .min(1)
              .custom((fields) => {
                const names = (fields ?? []).map((f) => f?.name).filter(Boolean)
                const duplicate = names.find((name, i) => names.indexOf(name) !== i)
                return duplicate ? `Two questions both use the field name "${duplicate}".` : true
              }),
        }),
        defineField({name: 'submitLabel', title: 'Submit button label', type: 'string', initialValue: 'Get my free quote', validation: (Rule) => Rule.required()}),
        defineField({
          name: 'footnote',
          title: 'Footnote',
          type: 'string',
          description: 'The small print under the button, e.g. a privacy reassurance.',
        }),
      ],
    }),

    // ---------------------------------------------------------- Thank you
    defineField({
      name: 'thankYou',
      title: 'Thank you page',
      type: 'object',
      group: 'thankYou',
      description: 'The /thank-you/ page people land on after submitting. This is the URL you use as your Google Ads conversion trigger.',
      options: {collapsible: false},
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'Thanks, we have your request', validation: (Rule) => Rule.required()}),
        defineField({name: 'subcopy', title: 'Sub-copy', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
        defineField({
          name: 'bullets',
          title: '"What happens next" list',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Leave empty to hide the list.',
        }),
      ],
    }),

    // ----------------------------------------------------------- Business
    defineField({
      name: 'business',
      title: 'Business details',
      type: 'object',
      group: 'business',
      description: 'Used in the header, footer, call buttons and the LocalBusiness structured data.',
      options: {collapsible: false},
      fields: [
        defineField({name: 'name', title: 'Business name', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({
          name: 'phone',
          title: 'Phone number',
          type: 'string',
          description: 'As you want it displayed, e.g. 0402 482 884. Spaces are stripped automatically for the tel: link.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.email()}),
        defineField({name: 'abn', title: 'ABN', type: 'string'}),
        defineField({name: 'streetAddress', title: 'Street address', type: 'string'}),
        defineField({name: 'suburb', title: 'Suburb', type: 'string'}),
        defineField({name: 'state', title: 'State', type: 'string', description: 'e.g. VIC'}),
        defineField({name: 'postcode', title: 'Postcode', type: 'string'}),
        defineField({
          name: 'serviceArea',
          title: 'Service area',
          type: 'string',
          description: 'e.g. "Mobile installs across Melbourne". Shown in the footer.',
        }),
        defineField({
          name: 'about',
          title: 'About paragraph',
          type: 'text',
          rows: 4,
          description: 'The short business description in the footer.',
        }),
        defineField({
          name: 'legalLinks',
          title: 'Legal links',
          type: 'array',
          description: 'Terms, privacy policy and similar. Shown in the footer bar.',
          of: [
            defineField({
              name: 'legalLink',
              type: 'object',
              fields: [
                defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
                defineField({name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required()}),
              ],
              preview: {select: {title: 'label', subtitle: 'url'}},
            }),
          ],
        }),
      ],
    }),
  ],

  preview: {
    select: {title: 'internalTitle', subtitle: 'seo.canonicalUrl', media: 'header.logo'},
  },
})
