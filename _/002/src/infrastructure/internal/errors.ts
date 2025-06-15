import { Data } from 'effect'
import { RendererUnavailable } from '~/domain'

export class WebGPUNotFoundInNavigator extends Data.TaggedError('WebGPUNotFoundInNavigator') implements RendererUnavailable { }
export class WebGPUAdapterUnavailable extends Data.TaggedError('WebGPUAdapterUnavailable') implements RendererUnavailable { }
export class WebGPUDeviceUnavailableCauseOfDOMException extends Data.TaggedError('WebGPUDeviceUnavailableCauseOfDOMException') implements RendererUnavailable {
  constructor(error: DOMException) {
    super()
    this.message = error.message
  }
}
export class WebGPUContextUnavailable extends Data.TaggedError('WebGPUContextUnavailable') implements RendererUnavailable { }
