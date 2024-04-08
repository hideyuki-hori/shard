struct VertexInput {
  @location(0) position: vec4<f32>,
};

struct VertexUniforms {
  positions: array<vec4<f32>, 3>,
};

@group(0) @binding(0) var<uniform> vertexUniforms: VertexUniforms;

@vertex
fn main(input: VertexInput) -> @builtin(position) vec4<f32> {
  return vec4<f32>(input.position.xy, 0.0, 1.0);
}