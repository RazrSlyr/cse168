import { MTLLoader } from "../../../lib/MTLLoader.js";
import { OBJLoader } from "../../../lib/OBJLoader.js";

let mesh;

async function createTree() {
    if (mesh === undefined) {
        // First, load material
        const matLoader = new MTLLoader();
        const mats = await matLoader.loadAsync("../../../assets/models/Tree/materials.mtl");

        // Next, load OBJ
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mats);
        mesh = await objLoader.loadAsync("../../../assets/models/Tree/model.obj");
    }
    return mesh.clone();
}

export { createTree }