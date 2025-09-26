export function optimize(src: string, widths = [150, 400, 600, 900, 1200], quality = 90) {
	return widths
		.slice()
		.sort((a, b) => a - b)
		.map((width, i) => {
			const url =
				typeof process !== 'undefined' && process.env.VERCEL === '1'
					? `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
					: `${src}?w=${width}&q=${quality}`;
			const descriptor = i < widths.length - 1 ? ` ${width}w` : '';
			return url + descriptor;
		})
		.join(', ');
}
