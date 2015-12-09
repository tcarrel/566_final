
/** Builds and returns a single quad that can later be oriented and scaled as
 * necessary.
 */
function build_quad( width, length, w_offset, l_offset )
{
    var quad = [];
    /* (-,-)3   (-,+)0
     *----*              *---->  (width)
     | __/|              |
     |/   |              |(length)
     *----*              V
     (+,-)1   (+,+)2
     */

    // (-,-)
    quad.push( [ (l_offset - (length/2) ), ( w_offset + (width/2) ) ] );
    // (-,+)
    quad.push( [ (l_offset + (length/2) ), ( w_offset - (width/2) ) ] );
    // (+,+)
    quad.push( [ (l_offset + (length/2) ), ( w_offset + (width/2) ) ] );
    // (+,-)
    quad.push( [ (l_offset - (length/2) ), ( w_offset - (width/2) ) ] );


    return quad;
}

/** Creates and single panel of the plane.
*/
function init_terrain( gl, T, image )
{
    gl.useProgram( T.program );

    //Load Image.
    var quad = build_quad( 100, 100, 0, 0 );
    T.shape = new Float32Array([
            quad[0][0], 0, quad[0][1],  0.0,  0.0, 0.0, 1.0, 0.0,
            quad[1][0], 0, quad[1][1], 20.0, 20.0, 0.0, 1.0, 0.0,
            quad[3][0], 0, quad[3][1],  0.0, 20.0, 0.0, 1.0, 0.0,
            quad[0][0], 0, quad[0][1],  0.0,  0.0, 0.0, 1.0, 0.0,
            quad[2][0], 0, quad[2][1], 20.0,  0.0, 0.0, 1.0, 0.0,
            quad[1][0], 0, quad[1][1], 20.0, 20.0, 0.0, 1.0, 0.0
            ] 
            );
    T.ppv = 8; //Points Per Vertex

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture( T.texture_unit );
    T.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, T.texture);
    gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image );
    gl.generateMipmap(gl.TEXTURE_2D);
    console.log("@@ SUCCESS: Terrain texture, loaded.");

    //Load verticies.
    if( !T.buffer )
    {
        T.buffer = gl.createBuffer(); //second attempt, just in case
    }

    if( !T.buffer )
    {
        console.log(">>>>> Failed to create terrain buffer.");
    }
    else
    {
        console.log("@@ SUCCESS: Terrain buffer was created.");
    }

    var FSIZE = T.shape.BYTES_PER_ELEMENT;
    gl.bindBuffer( gl.ARRAY_BUFFER, T.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, T.shape, gl.STATIC_DRAW );
    gl.vertexAttribPointer(
            T.svars.a_pos,
            3,
            gl.FLOAT,
            false,
            T.ppv * FSIZE,
            0 );
    gl.enableVertexAttribArray( T.svars.a_pos );
    gl.vertexAttribPointer(
            T.svars.a_tex_coord,
            2,
            gl.FLOAT,
            false,
            T.ppv * FSIZE,
            3 * FSIZE);
    gl.enableVertexAttribArray( T.svars.a_tex_coord );
    gl.vertexAttribPointer(
            T.svars.a_normal,
            3,
            gl.FLOAT,
            false,
            T.ppv * FSIZE,
            5 * FSIZE );
    gl.enableVertexAttribArray( T.svars.a_normal );
    T.model_mat = new Matrix4();

    T.is_loaded = true;
}
/** Render all terrain that has been loaded.
 * @param gl, The monolithic WebGL object.
 * @param T, a transformation matrix for the parent of this node.
 */
function get_rf()
{
    return function( gl, at, pers, wf, diffuse )
    {
        if( !this.is_loaded )
            return;

        gl.useProgram( this.program );

        var FSIZE = this.shape.BYTES_PER_ELEMENT;

        gl.bindTexture( gl.TEXTURE_2D, this.texture );
        gl.uniform1i( this.svars.u_sampler, this.texture_unit );

        gl.uniform3fv(this.svars.u_ambient,     AMBIENT );
        gl.uniform3fv(this.svars.u_light_color, diffuse.color );
        gl.uniform3fv(this.svars.u_light_pos,   diffuse.pos   );

        gl.uniformMatrix4fv(
                this.svars.u_xform,
                false,
                this.model_mat.elements );
        gl.uniformMatrix4fv(
                this.svars.u_view,
                false,
                at.elements );
        gl.uniformMatrix4fv(
                this.svars.u_perspective,
                false,
                pers.elements );
        gl.bindBuffer(
                gl.ARRAY_BUFFER,
                this.buffer );
        gl.vertexAttribPointer(
                this.svars.a_pos,
                3,
                gl.FLOAT,
                false,
                this.ppv * FSIZE,
                0 );
        gl.vertexAttribPointer(
                this.svars.a_tex_coord,
                2,
                gl.FLOAT,
                false,
                this.ppv * FSIZE,
                3 * FSIZE );
        gl.vertexAttribPointer(
                this.svars.a_normal,
                3,
                gl.FLOAT,
                false,
                this.ppv * FSIZE,
                5 * FSIZE );
        if( !wf )
            gl.drawArrays(
                    gl.TRIANGLES,
                    0,
                    this.shape.length / this.ppv );
        else
            gl.drawArrays(
                    gl.LINE_LOOP,
                    0,
                    this.shape.length / this.ppv );
    };
}
