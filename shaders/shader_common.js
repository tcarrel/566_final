

/**
 * Get location of an individual shader var.
 */
function svars_(gl, varname, vars)
{
    switch( varname[0] ) // "Standardized" naming conventions must be used 
    {                    //for this to work.
        case 'u':
            //fallthrough
        case 'U':
            vars = gl.getUniformLocation(gl.program, varname);
            break;
        case 'a':
            //fallthrough
        case 'A':
            vars = gl.getAttribLocation(gl.program, varname);
            break;
        default:
            vars = -1;
    }

    if( vars < 0 )
    {
        console.log("Failed to find '" + varname + ".'")
    }
    else
    {
        console.log("@@ SUCCESS: " + varname + " found.");
    }
    return;
}
