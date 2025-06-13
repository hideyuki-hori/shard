import { Data } from 'effect'

export class WebGPUAdapterNotAvailable extends Data.TaggedError('WebGPUAdapterNotAvailable') { }
export class WebGPUContextNotAvailable extends Data.TaggedError('WebGPUContextNotAvailable') { }
