export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 o';
	const k = 1024;
	const sizes = ['o', 'ko', 'Mo'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
