import { defineConfig } from 'tinacms';

// Your hosting provider likely exposes this as an environment variable
const branch =
	process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';

export default defineConfig({
	branch,

	// Get this from tina.io
	clientId: process.env.TINA_CLIENT_ID,
	// Get this from tina.io
	token: process.env.TINA_TOKEN,

	build: {
		outputFolder: 'tinadmin',
		publicFolder: 'static'
	},
	media: {
		tina: {
			mediaRoot: 'images',
			publicFolder: 'static'
		}
	},
	// See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
	schema: {
		collections: [
			{
				name: 'page',
				label: 'Pages',
				path: 'src/content/pages',
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Titre SEO',
						isTitle: true,
						required: true
					},
					{
						type: 'string',
						name: 'page_title',
						label: 'Titre de la page',
						required: true
					},
					{
						type: 'string',
						name: 'description',
						label: 'Description'
					},
					{
						type: 'rich-text',
						name: 'body',
						label: 'Contenu',
						isBody: true
					}
				]
			},
			{
				name: 'gallery',
				label: 'Galeries',
				path: 'src/content/galleries',
				format: 'json',
				ui: {
					filename: {
						readonly: false,
						slugify: (values) => {
							return `${values?.title
								?.toLowerCase()
								?.replace(/ /g, '-')
								?.replace(/[^\w-]+/g, '')}`;
						}
					}
				},
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Titre de la galerie',
						isTitle: true,
						required: true
					},
					{
						type: 'string',
						name: 'description',
						label: 'Description',
						ui: {
							component: 'textarea'
						}
					},
					{
						type: 'string',
						name: 'slug',
						label: 'URL (slug)',
						required: true
					},
					{
						type: 'number',
						name: 'initialIndex',
						label: 'Image initiale'
					},
					{
						type: 'string',
						name: 'closeUrl',
						label: 'URL de redirection'
					},
					{
						type: 'boolean',
						name: 'published',
						label: 'Publié',
						ui: {
							component: 'toggle'
						}
					},
					{
						type: 'object',
						name: 'images',
						label: 'Images de la galerie',
						list: true,
						ui: {
							itemProps: (item) => ({
								label: `${item?.order || '?'} - ${item?.title || item?.alt || 'Image sans titre'}`
							}),
							defaultItem: {
								order: 1,
								published: true
							}
						},
						fields: [
							{
								type: 'image',
								name: 'src',
								label: 'Image',
								required: true
							},
							{
								type: 'string',
								name: 'title',
								label: "Titre de l'image"
							},
							{
								type: 'string',
								name: 'description',
								label: 'Description',
								ui: {
									component: 'textarea'
								}
							},
							{
								type: 'string',
								name: 'alt',
								label: 'Texte alternatif',
								required: true
							},
							{
								type: 'number',
								name: 'order',
								label: "Ordre d'affichage",
								required: true
							},
							{
								type: 'boolean',
								name: 'published',
								label: 'Visible',
								ui: {
									component: 'toggle'
								}
							}
						]
					}
				]
			}
		]
	}
});
