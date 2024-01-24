import { getGrassMaterial, getRockMaterial } from "./materials.js";
import { OBJLoader } from "../../../lib/OBJLoader.js";

let mesh;

async function createRock() {
    if (mesh === undefined) {
        const loader = new OBJLoader();
        mesh = await loader.loadAsync("../../../assets/models/rock2.obj");
        mesh = mesh.children[0];
        mesh.material = getRockMaterial();
    }
    return mesh.clone();
}

export {createRock}