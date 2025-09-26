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
			mediaRoot: '',
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
					allowedActions: {
						create: true,
						delete: true
					}
				},
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Titre'
					},
					{
						type: 'string',
						name: 'description',
						label: 'Description'
					},
					{
						type: 'number',
						name: 'initialIndex',
						label: 'Position initiale'
					},
					{
						type: 'string',
						name: 'closeUrl',
						label: 'URL de redirection'
					},
					{
						type: 'object',
						name: 'images',
						label: 'Images',
						list: true,
						fields: [
							{
								type: 'string',
								name: 'url',
								label: 'Nom du fichier'
							},
							{
								type: 'string',
								name: 'title',
								label: 'Titre'
							},
							{
								type: 'string',
								name: 'alt',
								label: 'Alternative'
							},
							{
								type: 'string',
								name: 'description',
								label: 'Description'
							},
							{
								type: 'number',
								name: 'order',
								label: "Ordre d'apparition dans le carousel"
							},
							{
								type: 'boolean',
								name: 'visible',
								label: 'Visible'
							}
						]
					}
				]
			}
		]
	}
});
