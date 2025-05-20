struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) color: vec3f,
}

@group(0) @binding(0)
var<uniform> time: f32;

@vertex
fn main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {
  var positions = array<vec2f, 3>(
    vec2(0.0, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
  );

  let phase = f32(VertexIndex) / 3.0;
  let angle = time + phase * (3.14159 * 2); // 2π

  // 回転するRGB（角度で色相を回すイメージ）
  let r = 0.5 + 0.5 * cos(angle);
  let g = 0.5 + 0.5 * cos(angle - 2.0944); // 2π/3
  let b = 0.5 + 0.5 * cos(angle - 4.1888); // 4π/3

  var output: VertexOutput;
  output.pos = vec4f(positions[VertexIndex], 0.0, 1.0);
  output.color = vec3f(r, g, b);
  return output;
}