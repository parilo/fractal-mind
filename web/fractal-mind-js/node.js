
function NodeModel() {
    
    this.childRadiusCoeff = 1.0/4;
    
    this.text = "node text";
    
    this.parentNode = null;
    this.childNodes = [];
    
    this.geomModel = new NodeGeomModel();
    this.physModel = new NodePhysModel();
    this.physModel.setNodeModel(this);
    
    this.attached = false;
}

NodeModel.prototype.addChildNode = function (node) {
    node.parentNode = this;
    this.childNodes.push(node);
    node.setRadiusWithAllChildren(this.geomModel.radius*this.childRadiusCoeff);
    
    this.physModel.runPhysicsOnChildren();
};

NodeModel.prototype.getChildren = function () {
    return this.childNodes;
};

NodeModel.prototype.setCoordsWithAllChildren = function (params) {
    var oldCoords = this.geomModel.getCoords();
    var p = {
        dx: params.x - oldCoords.x,
        dy: params.y - oldCoords.y
    };
    
    this.moveWithAllChildren(p);
}

NodeModel.prototype.moveWithAllChildren = function (params) {

    var trans = new FM.Geom.T(params.dx, params.dy);
    this.geomTransformWithAllChildren(trans);
    
}

NodeModel.prototype.setRadiusWithAllChildren = function (r) {
    
    var trans = new FM.Geom.T(-this.geomModel.coords.x, -this.geomModel.coords.y);
    trans = trans.after(new FM.Geom.S(r/this.geomModel.radius));
    trans = trans.after(new FM.Geom.T(this.geomModel.coords.x, this.geomModel.coords.y));
        
    this.geomTransformWithAllChildren(trans);
    
}

NodeModel.prototype.geomTransformWithAllChildren = function (trans) {

    var params = this.geomModel.getCoords();
    params.r = this.geomModel.radius;
    
    params = trans.transform(params);
    
    this.geomModel.setCoords(params);
    this.geomModel.setRadius(params.r);
    
    var childNodes = this.getChildren();
    
    for(var i=0; i<childNodes.length; i++){
        childNodes[i].geomTransformWithAllChildren(trans);
    }
    
}

NodeModel.prototype.getRadiusWithAllChildren = function () {
    
    if( this.childNodes.length == 0 ) return this.geomModel.radius;
    
    var myCoords = this.geomModel.getCoords();
        
    var radiuses = [];
    
    var childNodes = this.getChildren();
    
    for(var i=0; i<childNodes.length; i++){
        var childNode = childNodes[i];
        var chCoords = childNode.geomModel.getCoords();
        radiuses.push(FM.Math.norm({
            x: chCoords.x - myCoords.x,
            y: chCoords.y - myCoords.y
        }) + childNode.getRadiusWithAllChildren());
    }
    
    return Math.max.apply(Math, radiuses);
    
}


///
function NodePhysModel () {
    this.velocity = { x: 0, y: 0 };
}

NodePhysModel.prototype.setNodeModel = function (nodeModel) {
    this.nodeModel = nodeModel;
}

NodePhysModel.prototype.runPhysicsOnChildren = function () {

    var physModel = new PhysicsModel();

//var ts1 = new Date().getTime();
    var childNodesNewCoords = physModel.calcChildrenFieldOnNode(this.nodeModel);
//console.log(childNodesNewCoords);    
    FM.NodesTool.setNodesCoords(this.nodeModel.getChildren(), childNodesNewCoords);
//var ts2 = new Date().getTime();
//console.log('runPhysicsOnChildren', ts2-ts1);
    
};





///
function NodeGeomModel () {
    
    this.registerEvents('coordsChanged');
    
    this.coords = { x: 0, y: 0 };
    
    this.radius = 150;

}

NodeGeomModel.prototype = {

    setCoords: function (coords, quiet) {
        
        var ev = {
            x: coords.x,
            y: coords.y,
            dx: coords.x - this.coords.x,
            dy: coords.y - this.coords.y,
            geomModel: this
        };
        
        this.coords.x = coords.x;
        this.coords.y = coords.y;
        
        if( quiet === true ){
            return ev;
        }
        
        this.fire('coordsChanged', ev);
        
        return ev;
    },

    getCoords: function () {
        return {
            x: this.coords.x,
            y: this.coords.y
        };
    },
    
    getRadius: function () {
        return this.radius;
    },
    
    setRadius: function (r) {
        this.radius = r;
    }

};

NodeGeomModel = FM.Funcs.mixIn(NodeGeomModel, FM.HandlersTool);
