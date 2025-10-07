import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GITHUB_TOKEN } from '$env/static/private';
import { verifySessionToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	// Check if user is authenticated
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	if (!isAuthenticated) {
		return error(401, { message: 'Unauthorized' });
	}

	// Check if GitHub token is configured
	if (!GITHUB_TOKEN) {
		return error(500, { message: 'GitHub token not configured' });
	}

	const owner = 'cmerot';
	const repo = 'doukypick';

	try {
		// Step 1: Create PR from preview to main
		const createPR1 = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`,
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			},
			body: JSON.stringify({
				title: 'content: merge preview into main',
				head: 'preview',
				base: 'main',
				body: 'Automated merge from admin panel'
			})
		});

		if (!createPR1.ok) {
			const errorData = await createPR1.json();
			throw new Error(`Failed to create PR (preview→main): ${createPR1.status} - ${JSON.stringify(errorData)}`);
		}

		const pr1Data = await createPR1.json();
		const pr1Number = pr1Data.number;

		// Step 2: Merge the PR
		const mergePR1 = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/pulls/${pr1Number}/merge`,
			{
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${GITHUB_TOKEN}`,
					'Content-Type': 'application/json',
					Accept: 'application/vnd.github+json'
				},
				body: JSON.stringify({
					commit_title: 'content: merge preview into main',
					merge_method: 'merge'
				})
			}
		);

		if (!mergePR1.ok) {
			const errorData = await mergePR1.json();
			throw new Error(`Failed to merge PR ${pr1Number}: ${mergePR1.status} - ${JSON.stringify(errorData)}`);
		}

		const merge1Result = await mergePR1.json();

		// Step 3: Create PR from main to preview
		const createPR2 = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`,
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			},
			body: JSON.stringify({
				title: 'content: merge main into preview',
				head: 'main',
				base: 'preview',
				body: 'Automated merge from admin panel'
			})
		});

		if (!createPR2.ok) {
			const errorData = await createPR2.json();
			throw new Error(`Failed to create PR (main→preview): ${createPR2.status} - ${JSON.stringify(errorData)}`);
		}

		const pr2Data = await createPR2.json();
		const pr2Number = pr2Data.number;

		// Step 4: Merge the second PR
		const mergePR2 = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/pulls/${pr2Number}/merge`,
			{
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${GITHUB_TOKEN}`,
					'Content-Type': 'application/json',
					Accept: 'application/vnd.github+json'
				},
				body: JSON.stringify({
					commit_title: 'content: merge main into preview',
					merge_method: 'merge'
				})
			}
		);

		if (!mergePR2.ok) {
			const errorData = await mergePR2.json();
			throw new Error(`Failed to merge PR ${pr2Number}: ${mergePR2.status} - ${JSON.stringify(errorData)}`);
		}

		const merge2Result = await mergePR2.json();

		return json({
			success: true,
			message: 'Branches merged successfully via Pull Requests',
			merges: {
				previewToMain: {
					pr: pr1Number,
					sha: merge1Result.sha,
					merged: merge1Result.merged
				},
				mainToPreview: {
					pr: pr2Number,
					sha: merge2Result.sha,
					merged: merge2Result.merged
				}
			}
		});
	} catch (err) {
		console.error('Error merging branches:', err);
		const details = err instanceof Error ? err.message : 'Unknown error';
		return error(500, `Failed to merge branches: ${details}`);
	}
};
