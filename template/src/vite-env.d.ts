// vite-env.d.ts
declare module '*.wgsl?raw' {
  const content: string;
  export default content;
}