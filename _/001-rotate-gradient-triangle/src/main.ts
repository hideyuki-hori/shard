import vertexShader from '~/vertex.wgsl?raw'
import fragmentShader from '~/fragment.wgsl?raw'
import '~/styles.css'

main().catch(console.error)

async function main() {
  const canvas: HTMLCanvasElement = document.querySelector('canvas')!

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw new Error()

  const device = await adapter.requestDevice()

  const context = canvas.getContext('webgpu')
  if (!context) throw new Error()

  const dpr = window.devicePixelRatio || 1
  canvas.style.width = `${512}px`
  canvas.style.height = `${512}px`
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'premultiplied',
  })

  // 時間を渡すための uniform buffer を用意
  const timeBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({ code: vertexShader }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({ code: fragmentShader }),
      entryPoint: 'main',
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  })

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: { buffer: timeBuffer },
    }],
  })

  const start = performance.now()

  const frame = () => {
    const elapsed = (performance.now() - start) / 1000
    device.queue.writeBuffer(timeBuffer, 0, new Float32Array([elapsed]))

    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: {
          r: 0.5 + 0.5 * Math.sin(elapsed),
          g: 0.5 + 0.5 * Math.cos(elapsed * 0.7),
          b: 0.5 + 0.5 * Math.sin(elapsed * 1.3),
          a: 1,
        },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    })

    renderPass.setPipeline(pipeline)
    renderPass.setBindGroup(0, bindGroup)
    renderPass.draw(3)
    renderPass.end()

    const command = commandEncoder.finish()
    device.queue.submit([command])
    requestAnimationFrame(frame)
  }

  frame()
}