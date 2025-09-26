import type { Gallery } from '$lib/components/gallery/types.ts';
import salonJson from './salon.json';
import tatouagesJson from './tatouages.json';

export const salon = salonJson satisfies Gallery;
export const tatouages = tatouagesJson satisfies Gallery;

export const galleries = {
	salon,
	tatouages
};
