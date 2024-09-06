/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				skyblue: 'rgb(32, 75, 190, 0.2)',
				skyblueborder: 'rgb(32, 75, 190)'
			}
		}
	},
	plugins: []
};
