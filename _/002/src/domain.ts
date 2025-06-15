import type { Effect } from 'effect'
import { Void } from 'effect/Schema'

export interface RendererUnavailable { }

export interface Render {
  (): Effect.Effect<Void, RendererUnavailable>
}
