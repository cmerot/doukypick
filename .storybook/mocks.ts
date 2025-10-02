// Mock SvelteKit modules for Storybook

// Mock $app/navigation
export const goto = () => Promise.resolve();
export const pushState = (url: string, state: any) => {};
export const replaceState = (url: string, state: any) => {};
export const invalidate = () => Promise.resolve();
export const invalidateAll = () => Promise.resolve();
export const preloadData = () => Promise.resolve();
export const preloadCode = () => Promise.resolve();
export const beforeNavigate = () => {};
export const afterNavigate = () => {};
export const disableScrollHandling = () => {};

// Mock $app/environment
export const browser = true;
export const building = false;
export const dev = true;
export const version = '0.0.0';

// Mock $app/state (Svelte 5 state module)
export const page = {
	url: {
		pathname: '/',
		searchParams: new URLSearchParams(),
		hash: '',
		origin: 'http://localhost:6006',
		href: 'http://localhost:6006/'
	},
	state: {},
	params: {},
	route: {
		id: '/'
	},
	status: 200,
	error: null,
	data: {},
	form: undefined
};
