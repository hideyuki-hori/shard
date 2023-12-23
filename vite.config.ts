import { readdirSync } from 'fs'
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

const sketchNumber = process.argv.slice(3).at(0)
  ?? readdirSync('./sketches')
    .sort((a, b) => Number(b) - Number(a))
    .at(0)

export default defineConfig({
  define: {
    'import.meta.env.SKETCH_NUMBER': JSON.stringify(sketchNumber),
  },
  plugins: [glsl({
    include: [
      '**/*.wgsl',
    ],
    exclude: undefined,
    warnDuplicatedImports: true,
    defaultExtension: 'wgsl',
    compress: false,
    watch: true,
    root: '/',
  })],
})
