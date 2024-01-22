import { BoxGeometry, Mesh, MeshPhongMaterial } from "../../../lib/three.module.js";


function createBox(material) {
    const geom = new BoxGeometry(1, 1);
    const mesh = new Mesh(geom, material);

    return mesh;
}

export { createBox }