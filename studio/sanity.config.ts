import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'DUNK Landing Pages',

  projectId: 'me0j4kdl',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Landing pages')
              .child(
                S.documentTypeList('landingPage')
                  .title('Landing pages')
                  .defaultOrdering([{field: 'internalTitle', direction: 'asc'}]),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Every landing page is created by scripts/new-site.mjs with a fixed _id that
    // matches its site folder, so there is no "create new" path in the Studio.
    newDocumentOptions: () => [],
  },
})
