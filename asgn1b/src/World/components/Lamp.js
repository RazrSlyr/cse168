import { Group, MeshBasicMaterial, MeshPhongMaterial, TorusGeometry, Mesh, PointLight} from "../../../lib/three.module.js";
import { createBox } from "./cube.js";

class Lamp extends Group {
    constructor() {
        super();
        // Add base
        let base = createBox(new MeshPhongMaterial({
            color: "#A52A2A"
        }));
        base.scale.set(0.5, 5, 0.5);

        // Add head
        let headGeom = new TorusGeometry(0.5, 0.25, 10, 20);
        let headMaterial = new MeshPhongMaterial({
            color: "yellow",
        });
        let head = new Mesh(headGeom, headMaterial);
        head.translateY(3);

        // Add a Point light
        let light = new PointLight("#ffffcc", 2, 6);
        light.position.copy(head.position);
        console.log(light);
        

        this.add(base, head, light);
    }
}

export { Lamp }