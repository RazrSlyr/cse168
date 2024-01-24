class Point {
    constructor(position, color, size) {
        this.type = "point";
        this.position = position;
        this.color = color;
        this.size = size;
    }

    render() {
        console.log("Drawing a square");
        let xy = this.position;
        let rgba = this.color;

        // Quit using the buffer to send the attribute
        gl.disableVertexAttribArray(a_Position);
        
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.vertexAttrib1f(a_Size, this.size);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}