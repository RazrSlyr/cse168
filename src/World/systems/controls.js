import { OrbitControls } from '../../../lib/OrbitControls.js';
import { Vector3 } from '../../../lib/three.module.js';

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;


  const maxSpeed = 5;
  const speed = new Vector3(0, 0, 0);

  // custom controls
  window.addEventListener("keydown", function (event) {
    const key = event.key;
    if (key == "a") {
      speed.x = -1;
    } else if (key == "d") {
      speed.x = 1;
    } else if (key == "w") {
      speed.z = -1;
    } else if (key == "s") {
      speed.z = 1;
    } else if (key == "q") {
      speed.y = 1;
    } else if (key == "e") {
      speed.y = -1;
    }
  });

  window.addEventListener("keyup", function (event) {
    const key = event.key;
    if (key == "a" && speed.x == -1) {
      speed.x = 0;
    } else if (key == "d" && speed.x == 1) {
      speed.x = 0;
    } else if (key == "w" && speed.z == -1) {
      speed.z = 0;
    } else if (key == "s" && speed.z == 1) {
      speed.z = 0;
    } else if (key == "q" && speed.y == 1) {
      speed.y = 0;
    } else if (key == "e" && speed.y == -1) {
      speed.y = 0;
    }
  });

// tick method where camera moves
controls.tick = (delta) => {
  if (speed.length() > 0 && delta > 0) {
    const forward = controls.target.clone().add(controls.object.position.clone().negate());
    forward.normalize();

    const right = (new Vector3(0, 1, 0)).cross(forward);
    right.normalize();

    let movement = forward.multiplyScalar(maxSpeed * delta * -1 * speed.z);
    movement.add(right.multiplyScalar(maxSpeed * delta * -speed.x));
    movement.add((new Vector3(0, 1, 0)).multiplyScalar(maxSpeed * delta * speed.y));

    // Change target location
    controls.target.add(movement);

    // Change camera location
    controls.object.position.add(movement);
  }
  controls.update();
}

return controls;
}

export { createControls };
