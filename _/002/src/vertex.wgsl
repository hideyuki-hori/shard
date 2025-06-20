// @vertex 属性を付与することで
// この関数が頂点シェーダーであることを示す
@vertex
fn main(
  // @builtin(vertex_index) は、頂点インデックスを表す組み込み変数
  // これは、頂点バッファから頂点を識別するために使用される
  @builtin(vertex_index) VertexIndex : u32
  // クリップ空間座標を表す4次元ベクトルを返す
) -> @builtin(position) vec4f {
  // pos は、3つの2次元ベクトルを含む配列
  // これらのベクトルは、三角形の頂点座標を表す
  var pos = array<vec2f, 3>(
    vec2(0.0, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
  );

  // 頂点インデックスを使用して、対応する頂点座標を配列から取得
  // 取得した2次元ベクトルを4次元ベクトルに変換して返す
  // z座標は0.0、w座標は1.0に設定
  // これは、三角形をクリップ空間に配置するために必要
  return vec4f(pos[VertexIndex], 0.0, 1.0);
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
};

fn mainx(index: u32) -> VertexOutput {
  let positions = array<vec2<f32>, 3>(
    vec2<f32>(-0.5, -0.5),
    vec2<f32>(0.5, -0.5),
    vec2<f32>(0.0, 0.5),
  );

  var out: VertexOutput;
  out.position = vec4<f32>(positions[index], 0.0, 1.0);
  return out;
}