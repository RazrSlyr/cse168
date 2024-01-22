import { DirectionalLight, HemisphereLight, Color } from '../../../../lib/three.module.js';

function createLights() {
  const ambientLight = new HemisphereLight(
    'skyblue',
    'darkslategrey',
    0.1,
  );

  const mainLight = new DirectionalLight(new Color(182 / 255, 224 / 255, 239 / 255), 1);
  mainLight.position.set(10, 10, 0);
  mainLight.castShadow = true;

  return { ambientLight, mainLight };
}

export { createLights };
