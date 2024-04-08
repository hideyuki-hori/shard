struct FragmentOutput {
  @location(0) color: vec4<f32>,
};

@fragment
fn main(@builtin(position) fragCoord: vec4<f32>) -> FragmentOutput {
  let screenPos = fragCoord.xy / vec2<f32>(1280.0, 720.0);
  let color = vec3<f32>(screenPos, 0.5);

  var output: FragmentOutput;
  output.color = vec4<f32>(color, 1.0);
  return output;
}