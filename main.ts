import './style.css'
import { Sketch } from './types'

main()

async function main() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return

  const context = canvas.getContext('webgpu')
  if (!context) return

  if (!navigator.gpu) return
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) return
  const device = await adapter.requestDevice()

  const { sketch }: { sketch: Sketch } = await import(
    /* @vite-ignore */
    `./sketches/${import.meta.env.SKETCH_NUMBER}`
  )

  canvas.width = canvas.height = 500

  const { update } = sketch({
    context,
    device,
    width: canvas.width,
    height: canvas.height,
  })

  const animate = () => {
    update?.()
    requestAnimationFrame(animate)
  }

  animate()
}
