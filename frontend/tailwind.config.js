import { nextui } from '@nextui-org/theme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    require('@tailwindcss/typography'),
    nextui({
      themes: {
        light: {
          colors: {
            background: '#FFFFFF',
            foreground: '#11181C',
            default: {
              50: '#fafafa80',
              100: '#f4f4f580',
              200: '#e4e4e780',
              300: '#d4d4d880',
              400: '#a1a1aa80',
              500: '#71717a80',
              600: '#52525b80',
              700: '#3f3f4680',
              800: '#27272a80',
              900: '#18181b80',
              DEFAULT: "#d4d4d880",
              foreground: "#11181C",
            },
            primary: {
              50: '#ddfefc80',
              100: '#b8f4f080',
              200: '#91ebe580',
              300: '#68e4da80',
              400: '#42dccf80',
              500: '#2ac2b680',
              600: '#1b978d80',
              700: '#0e6c6580',
              800: '#00423d80',
              900: '#00181580',
              DEFAULT: "#1C9B9180",
              foreground: "#11181C",
            },
            secondary:
            {
              50: '#fff6df80',
              100: '#ffe4b380',
              200: '#fed28380',
              300: '#fec05280',
              400: '#fdaf2580',
              500: '#e4961380',
              600: '#b2740b80',
              700: '#7f530480',
              800: '#4d320080',
              900: '#1c110080',
              DEFAULT: "#ffebc680",
              foreground: "#11181C",
            },
            focus: "#1C9B91",
            success: "#0ca04f80",
            warning: "#db8b0a80",
            danger: "#e5051080",
          },
        },

        dark: {
          colors: {
            success: {
              foreground: "#ECEDEE"
            },
            warning: {
              foreground: "#ECEDEE"
            },
            // background: '#00000055',
            // foreground: '#ECEDEE',

            // default: '#3f3f4655',
            // primary: "#1C9B9155",
            // focus: "#7FA1FF55",
            // secondary: "#ffebc655",

            // success: "#17c96480",
            // warning: "#f5a52480",
            // danger: "#ff3c4980",
          },
        },
      },
    })],
}
