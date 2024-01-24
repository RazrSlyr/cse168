import { SphereGeometry, Mesh } from "../../../lib/three.module.js";


function createSphere(material) {
    const geom = new SphereGeometry(1, 20, 20);
    const mesh = new Mesh(geom, material);

    return mesh;
}

export { createSphere }