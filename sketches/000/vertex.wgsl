struct Vertex {
  @builtin(position) position : vec4 < f32>,
  @location(0) color : vec4 < f32>
}

@vertex fn main(@builtin(vertex_index) index : u32) -> Vertex {
  var position = array<vec3<f32>, 6 > (
  vec3<f32>(-0.5, -0.5, 0.0),
  vec3<f32>(0.5, -0.5, 0.0),
  vec3<f32>(-0.5, 0.5, 0.0),
  vec3<f32>(-0.5, 0.5, 0.0),
  vec3<f32>(0.5, -0.5, 0.0),
  vec3<f32>(0.5, 0.5, 0.0),
  );
  var color = array<vec4<f32>, 6 > (
  vec4<f32>(1.0, 0.0, 0.0, 1.0),
  vec4<f32>(0.0, 1.0, 0.0, 1.0),
  vec4<f32>(1.0, 1.0, 0.0, 1.0),
  vec4<f32>(1.0, 1.0, 0.0, 1.0),
  vec4<f32>(0.0, 1.0, 0.0, 1.0),
  vec4<f32>(0.0, 0.0, 1.0, 1.0),
  );
  var vertex: Vertex;
  vertex.position = vec4<f32>(position[index], 1.0);
  vertex.color = color[index];
  return vertex;
}
