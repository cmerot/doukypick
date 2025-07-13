// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Add image optimizer types
declare module '*?w=*' {
	const value: string;
	export default value;
}

declare module '*?format=*' {
	const value: string;
	export default value;
}

declare module '*?w=*&format=*' {
	const value: string;
	export default value;
}

declare module '*?format=*&w=*' {
	const value: string;
	export default value;
}

export {};
