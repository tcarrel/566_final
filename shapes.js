

function get_cube(points, triangles, faces)
{
    points = new Float32Array
        // x,   y,   z
        ([
         1.0,  1.0,  1.0,   // 0
        -1.0,  1.0,  1.0,   // 1
        -1.0, -1.0,  1.0,   // 2
         1.0, -1.0,  1.0,   // 3
         1.0,  1.0, -1.0,   // 4
        -1.0,  1.0, -1.0,   // 5
        -1.0, -1.0, -1.0,   // 6
         1.0, -1.0, -1.0    // 7
        ]);
    triangles = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 7],
        [0, 7, 4],
        [7, 6, 5],
        [7, 5, 4]
    ]
}


function get_skybox()
{
}

//
function get_plane(x_steps, z_steps, x_len, z_len)
{
    debugger;

    var dx = x_len / x_steps;
    var dz = z_len / z_steps;

    var top_left     = [0.0, 0.0];
    var top_right    = [ dx, 0.0];
    var bottom_left  = [0.0,  dz];
    var bottom_right = [ dx,  dz];

    var plane = [];
    var z_adg = Math.floor( z_steps / 2);
    var x_adg = Math.floor( z_steps / 2);

    var direction = 1;
    for( var z = -z_adg; z < z_adg; z++ )
    {
        // Increment loop if direction is positive,
        //decrement loop if direction is negative.
        for( 
                var x = ((direction > 0) ? 0 : x_adg - 1);
                ((direction > 0) ? (x < x_adg) : (x >= -x_adg));
                x += direction
           )
        {
            //Vertex coordinate 1.
            plane.push(x_adg + (x * top_left[0]));
            plane.push(0);
            plane.push(z_adg + (z * top_left[1]));

            //Texture coordinate 1.
            plane.push(x * dx);
            plane.push(z * dz);

            /*
            //Vertex coordinate 2;
            plane.push(x * dx);
            plane.push(0);
            plane.push(z * dz);

            //Texture coordinate 2;
            plane.push(x * dx);
            plane.push(z2 * dz);
            direction = direction * -1;
            */
        }
        direction = -direction;
    }

    return new Float32Array(plane);
}
