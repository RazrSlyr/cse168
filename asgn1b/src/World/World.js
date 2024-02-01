import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';
import { createBox } from './components/cube.js';

import { createControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { getDrawingMaterial, getGrassMaterial, getSkyboxMaterial } from './components/materials.js';
import { createSphere } from './components/sphere.js';
import { createTree } from './components/tree.js';
import { Vector3, CanvasTexture, MeshBasicMaterial, Matrix4, Group } from '../../lib/three.module.js';
import { createRock } from './components/rock.js';

import { FogExp2 } from '../../lib/three.module.js';
import { Lamp } from './components/Lamp.js';

import { VRSystem } from './systems/VRSystem.js';

let camera;
let controls;
let renderer;
let scene;
let loop;
let vrSystem;


let ground;

let grabables;


class World {
  constructor(container) {
    // Set up scene and camera
    camera = createCamera();
    renderer = createRenderer();
    scene = createScene();
    grabables = new Group();

    loop = new Loop(camera, scene, renderer, this.render);
    container.append(renderer.domElement);

    // Camera controls
    controls = createControls(camera, renderer.domElement);
    controls.saveState();
    window.addEventListener("keydown", (event) => {
      if (event.key === "r") {
        controls.reset();
      }
    })


    const { ambientLight, mainLight } = createLights();
    // Make the shadow box bigger
    mainLight.shadow.camera["left"] = -40;
    mainLight.shadow.camera["right"] = 40;
    mainLight.shadow.camera["top"] = 40;
    mainLight.shadow.camera["bottom"] = -40;

    // Main light visual (a yellow sphere)
    const sun = createSphere(new MeshBasicMaterial({
      color: "#ffffe6",
    }));
    sun.position.copy(mainLight.position);
    sun.angle = 90;
    sun.distance = 10;

    sun.tick = function (delta) {
      sun.angle = (sun.angle + 20 * delta) % 360;
      sun.position.y = Math.sin(sun.angle / 180 * Math.PI) * sun.distance;
      sun.position.z = Math.cos(sun.angle / 180 * Math.PI) * sun.distance;
      mainLight.position.copy(sun.position);
    }

    // set up fog
    const fogColor = 0x555577;
    scene.fogDensity = 0.00;

    // Fog that comes and goes
    scene.tick = (delta) => {
      scene.fogDensity = Math.max(-1 * Math.sin(sun.angle / 180 * Math.PI) / 30, 0);
      scene.fog = new FogExp2(fogColor, scene.fogDensity);
    }


    // Ground
    const grassMaterial = getGrassMaterial();
    ground = createBox(grassMaterial);
    ground.position.y = -3;
    ground.scale.set(45, 1, 45);
    ground.receiveShadow = true;

    // Skybox
    const skyMaterial = getSkyboxMaterial();
    const sky = createSphere(skyMaterial);
    sky.scale.set(45, 45, 45);

    // Lamp
    const lamp = new Lamp();
    lamp.position.set(-1.5, -1, 1);
    lamp.scale.set(0.5, 0.5, 0.5);


    // Drawing Board
    const drawing = createBox(getDrawingMaterial());
    drawing.scale.set(3, 3, 0.1);
    drawing.tick = function (delta) {
      const ctx = document.getElementById("webgl").getContext("webgl");
      const texture = new CanvasTexture(ctx.canvas);
      drawing.material.map = texture;
    }

    loop.updatables.push(controls, scene, drawing, sun);
    scene.add(ambientLight, mainLight, sky, ground, drawing, lamp, sun);

    const resizer = new Resizer(container, camera, renderer);
    vrSystem = new VRSystem(renderer, scene, ground, grabables);
  }

  async init() {
    // Add trees
    let treePositions = [
      new Vector3(-10, 3, -10),
      new Vector3(10, 3, -10),
      new Vector3(-10, 3, 10),
      new Vector3(10, 3, 10),
      new Vector3(12, 3, 0),
      new Vector3(-12, 3, 0),
      new Vector3(0, 3, -13),
      new Vector3(0, 3, 13),

    ]
    let treePromises = [];
    for (let i = 0; i < treePositions.length; i++) {
      treePromises.push(createTree());
    }
    let trees = await Promise.all(treePromises);
    for (let i = 0; i < trees.length; i++) {
      trees[i].position.copy(treePositions[i]);
      trees[i].scale.set(5, 5, 5);
      trees[i].castShadow = true;
      scene.add(trees[i]);
    }

    // Add rock
    let rockPositions = [
      new Vector3(-20, -2, 0),
      new Vector3(-18, -2, 12),
      new Vector3(-7, -2, -6),
      new Vector3(9, -2, -12),
      new Vector3(-15, -2, -8),
      new Vector3(8, -2, 12),
      new Vector3(17, -2, -19),
      new Vector3(5, -2, 19),
      new Vector3(-12, -2, -6),
      new Vector3(19, -2, -6),
      new Vector3(12, -2, 18),
    ];
    let rockPromises = [];
    for (let i = 0; i < rockPositions.length; i++) {
      rockPromises.push(createRock());
    }
    let rocks = await Promise.all(rockPromises);
    for (let i = 0; i < rocks.length; i++) {
      rocks[i].position.copy(rockPositions[i]);
      rocks[i].scale.set(0.01, 0.01, 0.01);
      rocks[i].castShadow = true;
      grabables.add(rocks[i]);
    }

    scene.add(grabables);

    // Setup VR
    vrSystem.setupVR();
  }

  render() {
    vrSystem.render();
  }

  start() {
    loop.start();
  }

  stop() {
    loop.stop();
  }
}

export { World };
