

const SHADOW_MAP_WIDTH  = 1024;
const SHADOW_MAP_HEIGHT = 1024;

function get_lights( gl, light, canvas )
{
    var shadow  = {};
    shadow.can_draw = false;

    var shaders = get_shadow_shaders();
    shadow.program = gl.createProgram( gl, shaders.vert, shaders.frag );
    if( shadow.program )
    {
        console.log( "@@ SUCCESS: compiled program " +
                "for generating shadows.\n\n" );
    }
    else
    {
        throw "Could not create shadow program";
    }


    var rad = 180 / Math.PI;
    var fov = Math.atan( 50/light.pos[1] );
    fov *= rad;

    var proj    = new Matrix4();
    proj.setPerspective( 
            2 * fov,
            SHADOW_MAP_WIDTH / SHADOW_MAP_HEIGHT,
            0.5,
            4 );
    proj.lookAt(
            light.pos[0], light.pos[1], light.pos[2],
            0.0, 0.0, 0.0,
            0.0, 0.0, 1.0 );

    shadow.fbo = get_fbo( gl );

    shadow.svars.a_pos  =   set_svars( gl, "a_pos", shadow.program );
    shadow.svars.u_mvp  =   set_svars( gl, "u_mvp", shadow.program );

    shadow.render = function( gl, shape )
    {
        if( !this.can_draw )
            return;

        gl.bindFramebuffer( gl.FRAMEBUFFER, this.fbo );
        gl.viewport( 0, 0, SHADOW_MAP_WIDTH, SHADOW_MAP_HEIGHT );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        gl.useProgram( this.program );
        shape.shape.render_shadow( gl, this.svars );

        //reset everything for normal drawing.
        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        gl.viewport( 0, 0, canvas.clientWidth, canvas.clientHeight );
    }

    return shadow;
}

function get_fbo( gl )
{
    var fbo = gl.createFramebuffer();
    if( !fbo )
    {
        console.log('%% FAILED: Could not create frame buffer object.');
        return null;
    }
    else
        console.log('@@ SUCCESS: Create FBO for shadow map.');

    var texture = gl.createTexture( gl.TEXTURE_2D, texture );
    if( !texture )
    {
        console.log('%% FAILED: Could not create shadow map texture object.');
        return null;
    }
    else
        console.log('@@ SUCCESS: Created shadow map texture object.');

    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            SHADOW_MAP_WIDTH,
            SHADOW_MAP_HEIGHT,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    var depth_buffer = gl.createRenderbuffer();
    if( !depth_buffer )
    {
        console.log('%% FAILED: Could not create renderbuffer object.');
        return null;
    }
    else
        console.log("@@ SUCCESS: Created renderbuffer object.");

    gl.bindFramebuffer( gl.FRAMEBUFFER, fbo );
    gl.framebufferTexture2D(
            gl.FRAMEBUFFER, 
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0 );
    gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            depth_buffer );

    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if( gl.FRAMEBUFFER_COMPLETE !== e )
    {
        console.log('%% FAILED: Frame buffer object is incomplete:\n\t' +
                e.toString() );
        return null;
    }
    fbo.texture = texture;

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    gl.bindTexture( gl.TEXTURE_2D, null );
    gl.bindRenderbuffer( gl.RENDERBUFFER, null );

    return fbo;
}

function update_shadows( gl )
{

}

