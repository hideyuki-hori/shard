import { Sketch } from '~/types'
import vertex from './vertex.wgsl'
import fragment from './fragment.wgsl'

export const sketch: Sketch = p => {
  const format = navigator.gpu.getPreferredCanvasFormat()
  p.context.configure({
    device: p.device,
    format,
    alphaMode: 'premultiplied',
  })

  const pipeline = p.device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: p.device.createShaderModule({
        code: vertex,
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: p.device.createShaderModule({
        code: fragment,
      }),
      entryPoint: 'main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  })

  const command_encoder = p.device.createCommandEncoder()
  const view = p.context.getCurrentTexture().createView()

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view,
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }
      }
    ]
  }

  const renderPass = command_encoder.beginRenderPass(renderPassDescriptor)
  renderPass.setPipeline(pipeline)
  renderPass.draw(6, 1)
  renderPass.end()

  p.device.queue.submit([command_encoder.finish()])
  return {
    update() {

    },
  }
}
