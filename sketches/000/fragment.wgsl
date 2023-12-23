struct Vertex {
  @builtin(position) position : vec4 < f32>,
  @location(0) color : vec4 < f32>
}

@fragment fn main(vertex_input : Vertex) -> @location(0) vec4 < f32> {
  return vertex_input.color;
}
