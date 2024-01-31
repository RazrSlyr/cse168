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
import { Vector3, CanvasTexture, MeshBasicMaterial, Object3D, BufferGeometry, Line, CircleGeometry, Mesh, Matrix4, Raycaster, RingGeometry, LineBasicMaterial, Float32BufferAttribute, AdditiveBlending, Quaternion } from '../../lib/three.module.js';
import { createRock } from './components/rock.js';

import { FogExp2 } from '../../lib/three.module.js';
import { Lamp } from './components/Lamp.js';
import { VRButton } from '../../lib/VRButton.js';
import { XRControllerModelFactory } from '../../lib/XRControllerModelFactory.js';
import { XRHandModelFactory } from '../../lib/XRHandModelFactory.js';

let camera;
let controls;
let renderer;
let scene;
let loop;
let hand1, hand2;

let controller1, controller2;
let controllerGrip1, controllerGrip2;
const handModels = {
  left: null,
  right: null
};

let INTERSECTION;
let marker;
const tempMatrix = new Matrix4();
let raycaster;

let baseReferenceSpace;

let ground;

const heightOffset = -2.5;

class World {
  constructor(container) {
    // Set up scene and camera
    camera = createCamera();
    renderer = createRenderer();
    scene = createScene();

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
      scene.add(rocks[i]);
    }
  }

  render() {
    INTERSECTION = undefined;

    if (controller1.userData.isSelecting === true) {

      tempMatrix.identity().extractRotation(controller1.matrixWorld);

      raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
      raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

      const intersects = raycaster.intersectObjects([ground]);

      if (intersects.length > 0) {

        INTERSECTION = intersects[0].point;

      }

    } else if (controller2.userData.isSelecting === true) {

      tempMatrix.identity().extractRotation(controller2.matrixWorld);

      raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
      raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

      const intersects = raycaster.intersectObjects([ground]);

      if (intersects.length > 0) {

        INTERSECTION = intersects[0].point;

      }

    }

    if (INTERSECTION) {
      marker.position.copy(INTERSECTION);
    }

    marker.visible = INTERSECTION !== undefined;
  }

  start() {
    loop.start();
  }

  stop() {
    loop.stop();
  }

  setupHands(controllerModelFactory, handModelFactory, dolly) {
    // Hand 1

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    dolly.add(controllerGrip1);

    hand1 = renderer.xr.getHand(0);
    hand1.userData.currentHandModel = 0;
    dolly.add(hand1);

    handModels.left = [
      handModelFactory.createHandModel(hand1, 'boxes'),
      handModelFactory.createHandModel(hand1, 'spheres'),
      handModelFactory.createHandModel(hand1, 'mesh')
    ];

    for (let i = 0; i < 3; i++) {

      const model = handModels.left[i];
      model.visible = i == 0;
      hand1.add(model);

    }

    hand1.addEventListener('pinchend', function () {

      handModels.left[this.userData.currentHandModel].visible = false;
      this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
      handModels.left[this.userData.currentHandModel].visible = true;

    });

    // Hand 2

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    dolly.add(controllerGrip2);

    hand2 = renderer.xr.getHand(1);
    hand2.userData.currentHandModel = 0;
    dolly.add(hand2);

    handModels.right = [
      handModelFactory.createHandModel(hand2, 'boxes'),
      handModelFactory.createHandModel(hand2, 'spheres'),
      handModelFactory.createHandModel(hand2, 'mesh')
    ];

    for (let i = 0; i < 3; i++) {

      const model = handModels.right[i];
      model.visible = i == 0;
      hand2.add(model);

    }

    hand2.addEventListener('pinchend', function () {

      handModels.right[this.userData.currentHandModel].visible = false;
      this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
      handModels.right[this.userData.currentHandModel].visible = true;

    });
  }

  buildController(data) {

    let geometry, material;

    switch (data.targetRayMode) {

      case 'tracked-pointer':

        geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3));
        geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

        material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending });

        return new Line(geometry, material);

      case 'gaze':

        geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
        material = new MeshBasicMaterial({ opacity: 0.5, transparent: true });
        return new Mesh(geometry, material);

    }

  }

  setupControllerEvents() {
    const buildController = this.buildController;

    function onSelectStart() {
      this.userData.isSelecting = true;

    }

    function onSelectEnd() {

      this.userData.isSelecting = false;
      console.log("AAAA");

      if (INTERSECTION) {

        const offsetPosition = { x: - INTERSECTION.x, y: - INTERSECTION.y + heightOffset, z: - INTERSECTION.z, w: 1 };
        const offsetRotation = new Quaternion();
        const transform = new XRRigidTransform(offsetPosition, offsetRotation);
        const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);

        renderer.xr.setReferenceSpace(teleportSpaceOffset);

      }

    }

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    controller1.addEventListener('connected', function (event) {

      this.add(buildController(event.data));

    });
    controller1.addEventListener('disconnected', function () {

      this.remove(this.children[0]);

    });
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    controller2.addEventListener('connected', function (event) {

      this.add(buildController(event.data));

    });
    controller2.addEventListener('disconnected', function () {

      this.remove(this.children[0]);

    });
    scene.add(controller2);

  }

  setupVR() {
    // Setup webxr button
    renderer.xr.addEventListener('sessionstart', () => baseReferenceSpace = renderer.xr.getReferenceSpace());
    renderer.xr.enabled = true;
    const enterVRButton = document.getElementById("asgn5").appendChild(VRButton.createButton(renderer));
    enterVRButton.style.backgroundColor = "#04E762";

    // Setup Controller
    controller1 = renderer.xr.getController(0);

    controller2 = renderer.xr.getController(1);

    const controllerModelFactory = new XRControllerModelFactory();
    const handModelFactory = new XRHandModelFactory();

    // Setup dolly for moving the renderer
    const dolly = new Object3D();
    // dolly.position.z = 5;
    dolly.add(camera);
    dolly.add(controller1);
    dolly.add(controller2);

    // Setup Hands
    this.setupHands(controllerModelFactory, handModelFactory, dolly);

    // Setup Teleport Marker
    marker = new Mesh(
      new CircleGeometry(0.25, 32).rotateX(- Math.PI / 2),
      new MeshBasicMaterial({ color: 0xbcbcbc })
    );
    scene.add(marker);

    // Create raycaster for teleport location detection
    raycaster = new Raycaster();

    scene.add(dolly);

    // Setup Controller Events
    this.setupControllerEvents();

    const dummyCam = new Object3D();
    camera.add(dummyCam);
  }
}

export { World };
