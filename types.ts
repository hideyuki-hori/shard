export type Props = {
  device: GPUDevice
  context: GPUCanvasContext
  width: number
  height: number
}

export type Sketch = (props: Props) => {
  update?(): void
}
