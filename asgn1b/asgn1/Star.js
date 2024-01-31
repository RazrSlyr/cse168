class Star {
    constructor(position, color, size) {
        this.type = "star";
        this.position = position;
        this.color = color;
        this.size = size;
    }

    render() {
        let [x, y] = this.position;
        let rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.vertexAttrib1f(a_Size, this.size);

        // Draw
        let mult = this.size / 10;
        // 6 necessary points
        // these points are based on a star I made in geogebra
        // here's the link https://www.geogebra.org/calculator/eypzydf7
        // the star can be made of three triangles
        // ABF, CBF, and DEF
        let a = [-0.05, -0.05];
        let b = [0, 0.05];
        let c = [0.05, -0.05];
        let d = [-0.06, 0.02];
        let e = [0.06, 0.02];
        let f = [0, -0.0181818181818];

        let points = [a, b, c, d, e, f]

        // First, scale the star in size and move
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            point[0] = point[0] * mult + x;
            point[1] = point[1] * mult + y;
        }

        // Draw the triangles
        // ABF
        drawTriangle([a[0], a[1], b[0], b[1], f[0], f[1]]);
        // CBF
        drawTriangle([c[0], c[1], b[0], b[1], f[0], f[1]]);
        // DEF
        drawTriangle([d[0], d[1], e[0], e[1], f[0], f[1]]);
    }
}