class Squirtle {
    constructor(position, size, _gl) {
        this.type = "squirtle";
        this.position = position;
        this.size = size;
        if (_gl == undefined) this.gl = gl;
        else { this.gl = _gl };
        // check if shiny
        this.shiny = false;
        if (Math.random() <= 0.01) this.shiny = true;
    }

    render() {
        let [x, y] = this.position;

        let _a_Size;
        if (this.gl == gl) _a_Size = a_Size;
        else _a_Size = a_Size2;
        this.gl.vertexAttrib1f(_a_Size, this.size);

        // Define colors
        let headColor;
        let shellFront;
        let shellBack;
        if (!this.shiny) {
            headColor = [180 / 255, 241 / 255, 253 / 255, 1];
            shellFront = [245 / 255, 234 / 255, 126 / 255, 1];
            shellBack = [199 / 255, 99 / 255, 14 / 255, 1];
        } else {
            headColor = [181 / 255, 205 / 255, 254 / 255, 1];
            shellFront = [254 / 255, 230 / 255, 99 / 255, 1];
            shellBack = [157 / 255, 222 / 255, 123 / 255, 1];
        }
        

        
        let mouthColor = [88 / 255, 51 / 255, 59 / 255, 1];
        let tongueColor = [223 / 255, 129 / 255, 127 / 255, 1];
        let eyeColor = [145 / 255, 82 / 255, 109 / 255, 1];
        let eyeColor2 = [249 / 255, 230 / 255, 230 / 255, 1];
        let black = [0, 0, 0, 1];
        let white = [1, 1, 1, 1];

        // Draw
        let mult = this.size / 50;
        // who knows how many points
        // these points are based on the squirtle I made on graph paper
        // re-created the squirtle in geogebra
        // here is the link: https://www.geogebra.org/calculator/z8e6hkj8
        // there are many different triangles and quads to be made
        let a = [9, -1];
        let b = [9, 4];
        let c = [6, 7];
        let d = [-9, -1];
        let e = [-9, 4];
        let f = [-6, 7];
        let g = [-10, -7];
        let h = [10, -7];
        let i = [-6, -7];
        let j = [6, -7];
        let k = [-6, -4];
        let l = [6, -4];
        let m = [8, -2];
        let n = [-8, -2];
        let o = [-5, -1];
        let p = [5, -1];
        let q = [5, -3];
        let r = [-5, -3];
        let s = [-4, -3];
        let t = [4, -3];
        let u = [-4, -2];
        let v = [4, -2];
        let w = [-2, 1];
        let z = [2, 1];
        let a1 = [-2, 4];
        let b1 = [2, 4];
        let c1 = [-5, 4];
        let d1 = [5, 4];
        let e1 = [-6, 4];
        let f1 = [6, 4];
        let g1 = [-6, 1];
        let h1 = [6, 1];
        let i1 = [-5, 1];
        let j1 = [5, 1];
        let k1 = [-4, 1];
        let l1 = [4, 1];
        let m1 = [-3, 1];
        let n1 = [3, 1];
        let o1 = [-4, 3];
        let p1 = [-3, 3];
        let q1 = [4, 3];
        let r1 = [3, 3];
        let s1 = [-3, 4];
        let t1 = [4, 4];
        let u1 = [5, 3];
        let v1 = [-8, -5.5];
        let w1 = [8, -5.5];
        let z1 = [-2, 3];

        let points = [a, b, c, d, e, f, g, h, i, j, k,
            l, m, n, o, p, q, r, s, t, u, v, w, z, a1,
            b1, c1, d1, e1, f1, g1, h1, i1, j1, k1, l1,
            m1, n1, o1, p1, q1, r1, s1, t1, u1, v1, w1, z1]


        // First, scale the points in size and move
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            point[0] = point[0] / 15 * mult + x;
            point[1] = point[1] / 15 * mult + y;
        }

        // Draw the head and arms
        loadColor(headColor, this.gl);
        drawQuad(f, c, l, k, this.gl);
        drawQuad(e, f, k, d, this.gl);
        drawQuad(c, b, a, l, this.gl);
        drawTriangle([k[0], k[1], i[0], i[1], g[0], g[1]], this.gl);
        drawTriangle([l[0], l[1], h[0], h[1], j[0], j[1]], this.gl);


        // Draw the mouth
        loadColor(mouthColor, this.gl);
        drawQuad(o, p, q, r, this.gl);
        loadColor(tongueColor, this.gl);
        drawQuad(u, v, t, s, this.gl);

        // Draw the eyes
        loadColor(eyeColor, this.gl);
        drawQuad(c1, a1, w, i1, this.gl);
        drawQuad(b1, d1, j1, z, this.gl);
        loadColor(black, this.gl);
        drawQuad(o1, p1, m1, k1, this.gl);
        drawQuad(r1, q1, l1, n1, this.gl);
        loadColor(white, this.gl);
        drawQuad(e1, c1, i1, g1, this.gl);
        drawQuad(d1, f1, h1, j1, this.gl);
        loadColor(eyeColor2, this.gl);
        drawQuad(s1, a1, z1, p1, this.gl);
        drawQuad(t1, d1, u1, q1, this.gl);

        // Draw the shell
        loadColor(shellFront, this.gl);
        drawQuad(k, l, j, i, this.gl);
        loadColor(shellBack, this.gl);
        drawTriangle([n[0], n[1], k[0], k[1], v1[0], v1[1]], this.gl);
        drawTriangle([m[0], m[1], w1[0], w1[1], l[0], l[1]], this.gl);

        this.gl.disableVertexAttribArray(a_Position);
    }
}

function loadColor(color, _gl) {
    if (_gl == undefined) _gl = gl;
    let _u_FragColor;
    if (_gl == gl) _u_FragColor = u_FragColor;
    else _u_FragColor = u_FragColor2;
    _gl.uniform4f(_u_FragColor, color[0], color[1], color[2], color[3]);
}

// pass in points in order of:
// top left, top right, bottom right, bottom left
function drawQuad(tl, tr, br, bl, _gl) {
    if (_gl == undefined) _gl = gl;
    drawTriangle([tl[0], tl[1], tr[0], tr[1], br[0], br[1]], _gl);
    drawTriangle([tl[0], tl[1], bl[0], bl[1], br[0], br[1]], _gl);
}

