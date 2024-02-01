import { VRButton } from '../../../lib/VRButton.js';
import { XRControllerModelFactory } from '../../../lib/XRControllerModelFactory.js';
import { XRHandModelFactory } from '../../../lib/XRHandModelFactory.js';
import { Vector3, CanvasTexture, MeshBasicMaterial, Object3D, BufferGeometry, Line, CircleGeometry, Mesh, Matrix4, Raycaster, RingGeometry, LineBasicMaterial, Float32BufferAttribute, AdditiveBlending, Quaternion } from '../../../lib/three.module.js';


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
let intersected = [];

let baseReferenceSpace;
const heightOffset = -2.5;

class VRSystem {

    constructor(renderer, scene, ground, grabables) {
        this.renderer = renderer;
        this.scene = scene;
        this.ground = ground;
        this.grabables = grabables;
    }

    #setupHands(controllerModelFactory, handModelFactory) {
        // Hand 1

        controllerGrip1 = this.renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        this.scene.add(controllerGrip1);

        hand1 = this.renderer.xr.getHand(0);
        hand1.userData.currentHandModel = 0;
        this.scene.add(hand1);

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

        controllerGrip2 = this.renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        this.scene.add(controllerGrip2);

        hand2 = this.renderer.xr.getHand(1);
        hand2.userData.currentHandModel = 0;
        this.scene.add(hand2);

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

    #buildController(data) {

        let geometry, material;

        switch (data.targetRayMode) {

            case 'tracked-pointer':

                geometry = new BufferGeometry();
                geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3));
                geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

                material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending });

                const line = new Line(geometry, material);
                line.name = "ray";
                return line;

            case 'gaze':

                geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
                material = new MeshBasicMaterial({ opacity: 0.5, transparent: true });
                const gaze = new Mesh(geometry, material);
                gaze.name = "ray";
                return gaze;

        }

    }
    

    #getIntersections(controller, grabables=this.grabables) {

        controller.updateMatrixWorld();

        tempMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

        return raycaster.intersectObjects(grabables.children, false);

    }


    #setupControllerEvents() {
        const buildController = this.#buildController;
        const renderer = this.renderer
        const getIntersections = this.#getIntersections;
        const grabables = this.grabables;

        function controllerOneOnSelectStart(event) {

            const controller = event.target;
    
            const intersections = getIntersections(controller, grabables);
    
            if (intersections.length > 0) {
    
                const intersection = intersections[0];

                if (intersection.distance > 3) {
                    return;
                }
    
                const object = intersection.object;
                object.material.emissive.b = 1;
                controller.attach(object);
    
                controller.userData.selected = object;
    
            }
    
            controller.userData.targetRayMode = event.data.targetRayMode;
    
        }
    
        function controllerOneOnSelectEnd(event) {
    
            const controller = event.target;
    
            if (controller.userData.selected !== undefined) {
    
                const object = controller.userData.selected;
                object.material.emissive.b = 0;
                grabables.attach(object);
    
                controller.userData.selected = undefined;
    
            }
    
        }

        function onSelectStart() {
            this.userData.isSelecting = true;

        }

        function onSelectEnd() {

            this.userData.isSelecting = false;

            if (INTERSECTION) {

                const offsetPosition = { x: - INTERSECTION.x, y: - INTERSECTION.y + heightOffset, z: - INTERSECTION.z, w: 1 };
                const offsetRotation = new Quaternion();
                const transform = new XRRigidTransform(offsetPosition, offsetRotation);
                const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);

                renderer.xr.setReferenceSpace(teleportSpaceOffset);

            }

        }

        controller1 = this.renderer.xr.getController(0);
        controller1.addEventListener('selectstart', controllerOneOnSelectStart);
        controller1.addEventListener('selectend', controllerOneOnSelectEnd);
        controller1.addEventListener('connected', function (event) {

            this.add(buildController(event.data));

        });
        controller1.addEventListener('disconnected', function () {

            this.remove(this.children[0]);

        });
        this.scene.add(controller1);

        controller2 = this.renderer.xr.getController(1);
        controller2.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectend', onSelectEnd);
        controller2.addEventListener('connected', function (event) {

            this.add(buildController(event.data));

        });
        controller2.addEventListener('disconnected', function () {

            this.remove(this.children[0]);

        });
        this.scene.add(controller2);

    }

    setupVR() {
        // Setup webxr button
        this.renderer.xr.addEventListener('sessionstart', () => baseReferenceSpace = this.renderer.xr.getReferenceSpace());
        this.renderer.xr.enabled = true;
        const enterVRButton = document.getElementById("asgn5").appendChild(VRButton.createButton(this.renderer));
        enterVRButton.style.backgroundColor = "#04E762";

        // Setup Controller
        controller1 = this.renderer.xr.getController(0);

        controller2 = this.renderer.xr.getController(1);

        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory();

        // Setup Hands
        this.#setupHands(controllerModelFactory, handModelFactory);

        // Setup Teleport Marker
        marker = new Mesh(
            new CircleGeometry(0.25, 32).rotateX(- Math.PI / 2),
            new MeshBasicMaterial({ color: 0xbcbcbc })
        );
        this.scene.add(marker);

        // Create raycaster for teleport location detection
        raycaster = new Raycaster();;

        // Setup Controller Events
        this.#setupControllerEvents();
    }

    #intersectObjects(controller) {

        // Do not highlight in mobile-ar

        if (controller.userData.targetRayMode === 'screen') return;

        // Do not highlight when already selected

        if (controller.userData.selected !== undefined) return;

        const ray = controller.getObjectByName('ray');
        const intersections = this.#getIntersections(controller);

        if (intersections.length > 0) {

            const intersection = intersections[0];
            if (intersection.distance > 3) {
                return;
            }

            const object = intersection.object;
            object.material.emissive.r = 1;
            intersected.push(object);

            if (ray !== undefined) {
                ray.scale.z = intersection.distance;
            }

        } else {
            if (ray !== undefined) {
                ray.scale.z = 5;
            }
        }

    }

    #cleanIntersected() {

        while (intersected.length) {

            const object = intersected.pop();
            object.material.emissive.r = 0;

        }

    }

    render() {
        INTERSECTION = undefined;

        if (controller1.userData.isSelecting === true) {

            tempMatrix.identity().extractRotation(controller1.matrixWorld);

            raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
            raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

            const intersects = raycaster.intersectObjects([this.ground]);

            if (intersects.length > 0) {

                INTERSECTION = intersects[0].point;

            }

        } else if (controller2.userData.isSelecting === true) {

            tempMatrix.identity().extractRotation(controller2.matrixWorld);

            raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
            raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

            const intersects = raycaster.intersectObjects([this.ground]);

            if (intersects.length > 0) {

                INTERSECTION = intersects[0].point;

            }

        }

        if (INTERSECTION) {
            marker.position.copy(INTERSECTION);
        }

        marker.visible = INTERSECTION !== undefined;

        this.#cleanIntersected();
        this.#intersectObjects(controller1);

    }
}

export { VRSystem }