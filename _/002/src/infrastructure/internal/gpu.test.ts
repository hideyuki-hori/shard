import { describe, it, expect, assert } from '@effect/vitest'
import { Effect, Exit, Cause, Option } from 'effect'
import {
  WebGPUNotFoundInNavigator,
  WebGPUContextUnavailable,
} from '~/infrastructure/internal/errors'
import {
  ensureAdapter,
  ensureContext,
  ensureDevice,
  getMockGPU_forTesting,
  simulateMissingGPU_forTesting,
} from './gpu'

describe('gpu utilities', () => {
  it.effect('getMockGPU_forTesting returns mock GPU and device', () =>
    Effect.gen(function* () {
      const gpu = yield* getMockGPU_forTesting()
      const adapter = yield* ensureAdapter(gpu)
      const exit = yield* Effect.exit(ensureDevice(adapter))
      assert(Exit.isSuccess(exit), 'Expected mock device acquisition to succeed')
      expect(exit.value).toEqual({ id: 'mock-device' })
    })
  )

  it.effect('simulateMissingGPU_forTesting fails as expected', () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(simulateMissingGPU_forTesting())
      assert(Exit.isFailure(exit), 'Expected simulateMissingGPU_forTesting to fail')

      const failure = Cause.failureOption(exit.cause)
      assert(Option.isSome(failure), 'Expected failure to be present')
      expect(failure.value).toBeInstanceOf(WebGPUNotFoundInNavigator)
    })
  )

  it.effect('ensureContext succeeds when canvas context is present', () =>
    Effect.gen(function* () {
      const canvas = {
        getContext: () => ({ configure: () => { } }),
      } as unknown as HTMLCanvasElement

      const exit = yield* Effect.exit(ensureContext(canvas))
      assert(Exit.isSuccess(exit), 'Expected context acquisition to succeed')
    })
  )

  it.effect('ensureContext fails when canvas context is null', () =>
    Effect.gen(function* () {
      const canvas = {
        getContext: () => null,
      } as unknown as HTMLCanvasElement

      const exit = yield* Effect.exit(ensureContext(canvas))
      assert(Exit.isFailure(exit), 'Expected failure when context is null')

      const failure = Cause.failureOption(exit.cause)
      assert(Option.isSome(failure), 'Expected failure to be present')
      expect(failure.value).toBeInstanceOf(WebGPUContextUnavailable)
    })
  )
})
