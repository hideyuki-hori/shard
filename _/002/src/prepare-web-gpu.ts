import { Effect } from 'effect'
import { WebGPUAdapterNotAvailable, WebGPUContextNotAvailable } from '~/errors'

export function prepareWebGPU(canvas: HTMLCanvasElement) {
  return Effect.promise(() => navigator.gpu.requestAdapter()).pipe(
    Effect.flatMap((adapter) =>
      adapter
        ? Effect.succeed(adapter)
        : Effect.fail(new WebGPUAdapterNotAvailable())
    ),
    Effect.flatMap((adapter) =>
      Effect.promise(() => adapter.requestDevice()).pipe(
        Effect.map((device) => ({ adapter, device }))
      )
    ),
    Effect.flatMap(({ adapter, device }) => {
      const context = canvas.getContext('webgpu')
      return context
        ? Effect.succeed({ adapter, device, context })
        : Effect.fail(new WebGPUContextNotAvailable())
    })
  )
}