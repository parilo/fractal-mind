FM.Geom = {
    
    getRadians: function (angleInDeg) {
        return Math.PI*angleInDeg/180;
    },
    
    rotateCoordsAroundPoint: function (coords, point, angle) {
        
        angle = FM.Geom.getRadians(angle);
        
        var sina = Math.sin(angle);
        var cosa = Math.cos(angle);
            
        var x = ( coords.x - point.x );
        var y = ( coords.y - point.y );

        coords.x = point.x + x*cosa - y*sina;
        coords.y = point.y + x*sina + y*cosa;
        
    }
    
};



FM.Geom.GeomTransformation = function () {
};

FM.Geom.GeomTransformation.prototype.after = function (trans) {
    return new FM.Geom.Composite(this, trans);
};



//translation
FM.Geom.T = function (dx, dy) {
    this.dx = dx;
    this.dy = dy;
};

FM.Funcs.extend(FM.Geom.T, FM.Geom.GeomTransformation);

FM.Geom.T.prototype.transform = function (coords) {
    return {
        x: coords.x + this.dx,
        y: coords.y + this.dy,
        r: coords.r
    }
};



//scale
FM.Geom.S = function (k) {
    this.k = k;
};

FM.Funcs.extend(FM.Geom.S, FM.Geom.GeomTransformation);

FM.Geom.S.prototype.transform = function (coords) {
    return {
        x: coords.x*this.k,
        y: coords.y*this.k,
        r: coords.r*this.k
    }
};



FM.Geom.Composite = function () {
    this.transformations = Array.prototype.slice.call(arguments);
};

FM.Funcs.extend(FM.Geom.Composite, FM.Geom.GeomTransformation);

FM.Geom.Composite.prototype.transform = function (coords) {
    for(var i=0; i<this.transformations.length; i++){
        coords = this.transformations[i].transform(coords);
    }
    return coords;
};
