

/** Generates and returns the scene graph.
 * @param shape, The shape to use as the basis for all objects in the scene.
 * (This was an assignment requirement.)
 */
function get_scene(shape)
{
    var objects = world_obj(
            1, 1, 1,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            null,
            "root" );

    ///////////////////
    //  Make the cube.
    //  -- Note that the base cube is 1x1x1 with its origin centered.
    var cube = world_obj( 
                 2,   2,   2, //Scale.
                 0, 1/2,  10, //Origin.
                10,   0,  10, //Initial translation.
                 0,   0,   0, //Initial rotation about the local origin.
                shape,        //The actual shape data.
                "cube" );     //A unique id or name for this piece of this shape.
    
    ///////////////////
    // Make the table.
    //   location is randomized...
    var table = world_obj(
            1,   1,   1,
            0,   1/2, 0, //Set origin to bottom of the feet of table.
            Math.random() * 50,   0, Math.random() * 50,
            0,   (Math.random() * 360), 0,
            null,
            "table" );

    var leg1 = world_obj(
            1/8,   1,    1/8,
            0,     0,    0,
            31/64, 0,    31/64,
            0,     270,  0,
            shape,
            "leg_1"
            );
    var leg2 = world_obj(
            1/8,    1,   1/8,
            0,      0,   0,
            -31/64, 0,   31/64,
            0,      180, 0,
            shape,
            "leg_2"
            );
    var leg3 = world_obj(
            1/8,    1,  1/8,
            0,      0,  0,
            -31/64, 0, -31/64,
            0,      90, 0,
            shape,
            "leg_3"
            );
    var leg4 = world_obj(
            1/8, 1,  1/8,
            0, 0,  0,
            31/64, 0, -31/64,
            0,     0,  0,
            shape,
            "leg_4"
            );
    var top_ = world_obj(
            9/8, 1/32, 9/8,
            0, -1/2,   0,
            0, 1/2,   0,
            180,      0,   0,
            shape,
            "top"
            );
    leg1.set_parent( table );
    leg2.set_parent( table );
    leg3.set_parent( table );
    leg4.set_parent( table );
    top_.set_parent( table );

    ///////////////////
    // Make the windmill.
    var windmill = world_obj(
            1/32, 1/2, 1/32,
            0,    25/16,    0,
            0,     0,    0,
            0,        0,    0,
            shape,
            "windmill"
            );

    var blades = world_obj(
            32, 2, 32, //Compensate for the base's scaling.
            0, 0, 3/64,
            0, 1/2, 0,
            0, 0, 0,
            null,
            "blades"
            );

    var blades_ = [];
    //Get the number of fan blades from the user.
    var b_qty = Math.floor(Number(window.prompt(
                "Number of blades?\n" +
                "  Less than 30 is recommended.\n"+
                "  Press [?]/[/] for command listing.", "5")));
    if( !b_qty || b_qty == 0 )
        b_qty = 1 + Math.floor( Math.random() * 20 );
    for( var ii = 0; ii < 360; ii += (360 / b_qty) )
        blades_.push( world_obj(
                    1/16, 5/16, 1/64,
                    0,    5/8,  0,
                    0,    0,    0,
                    7.5,  210,  ii,
                    shape,
                    "blade_" + ii
                    ));    
    for( var i = 0; i < blades_.length; i++ ) 
        blades_[i].set_parent(blades);

    blades.set_parent(windmill);
    windmill.set_parent( table );
    table.set_parent( objects );
    cube.set_parent( objects );

    return objects;
}


/** Creates a single node of the scene graph.
 */
function world_obj( 
        xs, ys, zs, //Scale.
        xo, yo, zo, //Origin.
        xp, yp, zp, //Initial translation.
        xr, yr, zr, //Initial rotation about the local origin.
        verts,      //The actual shape data.
        id )        //A unique id or name for this piece of this shape.
{
    var obj = 
    {
        name:           id,
        pos:            new Matrix4,
        scl:            new Matrix4,
        rot:            new Matrix4, //Rotation about the "global" basis.
        local_rot:      new Matrix4, //Rotation about local basis.
        origin:         new Matrix4, //The local origin
        world_matrix:   new Matrix4,
        local_matrix:   new Matrix4,
        shape:          verts,
        parent_:        null,
        dirty:          true, // dirty bit
        children:       [],
        /** Wraps the rotate methods of the Matrix4 class and forces them to
         * update in the proper order so that each rotation is independant of
         * the orientation of the basis resulting from the previous rotation.
         * @param Each is a rotation about the corresponding axis.
         */
        rotate:         function(x, y, z) {
            var pitch = new Matrix4;
            var roll  = new Matrix4;
            var yaw   = new Matrix4;

            if( z != 0 )
            {
                //this.local_matrix.rotate( z % 360, 0, 0, 1 );
                roll.setRotate( z % 360, 0, 0, 1 );
                this.rot.concat( roll );
            }
            if( x != 0 )
            {
                pitch.setRotate( x % 360, 1, 0, 0 );
                this.rot.concat( pitch );
            }
            if( y != 0 )
            {
                //this.local_matrix.rotate( y % 360, 0, 1, 0 );
                yaw.setRotate( y % 360, 0, 1, 0 );
                this.rot.concat( yaw );
            }
            this.set_dirty();
        },
        /** Translates the local translation matrix.
         */
        translate:      function( x, y, z )
        {
            this.pos.translate( x, y, z );
            this.set_dirty();
        },
        /// Scale.
        scale:          function( x, y, z )
        {
            this.scl.scale( x, y, z );
            this.set_dirty();
        },
        /** Walks the tree in a depth-first search and updates a node and its
         * subtree iff the dirty bit is set.
         * @param dirty, The dirty bit being passed in from the parent.
         */
        update_world:   function(dirty, p_world)
        {
            dirty |= this.dirty;
            if( dirty ) // Only update if something has changed.
            { 
                this.local_matrix.concat( this.pos );
                this.local_matrix.concat( this.local_rot );
                this.local_matrix.concat( this.scl );
                this.local_matrix.concat( this.rot );
                this.local_matrix.concat( this.origin );
                if(p_world)
                {
                    this.local_matrix.set( this.pos );
                    this.local_matrix.concat( this.local_rot );
                    this.local_matrix.concat( this.scl );
                    this.local_matrix.concat( this.rot );
                    this.local_matrix.concat( this.origin );


                    this.world_matrix.set( p_world );
                    this.world_matrix.concat( this.local_matrix );
                }
                else
                    this.world_matrix.set( this.local_matrix );
            }

            /// Recursively update all children in graph.
            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].update_world( dirty, this.world_matrix );

            this.dirty = false;
        },
        ///Sets the current node's parent to par.
        set_parent:     function(par)
        {
            par.children.push(this);
            this.parent_ = par;
            this.set_dirty();

            return true;
        },
        /** Walks the tree in depth-first order and renders each object as
         *necessary.
         * @param gl, The monolithic WebGL object.
         * @param view,  The view matrix to render to.
         * @param proj,  The projection matrix.
         * @param wf, Whether or not the shape should be drawn as a wireframe.
         */
        render:         function( gl, view, proj, wf )
        {
            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].render(gl, view, proj, wf );

            if( this.shape )
            {
                this.shape.render( gl, this.world_matrix, view, proj, wf );
            }
        },
        /** Gets a reference to a specific entry in the tree using the name of
         * the desired object.
         * @param id, The name or unique id of the object to be searched for.
         */
        get_object:     function( id )
        {
            if( this.name == id )
                return this;

            var obj;
            var found = false;
            for( var ii = 0; !found && (ii < this.children.length); ii++ )
            {
                obj = this.children[ii].get_object( id );
                if( obj )
                    found = true;
            }
            return obj;
        },
        /** Sets the dirty bit of the gocal direction matrix and its entire
         * subtree.
         */
        set_dirty: function()
        {
            this.dirty = true;

            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].set_dirty();
        }
    };

    obj.translate( xp, yp, zp );
    obj.scale(     xs, ys, zs );
    obj.rotate(    xr, yr, zr );
    obj.local_rot.set( obj.rot );
    obj.rot.setIdentity();
    obj.origin.setTranslate( xo, yo, zo );

    return obj;
}


/** Wrapper needed for the initial version of the get_object() methode  This is
 * no longer needed by the current vesrion of thia object but left here to make
 * existing code to work as-is without needing to change code elsewhere.
 *
 * I should remove this.
 */
function search_graph( id, graph )
{
    /*
       var obj;
       var found = false;

       for( var ii = 0; !found && ii < graph.length; ii++ )
       {
       obj = graph[ii].get_object(id);
       if( obj )
       found = true;
       }

       return obj;
       */
    return graph.get_object(id);
}
