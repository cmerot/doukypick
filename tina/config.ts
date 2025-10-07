// tina/config.ts
import { defineConfig } from 'tinacms';

// Your hosting provider likely exposes this as an environment variable
const branch = 'preview';

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
				label: 'Paramètres du site',
				name: 'settings',
				path: 'src/content/settings',
				format: 'json',
				fields: [
					{
						type: 'string',
						label: 'Titre du site',
						name: 'title'
					},
					{
						type: 'object',
						name: 'menu',
						label: 'Menu principal',
						list: true,
						ui: {
							defaultItem: {
								alignment: 'center',
								width: 'large'
							},
							itemProps: (item) => ({
								label: item.label
							})
						},
						fields: [
							{
								type: 'string',
								name: 'label',
								label: 'Label',
								required: true
							},
							{
								type: 'string',
								name: 'href',
								label: 'URL',
								required: true
							}
						]
					}
				],
				ui: {
					allowedActions: {
						create: false,
						delete: false
					}
				}
			},
			{
				name: 'page',
				label: 'Pages',
				path: 'src/content/pages',
				format: 'mdx',
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Titre',
						isTitle: true,
						required: true
					},
					{
						type: 'string',
						name: 'subtitle',
						label: 'Sous-titre'
					},
					{
						type: 'string',
						name: 'description',
						label: 'Description (moteurs de recherche)'
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
						name: 'orientation',
						label: 'Orientation',
						options: [
							{ value: 'portrait', label: 'Portrait' },
							{ value: 'landscape', label: 'Paysage' }
						]
					},
					{
						type: 'string',
						name: 'aspectRatio',
						label: 'Ratio',
						options: [
							{ value: '16/9', label: '16:9 (HDTV)' },
							{ value: '3/2', label: '3:2 (impression, album)' },
							{ value: '4/3', label: '4:3 (caméra numérique)' },
							{ value: '5/4', label: '5:4 (format pro)' },
							{ value: '1/1', label: '1:1 (carré)' }
						]
					},
					{
						type: 'string',
						name: 'slug',
						label: 'Identifiant unique',
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
						label: "URL de redirection (en cas d'accès direct à une photo)"
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
