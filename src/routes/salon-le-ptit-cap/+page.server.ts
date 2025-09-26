import type { PageServerLoad } from './$types';
import type { Gallery } from '$lib/components/gallery/types';
import fs from 'fs/promises';
import path from 'path';

const GALLERIES_DIR = 'content/galleries';

export const load: PageServerLoad = async () => {
	try {
		const content = await fs.readFile(path.join(GALLERIES_DIR, 'salon', 'gallery.json'), 'utf-8');
		const gallery: Gallery = JSON.parse(content);
		return {
			gallery
		};
	} catch {
		throw new Error('Failed to load salon gallery');
	}
};
