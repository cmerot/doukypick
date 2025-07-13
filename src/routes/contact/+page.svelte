<script lang="ts">
	let files = $state<File[]>([]);
	let dragOver = $state<boolean>(false);

	function handleFileSelect(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const selectedFiles = Array.from(target.files);
			files = [...files, ...selectedFiles];
		}
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();
		dragOver = false;
		if (event.dataTransfer?.files) {
			const droppedFiles = Array.from(event.dataTransfer.files);
			files = [...files, ...droppedFiles];
		}
	}

	function handleDragOver(event: DragEvent): void {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(): void {
		dragOver = false;
	}

	function removeFile(index: number): void {
		files = files.filter((_, i) => i !== index);
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Octets';
		const k = 1024;
		const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<h1 class="mb-8 text-center text-3xl font-bold">Contact</h1>

<form
	action="https://usebasin.com/f/8544a1eda7ab"
	method="POST"
	enctype="multipart/form-data"
	class="mx-auto max-w-lg bg-white p-6"
>
	<div class="space-y-4">
		<div>
			<label for="name" class="mb-1 block text-sm font-medium text-gray-700"> Votre nom : </label>
			<input
				type="text"
				name="name"
				id="name"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
				Votre email (requis):
			</label>
			<input
				type="email"
				name="email"
				id="email"
				required
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="phone" class="mb-1 block text-sm font-medium text-gray-700">
				Votre téléphone :
			</label>
			<input
				type="tel"
				name="phone"
				id="phone"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="message" class="mb-1 block text-sm font-medium text-gray-700">
				Parlez-moi de votre projet (requis):
			</label>
			<textarea
				name="message"
				id="message"
				rows="4"
				required
				class="resize-vertical w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			></textarea>
		</div>

		<div>
			<label
				class="mb-2 block text-sm font-medium text-gray-700"
				id="file-upload-label"
				for="file-upload"
			>
				Ajoutez quelques images de référence si nécessaire :
			</label>

			<div
				class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors {dragOver
					? 'border-blue-500 bg-blue-50'
					: 'hover:border-gray-400'}"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				role="button"
				tabindex="0"
				aria-labelledby="file-upload-label"
				aria-describedby="file-upload-description"
			>
				<input
					type="file"
					name="files"
					multiple
					class="hidden"
					id="file-upload"
					onchange={handleFileSelect}
					aria-describedby="file-upload-description"
					accept="image/*"
				/>

				<label for="file-upload" class="cursor-pointer">
					<svg
						class="mx-auto mb-2 h-12 w-12 text-gray-400"
						stroke="currentColor"
						fill="none"
						viewBox="0 0 48 48"
						aria-hidden="true"
					>
						<path
							d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="text-sm text-gray-600" id="file-upload-description">
						Glissez et déposez vos fichiers ici, ou
						<span class="font-medium text-blue-600 hover:text-blue-800">parcourez</span>
					</span>
				</label>
			</div>

			{#if files.length > 0}
				<div class="mt-3 space-y-2" role="list" aria-label="Fichiers sélectionnés">
					{#each files as file, index}
						<div
							class="flex items-center justify-between rounded border bg-gray-50 p-2"
							role="listitem"
						>
							<div class="flex min-w-0 items-center">
								<svg
									class="mr-2 h-5 w-5 flex-shrink-0 text-gray-400"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<path
										fill-rule="evenodd"
										d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
										clip-rule="evenodd"
									/>
								</svg>
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-gray-900">{file.name}</p>
									<p class="text-xs text-gray-500">{formatFileSize(file.size)}</p>
								</div>
							</div>
							<button
								type="button"
								class="ml-2 rounded-full p-1 transition-colors hover:bg-gray-200"
								onclick={() => removeFile(index)}
								aria-label="Supprimer le fichier {file.name}"
							>
								<svg
									class="h-4 w-4 text-gray-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<button
			type="submit"
			class="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		>
			Envoyer le message
		</button>
	</div>
</form>
