/**
 * Gallery utilities for image processing and optimization
 * Handles image processing, slug generation, and optimized path creation
 */

import type { OptimizedPaths, GalleryImage } from './types';

// ============================================================================
// SRCSET GENERATION
// ============================================================================

/**
 * Creates responsive image srcset string for different formats
 * @param paths - Optimized image paths containing size variants
 * @param format - Image format (avif, webp, jpg)
 * @returns Srcset string with width descriptors
 */
const createSrcSet = (
	paths: {
		sizes: {
			thumb: Record<string, string>;
			small: Record<string, string>;
			medium: Record<string, string>;
			large: Record<string, string>;
			xlarge: Record<string, string>;
		};
	},
	format: 'avif' | 'webp' | 'jpg'
): string =>
	`${paths.sizes.thumb[format]} 150w, ${paths.sizes.small[format]} 400w, ${paths.sizes.medium[format]} 600w, ${paths.sizes.large[format]} 900w, ${paths.sizes.xlarge[format]} 1200w`;

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
function generatePhotoSlug(title: string, uuid: string): string {
	const titleSlug = slugify(title);
	// Use last 8 characters of UUID for uniqueness while keeping URLs readable
	return titleSlug ? `${titleSlug}-${uuid.slice(-8)}` : uuid;
}

/**
 * Parses photo slug to extract components
 * @param slug - Photo slug to parse
 * @returns Object containing title slug and UUID suffix
 */
export function parsePhotoSlug(slug: string): { titleSlug: string; uuidSuffix: string } {
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
function generateImageUUID(str: string): string {
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
// PATH GENERATION
// ============================================================================

/**
 * Generates complete optimized image path structure for a UUID
 * Creates paths for all size variants and formats
 *
 * @param uuid - Unique identifier for the image
 * @returns Complete optimized paths object
 */
function generateOptimizedPaths(uuid: string): OptimizedPaths {
	const formats = ['avif', 'webp', 'jpg'] as const;
	const sizes = ['thumb', 'small', 'medium', 'large', 'xlarge'] as const;

	// Initialize paths structure
	const optimizedPaths: OptimizedPaths = {
		thumbnail: {
			avif: `/optimized/${uuid}-thumb.avif`,
			webp: `/optimized/${uuid}-thumb.webp`,
			jpg: `/optimized/${uuid}-thumb.jpg`
		},
		sizes: {
			thumb: { avif: '', webp: '', jpg: '' },
			small: { avif: '', webp: '', jpg: '' },
			medium: { avif: '', webp: '', jpg: '' },
			large: { avif: '', webp: '', jpg: '' },
			xlarge: { avif: '', webp: '', jpg: '' }
		}
	};

	// Generate all size/format combinations
	sizes.forEach((size) => {
		formats.forEach((format) => {
			optimizedPaths.sizes[size][format] = `/optimized/${uuid}-${size}.${format}`;
		});
	});

	return optimizedPaths;
}

// ============================================================================
// PHOTO PROCESSING
// ============================================================================

/**
 * Processes gallery image into optimized photo object
 * Generates all necessary paths, srcsets, and metadata
 *
 * @param photo - Original gallery image data
 * @param galleryId - Gallery identifier for UUID generation
 * @param index - Original position in gallery
 * @returns Complete processed photo object with all optimization data
 */
export const processPhoto = (photo: GalleryImage, galleryId: string, index: number) => {
	// Generate unique identifier from gallery and image path
	const uuid = generateImageUUID(`${galleryId}/${photo.url}`);
	const paths = generateOptimizedPaths(uuid);

	return {
		// Identification
		slug: generatePhotoSlug(photo.title, uuid),
		uuid,
		originalIndex: index,

		// Metadata
		title: photo.title,
		description: photo.description,
		alt: photo.alt,

		// Responsive images
		srcsets: {
			avif: createSrcSet(paths, 'avif'),
			webp: createSrcSet(paths, 'webp'),
			jpg: createSrcSet(paths, 'jpg')
		},
		sizes: '(min-width: 400px) 400px; 800px ', // Full viewport width for fullscreen display

		// Direct URL access for specific sizes
		urls: {
			thumb: paths.sizes.thumb.jpg,
			small: paths.sizes.small.jpg,
			medium: paths.sizes.medium.jpg,
			large: paths.sizes.large.jpg,
			xlarge: paths.sizes.xlarge.jpg,
			thumbnail: paths.thumbnail.jpg
		}
	};
};

// ============================================================================
// EXPORTS
// ============================================================================

// Export commonly used functions
export { generateImageUUID, generateOptimizedPaths, generatePhotoSlug };
