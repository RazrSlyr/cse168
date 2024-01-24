import { WebGLRenderer } from '../../../lib/three.module.js';

function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true });

  renderer.useLegacyLights = true;
  renderer.shadowMap.enabled = true;

  return renderer;
}

export { createRenderer };
