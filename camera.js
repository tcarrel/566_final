

const I = 1; const J = 2; const K = 4;
const BASE_TILT = 10;

/** Creates the camera object.
 * @param aspect, the initial aspect ratio.
 * @param world_size, An array with two entries, x and y, that represent the
 * maximum distance that can be travelled, +/-, away from the respective axis.
 */
function get_camera(aspect, world_size)
{
    var camera = {
        proj:        new Matrix4,
        view:        new Matrix4,
        view_base:   new Matrix4,
        translation: new Matrix4,
        rotation:    new Matrix4,
        up_down:     new Matrix4,
        angle:       0,
        tilt:        BASE_TILT,
        size:        0.5,
        height:      1.5,
        x: 0, z: 0, //Initial camera location.
        x_max:     world_size[0],
        x_min: 0 - world_size[0],
        z_max:     world_size[1],
        z_min: 0 - world_size[1]
    };
    camera.translation.setTranslate(0, camera.height, 0);
    camera.rotation.setIdentity();
    camera.up_down.setRotate( 360 + BASE_TILT, 1, 0, 0 );

    //  The DEBUG flag generates a camera location that is positioned below the
    // plane.  This was useful during debugging, but requires face culling to
    // be disabled in order for it to work properly.
    if( !DEBUG )
        camera.view_base.setLookAt( 
                0, 0, 5 * aspect,
                0, 0, 1,
                0, 1, 0 );
    else
        camera.view_base.setLookAt( 
                0, -2, 5 * (1/aspect),
                0, -2, 1,
                0, 1, 0 );

    camera.proj.setPerspective(
            40,
            aspect, 
            1,
            100 );
    if( !DEBUG )
        camera.view.setLookAt(
                0, 0, 5 * aspect,
                0, 0, 1,
                0, 1, 0 );
    else
        camera.view.setLookAt( 
                0, -2, 5 * (1/aspect),
                0, -2, 1,
                0, 1, 0 );

    /** Updates the projection matrix for the appropriate translations.  This
     * is only necessary if the window, and therefore, the canvas's aspect
     * ration has changed.
     * @param ratio, in case the aspect ration needs to be updated.
     */
    camera.update_projection = function(ratio)
    {
        this.proj.setPerspective(
                40,
                ratio,
                this.size,
                100 );
        if( !DEBUG )
            this.view_base.setLookAt(  
                    0, 0, 5 * aspect,
                    0, 0, 1,
                    0, 1, 0 );
        else
            this.view_base.setLookAt(   
                    0, -2, 5 * (1/aspect),
                    0, -2, 1,
                    0, 1, 0 );
    };

    /** Updates the view matrix.
     */
    camera.update_view = function()
    {
        var temp = new Matrix4;

        temp.concat(this.up_down);
        temp.concat(this.rotation);
        this.translation.invert();
        temp.concat(this.translation);
        this.translation.invert();
        temp.concat(this.view_base);
        for( var i = 0; i < 16; i++ )
            this.view.elements[i] = temp.elements[i];
    }

    // The following methods all do exactly what they say they do.
    camera.rotate_left_by = function(degrees)
    {
        this.angle += degrees;
        this.angle = this.angle % 360;

        this.rotation.invert();
        this.rotation.rotate( degrees, 0, 1, 0 );
        this.rotation.invert();
        this.update_view();
    };

    camera.rotate_right_by = function(degrees)
    {
        // I had... odd... results using negative angles for rotations, but
        //this is avoided by subtracting the angle fromm 360 degrees.
        this.angle += 360 - degrees;
        this.angle = this.angle % 360;

        this.rotation.invert();
        this.rotation.rotate( 360 - degrees, 0, 1, 0 );
        this.rotation.invert();
        this.update_view();
    };
    camera.look_up = function(degrees)
    {
        if( this.tilt == 60 + BASE_TILT )
            return;

        this.tilt += degrees;
        if( this.tilt > 60 + BASE_TILT )
        {
            degrees = this.tilt - 60 + BASE_TILT;
            this.tilt = 60 + BASE_TILT ;
        }

        this.up_down.invert();
        this.up_down.rotate( degrees, 1, 0, 0 );
        this.up_down.invert();
        this.update_view();
    };
    camera.look_down = function(degrees)
    {
        if( this.tilt == -60 - BASE_TILT )
            return;

        this.tilt -= degrees;
        if( this.tilt < -60 - BASE_TILT )
        {
            degrees = this.tilt - 60 - BASE_TILT;
            this.tilt = -60 - BASE_TILT;
        }

        this.up_down.invert();
        this.up_down.rotate( 360 - degrees, 1, 0, 0 );
        this.up_down.invert();
        this.update_view();
    }
    camera.reset_up_down = function()
    {
        this.up_down.setRotate( 360 + BASE_TILT, 1, 0, 0 );
        this.tilt = -5;
        this.update_view();
    }

    camera.move_backward = function(distance)
    {
        var movement = pol_to_cart( this.angle, I|K );
        movement[0] *= distance;
        movement[1] *= distance;
        movement[2] *= distance;

        this.check_bounds(movement);
        this.x += movement[0];
        this.z += movement[2];

        this.translation.translate(
                movement[0],
                movement[1],
                movement[2] );

        this.update_view();
    }
    camera.strafe_right = function(distance)
    {
        var movement = pol_to_cart( this.angle + 90, I|K );
        movement[0] *= distance;
        movement[1] *= distance;
        movement[2] *= distance;

        this.check_bounds(movement);
        this.x += movement[0];
        this.z += movement[2];

        this.translation.translate(
                movement[0],
                movement[1],
                movement[2] );

        this.update_view();
    }
    camera.strafe_left = function(distance)
    {
        distance = 0 - distance;
        this.strafe_right(distance);
    }

    camera.move_forward = function(distance)
    {
        distance = 0 - distance;
        this.move_backward(distance);
    }

    // Provides basic AABB collision detection for the camera with the outside
    //boundariew of the world.
    camera.check_bounds = function(movement)
    {
        var difference = 0;
        if( this.x + this.size + movement[0] > this.x_max )
        {
            // If the camera is "out-of-bounds," move it to the closest point
            //within the bounds of the world.  Replicated for each edge of the
            //world.
            difference = 
                (this.x + this.size + movement[0]) - this.x_max;
            movement[0] -= difference;
        }

        if( this.x - this.size + movement[0] < this.x_min )
        {
            difference = 
                (this.x - this.size + movement[0]) - this.x_min;
            movement[0] -= difference;
        }

        //There's an error in here that I'm not seeing
        if( this.z + this.size + movement[2] > this.z_max )
        {
            difference = 
                (this.z + this.size + movement[2]) - this.z_max;
            movement[2] -= difference;
        }

        if( this.z - this.size + movement[2] < this.z_min )
        {
            difference = 
                (this.z - this.size + movement[2]) - this.z_min;
            movement[2] -= difference;
        }
    }

    //Let the update_view() set the camera to appropriate initial values.
    camera.update_view();
    return camera;
}

/***
 * Returns a unit vector pointing in direction 'angle.'
 * @param The angle in degrees.
 * @param The plane to rotate in, should be a bitwise or
 *      of the I, J, K constants.
 */
function pol_to_cart( angle, plane )
{
    var sin = Math.sin( angle * (Math.PI / 180));
    var cos = Math.cos( angle * (Math.PI / 180));

    var output;

    switch( plane )
    {
        case I | J: // xy-plane (rotated about z-axis)
            output = new Float32Array([ sin, cos, 0.0 ]);
            break;
        case I | K: // xz-plane (rotated about y-axis)
            output = new Float32Array([ sin, 0.0, cos ]);
            break;
        case J | K: // yz-plane (rotated about x-axis)
            output = new Float32Array([ 0.0, cos, sin ]);
            break;
        default:
            throw "Invalid Plane for pol_to_cart().";
    }

    return output;
}
