class Circle {
    constructor(position, color, size, segments) {
        this.type = "circle";
        this.position = position;
        this.color = color;
        this.size = size;
        this.segments = segments;
    }

    render() {
        let [x, y] = this.position;
        let rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.vertexAttrib1f(a_Size, this.size);
        // Draw
        let rad = 0.025 / 10 * this.size;
        let center = [x, y];
        let p1 = [x + rad, y];
        for (let i = 0; i < this.segments; i++) {
            let angle = (i + 1) * 360 / this.segments * Math.PI / 180;
            let p2 = [center[0] + Math.cos(angle) * rad, center[1] + Math.sin(angle) * rad];
            drawTriangle([center[0], center[1], p1[0], p1[1], p2[0], p2[1]]);
            p1 = p2;
        }
    }
}