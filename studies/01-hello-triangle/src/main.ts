import vertex from './vertex.wgsl?raw'
import fragment from './fragment.wgsl?raw'
import './styles.css'

const canvas = document.querySelector('canvas') as HTMLCanvasElement

const adapter = await navigator.gpu.requestAdapter()
if (!adapter) throw new Error()
const device = await adapter.requestDevice()

const context = canvas.getContext('webgpu') as GPUCanvasContext

const devicePixelRatio = window.devicePixelRatio
canvas.width = canvas.clientWidth * devicePixelRatio
canvas.height = canvas.clientHeight * devicePixelRatio
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
      code: vertex,
    }),
  },
  fragment: {
    module: device.createShaderModule({
      code: fragment,
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
