import { describe, beforeEach, afterEach, vi, expect, it, assert } from '@effect/vitest'
import { Effect, Exit, Option, Cause } from 'effect'
import { prepareWebGPU } from './prepare-web-gpu'
import { WebGPUAdapterNotAvailable, WebGPUContextNotAvailable } from './errors'

interface MockGPU extends Partial<GPU> {
  requestAdapter: () => Promise<GPUAdapter | null>
}

const mockAdapter = {
  requestDevice: vi.fn().mockResolvedValue({ id: 'mock-device' }),
} as unknown as GPUAdapter

const mockContext = {
  configure: vi.fn(),
} as unknown as GPUCanvasContext

let originalGpu: typeof navigator.gpu

describe('prepareWebGPU', () => {
  beforeEach(() => {
    originalGpu = navigator.gpu

    const mockGPU: MockGPU = {
      requestAdapter: vi.fn().mockResolvedValue(mockAdapter),
    }

    Object.defineProperty(globalThis.navigator, 'gpu', {
      value: mockGPU,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, 'gpu', {
      value: originalGpu,
      configurable: true,
    })
  })

  it.effect('succeeds with adapter, device, and context', () =>
    Effect.gen(function* () {
      const canvas = {
        getContext: vi.fn().mockReturnValue(mockContext),
      } as unknown as HTMLCanvasElement

      const exit = yield* Effect.exit(prepareWebGPU(canvas))
      assert(Exit.isSuccess(exit), 'Expected Exit to be success')
      expect(exit.value.adapter).toBe(mockAdapter)
      expect(exit.value.device).toEqual({ id: 'mock-device' })
      expect(exit.value.context).toBe(mockContext)
    })
  )

  it.effect('fails if adapter is null', () =>
    Effect.gen(function* () {
      const mockGPU: MockGPU = {
        requestAdapter: vi.fn().mockResolvedValue(null),
      }

      Object.defineProperty(globalThis.navigator, 'gpu', {
        value: mockGPU,
        configurable: true,
      })

      const canvas = {
        getContext: vi.fn().mockReturnValue(mockContext),
      } as unknown as HTMLCanvasElement

      const exit = yield* Effect.exit(prepareWebGPU(canvas))
      assert(Exit.isFailure(exit), 'Expected Exit to be failure')
      const failure = Cause.failureOption(exit.cause)
      assert(Option.isSome(failure), 'Expected failure to be present')
      expect(failure.value).toBeInstanceOf(WebGPUAdapterNotAvailable)
    })
  )

  it.effect('fails if context is null', () =>
    Effect.gen(function* () {
      const canvas = {
        getContext: vi.fn().mockReturnValue(null),
      } as unknown as HTMLCanvasElement

      const exit = yield* Effect.exit(prepareWebGPU(canvas))
      assert(Exit.isFailure(exit), 'Expected Exit to be failure')

      const failure = Cause.failureOption(exit.cause)
      assert(Option.isSome(failure), 'Expected failure to be present')
      expect(failure.value).toBeInstanceOf(WebGPUContextNotAvailable)
    })
  )
})