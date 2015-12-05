

function get_lights( gl )
{
    var shaders = get_shadow_shaders();
    var program = gl.createProgram( gl, shaders.vert, shaders.frag );
    if( program )
    {
        console.log( "@@ SUCCESS: compiled program for generating shadows.\n\n" +
                 "\tVERTEX SHADER:\n" +
                 shaders.vert +
                 "\n\tFRAGMENT SHADER:\n" +
                 shaders.frag );
    }
    else
    {
        throw "Could not create shadow program";
    }

    return;
}


function update_shadows( gl )
{

}
