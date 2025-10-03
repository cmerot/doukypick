import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findMdxFiles(dir: string, baseDir: string): string[] {
	const files: string[] = [];
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			files.push(...findMdxFiles(fullPath, baseDir));
		} else if (entry.endsWith('.mdx')) {
			// Convert file path to slug: remove baseDir and .mdx extension
			const relativePath = fullPath.substring(baseDir.length + 1);
			files.push(relativePath.replace('.mdx', ''));
		}
	}

	return files;
}

// For SSR, if pages are not discoverable we explicitly tell sveltekit which entries to build
export const entries = () => {
	const pagesDir = join(process.cwd(), 'src/content/pages');
	const slugs = findMdxFiles(pagesDir, pagesDir);

	return slugs.map((slug) => ({ slug }));
};
