import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken === 'authenticated';

	return {
		isAuthenticated
	};
};