import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken === 'authenticated';
	const { pathname } = url;

	return {
		isAuthenticated,
		pathname
	};
};
