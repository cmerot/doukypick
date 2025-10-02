import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';

export interface UploadResult {
	urls: string[];
	error?: string;
}

function generateFilename(originalName: string): string {
	const timestamp = Date.now();
	const randomSuffix = Math.random().toString(36).substring(2, 8);
	const extension = originalName.split('.').pop() || 'jpg';
	return `contact-${timestamp}-${randomSuffix}.${extension}`;
}

async function uploadSinglePhoto(photo: File): Promise<string> {
	const filename = generateFilename(photo.name);

	// Convert File to Buffer for Vercel Blob
	const arrayBuffer = await photo.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	// Upload to Vercel Blob
	const blob = await put(filename, buffer, {
		access: 'public',
		token: BLOB_READ_WRITE_TOKEN,
		contentType: photo.type
	});

	console.log(`📸 Photo uploaded successfully: ${blob.url}`);
	return blob.url;
}

export async function uploadPhotos(photos: File[]): Promise<UploadResult> {
	if (photos.length === 0) {
		return { urls: [] };
	}

	const photoUrls: string[] = [];

	try {
		for (const photo of photos) {
			const url = await uploadSinglePhoto(photo);
			photoUrls.push(url);
		}

		return { urls: photoUrls };
	} catch (error) {
		console.error('❌ Error uploading photos:', error);
		return {
			urls: [],
			error: error instanceof Error ? error.message : 'Unknown upload error'
		};
	}
}
