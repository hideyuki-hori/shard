import { Effect, pipe } from 'effect'
import {
  WebGPUAdapterUnavailable,
  WebGPUContextUnavailable,
  WebGPUDeviceUnavailableCauseOfDOMException,
  WebGPUNotFoundInNavigator
} from '~/infrastructure/internal/errors'

export const ensureGPUFromNavigator = () => pipe(
  Effect.sync(() => navigator.gpu),
  Effect.flatMap(Effect.fromNullable),
  Effect.orElseFail(() => new WebGPUNotFoundInNavigator()),
)

export const getMockGPU_forTesting = () => pipe(
  Effect.sync(() => ({
    requestAdapter: () =>
      Promise.resolve({
        requestDevice: () => Promise.resolve({ id: 'mock-device' }),
      } as unknown as GPUAdapter),
  } as unknown as GPU)),
  Effect.flatMap(Effect.fromNullable),
  Effect.orElseFail(() => new WebGPUNotFoundInNavigator()),
)

export const simulateMissingGPU_forTesting = () => pipe(
  Effect.sync(() => null),
  Effect.flatMap(Effect.fromNullable),
  Effect.orElseFail(() => new WebGPUNotFoundInNavigator())
)

export const ensureAdapter = (gpu: GPU) => pipe(
  Effect.promise(() => gpu.requestAdapter()),
  Effect.flatMap(Effect.fromNullable),
  Effect.orElseFail(() => new WebGPUAdapterUnavailable()),
)

export const ensureDevice = (adapter: GPUAdapter) => Effect.tryPromise({
  try: async () => adapter.requestDevice(),
  catch: (error) => {
    if (error instanceof DOMException) {
      return new WebGPUDeviceUnavailableCauseOfDOMException(error)
    }
    // TODO
    return error
  },
})

export const ensureContext = (canvas: HTMLCanvasElement) => pipe(
  Effect.sync(() => canvas.getContext('webgpu')),
  Effect.flatMap(Effect.fromNullable),
  Effect.orElseFail(() => new WebGPUContextUnavailable()),
)
