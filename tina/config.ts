// tina/config.ts
import { defineConfig } from 'tinacms';

// Your hosting provider likely exposes this as an environment variable
const branch =
	process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';

export default defineConfig({
	branch,
	// Get this from tina.io
	clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
	// Get this from tina.io
	token: process.env.TINA_TOKEN,
	build: {
		outputFolder: 'tina',
		publicFolder: 'static'
	},
	media: {
		tina: {
			mediaRoot: 'images',
			publicFolder: 'static'
		}
	},
	schema: {
		collections: [
			{
				name: 'page',
				label: 'Pages',
				path: 'src/content/pages',
				format: 'mdx',
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
						label: 'Body',
						isBody: true,
						templates: [
							{
								name: 'Image',
								label: 'Image',
								fields: [
									{
										type: 'image',
										name: 'src',
										label: 'Image',
										required: true
									},
									{
										type: 'string',
										name: 'alt',
										label: 'Texte alternatif',
										required: true
									},
									{
										type: 'string',
										name: 'width',
										label: 'Largeur',
										options: [
											{ value: 'sm', label: 'Petite' },
											{ value: 'md', label: 'Moyenne' },
											{ value: 'lg', label: 'Grande' },
											{ value: 'full', label: 'Pleine largeur' }
										]
									},
									{
										type: 'string',
										name: 'alignment',
										label: 'Alignement',
										options: [
											{ value: 'left', label: 'Gauche' },
											{ value: 'right', label: 'Droit' }
										]
									},
									{
										type: 'boolean',
										name: 'border',
										label: 'Bordure'
									},
									{
										type: 'string',
										name: 'class',
										label: 'Classes CSS'
									},
									{
										type: 'string',
										name: 'sizes',
										label: 'Tailles (attribut sizes)'
									}
								],
								ui: {
									defaultItem: {
										alignment: 'center',
										width: 'large'
									},
									itemProps: (item) => ({
										label: item?.alt || item?.caption || 'Image'
									})
								}
							},
							{
								name: 'Gallery',
								label: 'Galerie',
								fields: [
									{
										type: 'reference',
										name: 'src',
										label: 'Galerie',
										collections: ['gallery'],
										required: true
									}
								]
							},
							{
								name: 'GoogleReviews',
								label: 'Avis Google',
								fields: [
									{
										type: 'string',
										name: 'title',
										label: 'Titre'
									}
								]
							}
						]
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
								label: `${item?.title || item?.alt || 'Image sans titre'}`
							}),
							defaultItem: {
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
