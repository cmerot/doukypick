import type { Gallery, GalleryImage, ImageData } from '$lib/components/gallery/types';
import { processImage } from '$lib/components/gallery/utils';

// Mock gallery images
export const mockImages: GalleryImage[] = [
	{
		src: '/images/galleries/tatouages/IMG_20240405_230428_904.jpg',
		title: 'Héron en vol - Oiseau majestueux',
		description:
			"Tatouage élégant d'un héron aux ailes déployées, réalisé avec un trait fin et des détails précis des plumes, style réaliste en noir et blanc",
		alt: "Tatouage d'un héron aux ailes déployées sur l'épaule",
		order: 1,
		published: true
	},
	{
		src: '/images/galleries/tatouages/IMG_20240326_155654_135.jpg',
		title: 'Danse macabre - Squelette et femme',
		description:
			'Tatouage artistique en noir et blanc représentant une scène de danse macabre avec un squelette tenant une femme, style détaillé avec des éléments décoratifs et des feuilles',
		alt: 'Tatouage sur cuisse représentant une danse entre un squelette et une femme',
		order: 2,
		published: true
	},
	{
		src: '/images/galleries/tatouages/IMG_20240410_211419_241.jpg',
		title: 'T-Rex rugissant',
		description:
			"Tatouage dynamique d'un Tyrannosaurus Rex rugissant, style cartoon avec des traits nets et des détails anatomiques précis sur l'avant-bras",
		alt: 'Tatouage de dinosaure T-Rex sur avant-bras',
		order: 3,
		published: true
	},
	{
		src: '/images/galleries/tatouages/IMG_20240501_200148_384.jpg',
		title: 'Walkman et casque vintages',
		description: 'Tatouage meta représentant un walkman vintage avec un casque',
		alt: 'Tatouage représentant un walkman rétro avec un casque',
		order: 4,
		published: true
	},
	{
		src: '/images/galleries/tatouages/IMG_20240716_092311_429.jpg',
		title: 'Pieuvre aux tentacules ornés',
		description:
			"Tatouage impressionnant d'une pieuvre avec des tentacules aux ventouses méticuleusement détaillées, excellent travail de ligne et de texture",
		alt: 'Tatouage de pieuvre avec tentacules détaillées et ventouses sur la jambe',
		order: 5,
		published: true
	},
	{
		src: '/images/galleries/tatouages/IMG_20240829_174950.jpg',
		title: 'Serpent et roses entrelacés',
		description:
			"Composition élégante d'un serpent aux écailles détaillées s'enroulant autour de roses épanouies, alliant danger et beauté dans un style réaliste",
		alt: "Tatouage d'un serpent s'enroulant autour de roses sur le mollet",
		order: 6,
		published: true
	}
];

// Mock gallery data
export const mockGallery: Gallery = {
	title: "Salon de tatouage Le P'tit Cap'",
	description: 'Le salon de tatouage de Doukypick, à Bègles (limitrophe à Bordeaux)',
	slug: 'salon',
	closeUrl: '/salon-le-ptit-cap',
	initialIndex: 0,
	images: mockImages
};

// Mock processed images for components that need ImageData[]
export const mockProcessedImages: ImageData[] = mockImages.map((image, index) =>
	processImage(image, 'salon', index)
);
