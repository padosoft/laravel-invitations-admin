/// <reference types="vite/client" />

// Static asset imports (Vite resolves these to URLs at build time).
declare module '*.png' {
  const src: string;
  export default src;
}
