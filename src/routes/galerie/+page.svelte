<script lang="ts">
	import type { PageData } from './$types.js';
	import type { GalleryImage } from '$lib/types/gallery.js';

	let { data }: { data: PageData } = $props();

	let selectedImage = $state<GalleryImage | null>(null);
	let imageLoaded = $state<Record<string, boolean>>({});

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const handleImageClick = (image: GalleryImage) => {
		selectedImage = image;
	};

	const closeModal = () => {
		selectedImage = null;
	};

	const handleImageLoad = (imageName: string) => {
		imageLoaded[imageName] = true;
	};
</script>

<div class="gallery">
	<h1>Galerie du Salon</h1>
	<p class="count">{data.images.length} images trouvées</p>

	<div class="grid">
		{#each data.images as image (image.path)}
			<div
				class="image-container"
				role="button"
				tabindex="0"
				onclick={() => handleImageClick(image)}
				onkeydown={(e) => e.key === 'Enter' && handleImageClick(image)}
			>
				<div class="image-wrapper">
					<img
						src={image.thumbnail || image.src}
						alt={image.name}
						loading="lazy"
						class="thumbnail"
						onload={() => handleImageLoad(image.name)}
					/>

					{#if !imageLoaded[image.name]}
						<div class="loading-placeholder">
							<div class="loading-spinner"></div>
						</div>
					{/if}
				</div>

				<div class="image-info">
					<p class="image-name">{image.name}</p>
					{#if image.size}
						<p class="image-size">{formatFileSize(image.size)}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

{#if selectedImage}
	<div class="modal" onclick={closeModal}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<button class="close" onclick={closeModal}>&times;</button>

			<div class="modal-image-wrapper">
				<img src={selectedImage.src} alt={selectedImage.name} class="modal-image" />
			</div>

			<div class="modal-info">
				<h3>{selectedImage.name}</h3>
				{#if selectedImage.size}
					<p class="modal-size">{formatFileSize(selectedImage.size)}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.gallery {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.count {
		color: #666;
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.image-container {
		background: white;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		cursor: pointer;
		position: relative;
	}

	.image-container:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.image-wrapper {
		position: relative;
		width: 100%;
		height: 150px;
		overflow: hidden;
		border-radius: 8px;
	}

	.thumbnail {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.image-container:hover .thumbnail {
		transform: scale(1.05);
	}

	.loading-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid #e0e0e0;
		border-top: 2px solid #666;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.image-info {
		margin-top: 0.75rem;
		text-align: center;
	}

	.image-name {
		margin: 0;
		font-size: 0.95rem;
		color: #333;
		font-weight: 600;
	}

	.image-size {
		margin: 0.25rem 0 0 0;
		font-size: 0.8rem;
		color: #888;
	}

	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		position: relative;
		max-width: 90vw;
		max-height: 90vh;
		background: white;
		border-radius: 12px;
		padding: 2rem;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			transform: translateY(50px) scale(0.9);
		}
		to {
			transform: translateY(0) scale(1);
		}
	}

	.modal-image-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		max-height: 70vh;
	}

	.modal-image {
		max-width: 100%;
		max-height: 70vh;
		object-fit: contain;
		border-radius: 8px;
	}

	.close {
		position: absolute;
		top: 15px;
		right: 20px;
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: #666;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.close:hover {
		background: #f0f0f0;
		color: #333;
	}

	.modal-info {
		text-align: center;
		margin-top: 1.5rem;
	}

	.modal-info h3 {
		margin: 0;
		color: #333;
		font-size: 1.2rem;
	}

	.modal-size {
		margin: 0.5rem 0 0 0;
		color: #666;
		font-size: 0.9rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.gallery {
			padding: 1rem;
		}

		.grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 1rem;
		}

		.modal-content {
			margin: 1rem;
			padding: 1rem;
		}
	}
</style>
