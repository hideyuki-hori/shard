import vertexShader from './vertex.wgsl?raw'
import fragmentShader from './fragment.wgsl?raw'
import './styles.css'

main()

async function main() {
  const canvas: HTMLCanvasElement = document.querySelector('canvas')!

  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    throw new Error()
  }

  const device = await adapter.requestDevice()
  const context: GPUCanvasContext = canvas.getContext('webgpu')!

  if (!context) {
    throw new Error()
  }

  canvas.width = canvas.height = Math.min(window.innerWidth / 2, window.innerHeight / 2)

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

  const vertexCount = 3
  const positionBuffer = device.createBuffer({
    size: vertexCount * 4 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  })

  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'premultiplied',
  })

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [
        device.createBindGroupLayout({
          entries: [
            {
              binding: 0,
              visibility: GPUShaderStage.VERTEX,
              buffer: {
                type: 'uniform',
                hasDynamicOffset: false,
              },
            },
          ],
        }),
      ],
    }),
    vertex: {
      module: device.createShaderModule({ code: vertexShader }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
      ],
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
      topology: 'triangle-list'
    },
  })

  let i = 0
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

    const positions = [
      [0.0, 0.5],
      [-0.5, -0.5],
      [Math.cos(i), -0.5],
    ]
    i++

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: positionBuffer,
          },
        },
      ],
    })

    device.queue.writeBuffer(
      positionBuffer,
      0,
      new Float32Array(positions.flat()),
    )


    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipeline)
    passEncoder.setBindGroup(0, bindGroup)
    passEncoder.setVertexBuffer(0, positionBuffer)
    passEncoder.draw(3)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}