// Reference copy of the deployed schema. The deployed one wins — change it with
// the MCP `deploy_schema` tool and keep this file in step.
export default {
  name: 'aboutPage',
  type: 'document',
  title: 'About page',
  groups: [
    {name: 'seo', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'story', title: 'Our story'},
    {name: 'business', title: 'Our business'},
    {name: 'contact', title: 'Contact'}
  ],
  fields: [
    {name: 'seoTitle', type: 'string', title: 'SEO title', group: 'seo'},
    {name: 'seoDescription', type: 'text', rows: 3, title: 'SEO description', group: 'seo'},

    {name: 'heroEyebrow', type: 'string', title: 'Eyebrow', group: 'hero'},
    {name: 'heroHeading', type: 'string', title: 'Heading', group: 'hero'},
    {name: 'heroIntro', type: 'text', rows: 4, title: 'Intro paragraph', group: 'hero'},

    {name: 'storyHeading', type: 'string', title: 'Heading', group: 'story'},
    {name: 'storyParagraphs', type: 'array', title: 'Paragraphs', of: [{type: 'text'}], group: 'story'},
    {
      name: 'storyImage',
      type: 'image',
      title: 'Photo',
      options: {hotspot: true},
      group: 'story',
      fields: [{name: 'alt', type: 'string', title: 'Alt text'}]
    },

    {name: 'businessEyebrow', type: 'string', title: 'Eyebrow', group: 'business'},
    {name: 'businessHeading', type: 'string', title: 'Heading', group: 'business'},
    {name: 'businessBody', type: 'text', rows: 5, title: 'Paragraph', group: 'business'},
    {
      name: 'businessRows',
      type: 'array',
      title: 'Business details',
      group: 'business',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Label'},
            {name: 'value', type: 'string', title: 'Value'}
          ],
          preview: {select: {title: 'label', subtitle: 'value'}}
        }
      ]
    },
    {name: 'businessPoints', type: 'array', title: 'Tick points', of: [{type: 'string'}], group: 'business'},

    {name: 'contactEyebrow', type: 'string', title: 'Eyebrow', group: 'contact'},
    {name: 'contactHeading', type: 'string', title: 'Heading', group: 'contact'},
    {name: 'contactIntro', type: 'text', rows: 3, title: 'Intro', group: 'contact'}
  ],
  preview: {select: {title: 'heroHeading'}}
};
