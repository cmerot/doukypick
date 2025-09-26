import { dev } from '$app/environment';

export function optimize(src: string, widths = [150, 400, 600, 900, 1200], quality = 90) {
	if (dev) return src;

	return widths
		.slice()
		.sort((a, b) => a - b)
		.map((width, i) => {
			const url = `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
			const descriptor = i < widths.length - 1 ? ` ${width}w` : '';
			return url + descriptor;
		})
		.join(', ');
}
