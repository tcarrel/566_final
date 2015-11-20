

/**
 * Get location of an individual shader var.
 * @param gl, The WebGL object.
 * @param varname, The name of the shader variable as a string.
 * @param prog, The shader program to use.
 */
function set_svar( gl, varname, prog )
{

    var vars = -1;

    switch( varname[0] ) // "Standardized" naming conventions must be used 
    {                    //for this to work.
        case 'u':
            //fallthrough
        case 'U':
            vars = gl.getUniformLocation(prog, varname);
            break;
        case 'a':
            //fallthrough
        case 'A':
            vars = gl.getAttribLocation(prog, varname);
            break;
        default:
            throw "Shader variable must begin with 'a' or 'u'.";
    }

    if( vars < 0 )
    {
        console.log("Failed to find '" + varname + ".'")
    }
    else
    {
        if( vars !== null )
        {
            console.log("@@ SUCCESS: " + varname + " found.");
        }
        else
        {
            console.log( "%% " + varname + " is null, may have been " +
                    "removed during compile." );
        }
    }
    return vars;
}
