import { Effect, pipe } from 'effect'
import { WebGPUAdapterNotAvailable, WebGPUContextNotAvailable } from '~/errors'

const ensureAdapter = () => pipe(
  Effect.promise(() => navigator.gpu.requestAdapter()),
  Effect.flatMap(Effect.fromNullable),
  Effect.orElseFail(() => new WebGPUAdapterNotAvailable()),
)

const ensureDevice = (adapter: GPUAdapter) => Effect.promise(() => adapter.requestDevice())

const ensureContext = (canvas: HTMLCanvasElement) => pipe(
  Effect.sync(() => canvas.getContext('webgpu')),
  Effect.flatMap(Effect.fromNullable),
  Effect.orElseFail(() => new WebGPUContextNotAvailable()),
)

export const prepareWebGPU = (canvas: HTMLCanvasElement) => Effect.gen(function* (_) {
  const adapter = yield* _(ensureAdapter())
  const device = yield* _(ensureDevice(adapter))
  const context = yield* _(ensureContext(canvas))
  return {
    adapter,
    device,
    context,
  }
})