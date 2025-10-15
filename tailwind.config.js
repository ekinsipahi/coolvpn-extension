// tailwind.config.js
module.exports = {
  darkMode: 'class', // sen "dark:" kullanıyorsun, bu iyi
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',

    // src DIŞINDA dosyaların varsa hepsini ekle:
    './router/**/*.{vue,js,ts,jsx,tsx}',
    './popup/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    '../shared/**/*.{vue,js,ts,jsx,tsx}', // monorepo vs ise örnek
  ],
  theme: { extend: {} },
  plugins: [],
}
