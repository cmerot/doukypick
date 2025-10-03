/**
 * Gallery utilities for image processing and optimization
 * Handles image processing, slug generation, and optimized path creation
 */

import { createSrcset } from '$lib/utils';
import type {
	GalleryImage,
	ImageSlugParts,
	ImageData,
	ImageAspectRatio,
	ImageOrientation
} from './types';

// ============================================================================
// SLUG UTILITIES
// ============================================================================

/**
 * Converts text to URL-friendly slug
 * - Handles diacritics (é, ñ, ü, etc.)
 * - Removes special characters
 * - Converts spaces to hyphens
 * - Normalizes multiple hyphens
 *
 * @param text - Input text to slugify
 * @returns URL-safe slug string
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD') // Decompose combined characters
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, hyphens
		.replace(/\s+/g, '-') // Convert spaces to hyphens
		.replace(/-+/g, '-') // Normalize multiple hyphens to single
		.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates unique photo slug from title and UUID
 * Combines human-readable title with UUID suffix for uniqueness
 *
 * @param title - Photo title
 * @param uuid - Unique identifier
 * @returns URL-safe photo slug
 */
export function generateImageSlug(title: string, uuid: string): string {
	const titleSlug = slugify(title);
	// Use last 8 characters of UUID for uniqueness while keeping URLs readable
	return titleSlug ? `${titleSlug}-${uuid.slice(-8)}` : uuid;
}

/**
 * Parses photo slug to extract components
 * @param slug - Photo slug to parse
 * @returns Object containing title slug and UUID suffix
 */
export function parsePhotoSlug(slug: string): ImageSlugParts {
	const parts = slug.split('-');
	const uuidSuffix = parts[parts.length - 1];
	const titleSlug = parts.slice(0, -1).join('-');

	return { titleSlug, uuidSuffix };
}

// ============================================================================
// UUID GENERATION
// ============================================================================

/**
 * Generates deterministic UUID from string using DJB2 hash algorithm
 * Compatible with both browser and Node.js environments
 * Uses same logic as build script for consistency
 *
 * @param str - Input string to hash
 * @returns 16-character hexadecimal UUID
 */
export function generateImageUUID(str: string): string {
	// DJB2 hash algorithm - fast and well-distributed
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) + hash + str.charCodeAt(i);
	}

	// Convert to positive hex string with consistent length
	const positiveHash = Math.abs(hash);
	return positiveHash.toString(16).padStart(16, '0').substring(0, 16);
}

// ============================================================================
// PHOTO PROCESSING
// ============================================================================

/**
 * Processes gallery image into optimized photo object
 * Generates all necessary paths, srcsets, and metadata
 *
 * @param image - Original gallery image data
 * @param galleryId - Gallery identifier for UUID generation
 * @param index - Original position in gallery
 * @returns Complete processed image object with all optimization data
 */
export const processImage = (image: GalleryImage, galleryId: string, index: number) => {
	// Generate unique identifier from gallery and image path
	const uuid = generateImageUUID(image.src);
	const slug = generateImageSlug(image.title, uuid);

	return {
		// Identification
		slug,
		uuid,
		originalIndex: index,

		// Metadata
		title: image.title,
		description: image.description,
		alt: image.alt,
		href: `/images/${galleryId}/${slug}`,

		// Responsive images
		srcset: createSrcset(image.src),
		src: createSrcset(image.src, [1200])
	} as ImageData;
};

// ============================================================================
// ASPECT RATIO
// ============================================================================

export function getAspectRatio(ratio: ImageAspectRatio, orientation: ImageOrientation) {
	if (orientation == 'landscape') return ratio;
	return ratio.split('/').reverse().join('/');
}

export function preventDefault(fn: () => void) {
	return function (event: Event) {
		event.preventDefault();
		fn();
	};
}
