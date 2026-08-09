import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'revelectrical',
  title: 'Revelectrical',
  projectId: 'mt5betow',
  dataset: 'production',
  plugins: [
    structureTool({
      // Singletons appear as one editable page, not a list the client can add to.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem().title('Homepage').child(S.document().schemaType('homePage').documentId('homePage')),
            S.listItem().title('Site settings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('service').title('Services'),
            S.documentTypeListItem('galleryItem').title('Gallery'),
            S.documentTypeListItem('review').title('Reviews'),
            S.documentTypeListItem('suburb').title('Suburbs')
          ])
    })
  ],
  schema: { types: schemaTypes }
});
