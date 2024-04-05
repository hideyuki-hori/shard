import vertexShader from './vertex.wgsl?raw'
import fragmentShader from './fragment.wgsl?raw'

main()

async function main() {
  const canvas: HTMLCanvasElement = document.querySelector('canvas')!

  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    throw new Error()
  }

  const device = await adapter.requestDevice()
  const context: GPUCanvasContext = canvas.getContext('webgpu')

  if (!context) {
    throw new Error()
  }

  const { devicePixelRatio } = window
  canvas.width = devicePixelRatio * canvas.clientWidth
  canvas.height = devicePixelRatio * canvas.clientHeight

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'premultiplied',
  })

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: vertexShader,
      }),
    },
    fragment: {
      module: device.createShaderModule({
        code: fragmentShader,
      }),
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  })

  function frame() {
    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipeline)
    passEncoder.draw(3)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}