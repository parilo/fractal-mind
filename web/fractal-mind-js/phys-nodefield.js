
function NodeField () {
    
    this.a = 1;
    this.b = 1;
    this.g = { x: 0, y: 0 }; // vector of constant field
    this.k = 0.1; // 0 < k < 1
    this.pow1 = 2; // - a/x^pow1 + b/x^pow2
    this.pow2 = 6;
    this.dtSim = 0.004; // 0.004 // dt used in simulation
    this.dtTimer = 1000; // in ms used in refresh rate of node positions
    
    this.mainNode = null;
    this.mainNodeCalcData = null;
    this.childNodesCalcData = [];
    this.childNodes = [];
    
}

NodeField.prototype.setMainNode = function (node) {
    this.mainNode = node;

    this.mainNodeCalcData = {
        coords: node.geomModel.getCoords(),
        r: node.geomModel.getRadius(),
        velocity: cloneObject(node.physModel.velocity),
        nodeModel: node
    };
};

NodeField.prototype.setChildenNodes = function (nodes) {
    this.childNodes = nodes;
    this.initChildenNodesCalcData();
};

NodeField.prototype.initChildenNodesCalcData = function () {
    this.childNodesCalcData = [];
    for(var i=0; i<this.childNodes.length; i++){
        this.childNodesCalcData.push({
            coords: this.childNodes[i].geomModel.getCoords(),
            r: /*this.childNodes[i].geomModel.getRadius()*/this.childNodes[i].getRadiusWithAllChildren(),
            velocity: cloneObject(this.childNodes[i].physModel.velocity),
            nodeModel: this.childNodes[i],
            attached: this.childNodes[i].attached
        });
    }
};

NodeField.prototype.getNewNodesCoords = function () {
    var nodesCoords = [];
    for(var i=0; i<this.childNodesCalcData.length; i++){
        nodesCoords.push({
            x: this.childNodesCalcData[i].coords.x,
            y: this.childNodesCalcData[i].coords.y
        });
    }
    return nodesCoords;
};

NodeField.prototype.runSimulationOnNodeSync = function (index) {
    
    for(var simi=0; simi<10000000; simi++){
        
        var diffCoords = this.stepSimulationOnNode(index);
        
        if( this.isNodeStationary(index, diffCoords) ){
            this.setNodeCoordsFromCalcData(index);
            return;
        }
        
        if( simi % 100000 == 0 || (simi-1) % 100000 == 0 ){
            this.setNodeCoordsFromCalcData(index);
        }
    }
    
};


NodeField.prototype.calcSimulationOnNode = function (index) {
    
    for(var simi=0; simi<10000000; simi++){
        
        var diffCoords = this.stepSimulationOnNode(index);
        
        if( this.isNodeStationary(index, diffCoords) ){
//            this.setNodeCoordsFromCalcData(index);
            return this.childNodesCalcData[index].coords;
        }
    }
    
};

NodeField.prototype.stepSimulationOnNode = function (index) {
    
    var nodeCalcData = this.childNodesCalcData[index];
    var oldx = nodeCalcData.coords.x;
    var oldy = nodeCalcData.coords.y;
    
    this.calcNewVelocitiesAndCoordsOfItem(index);
    
    var diffCoords = {
        dx: nodeCalcData.coords.x - oldx,
        dy: nodeCalcData.coords.y - oldy
    };
    
    return diffCoords;
};

NodeField.prototype.setNodeCoordsFromCalcData = function (index) {
    var nodeCalcData = this.childNodesCalcData[index];
    nodeCalcData.nodeModel.geomModel.setCoords(nodeCalcData.coords);
};

NodeField.prototype.isNodeStationary = function (index, diffCoords) {
    return Math.max(Math.abs(diffCoords.dx), Math.abs(diffCoords.dy))/this.dtSim < this.childNodesCalcData[index].r/1000;
}

NodeField.prototype.isAllNodeStationary = function (diff) {
    return diff < this.childNodesCalcData[0].r/1000;
}

NodeField.prototype.runSimulationAllChildNodes = function () {
    this.timerId = setInterval(function(field){
        field.stepSimulationWithModifyNodes();
    }, this.dtTimer, this);
};

//NodeField.prototype.stepSimulationWithModifyNodes = function () {
//    
//    for(var simi=0; simi<1000; simi++){
//        
//        var diff = 0;
//        
//        for(var i=0; i<this.childNodesCalcData.length; i++){
//            var diffCoords = this.stepSimulationOnNode(i);
//            diff += Math.max(Math.abs(diffCoords.dx), Math.abs(diffCoords.dy) );
//        }
//        
//        if( this.isAllNodeStationary(diff) ){
//            clearInterval(this.timerId);
//            break;
//        }
//        
//    }
//
//    for(var i=0; i<this.childNodesCalcData.length; i++){
//        this.setNodeCoordsFromCalcData(i);
//    }
//    
//}

NodeField.prototype.calcSimulationAllChildNodes = function (limit) {

//var ts1 = new Date().getTime();
    
    if( limit === undefined ) limit = 1000/*000*/;
    
    for(var simi=0; simi<limit; simi++){
        
        var diff = 0;
        
        for(var i=0; i<this.childNodesCalcData.length; i++){
            
            if( this.childNodesCalcData[i].attached ) continue;
                
            var diffCoords = this.stepSimulationOnNode(i);
            diff += Math.max(Math.abs(diffCoords.dx), Math.abs(diffCoords.dy) );
        }
        
        if( this.isAllNodeStationary(diff) ){
            break;
        }
        
    }
    
//var ts2 = new Date().getTime();   
//console.log('stationary', ts2-ts1, simi);
    
}

NodeField.prototype.calcNewVelocitiesAndCoordsOfItem = function (index) {
    
    var nodeCalcData = this.childNodesCalcData[index];
    
    var a = this.calcFc(index);
    
    // not used now
    //we change dtSim depending on forces acting on nodes
    //if forces is big we must decrease time step
    //and if forces is small we can increase time step

    var r = nodeCalcData.r;
    
//    var norma = FM.Math.norm(a);
//    var forceNorm = norma*this.dtSim*this.dtSim;
//    if( forceNorm > r*0.5 ){
//        this.dtSim /= 2;
//console.log('<', forceNorm, norma, this.dtSim);
//        this.calcNewVelocitiesAndCoordsOfItem(index);
//        this.dtSim *= 2;
//        return;
//    }

//    if( forceNorm < 0.0000001*r ){
//console.log('>', forceNorm, norma, this.dtSim);
//        this.dtSim *= 2;
//        this.calcNewVelocitiesAndCoordsOfItem(index);
//        return;
//    }
    
    var newvelocity = nodeCalcData.velocity;
    newvelocity.x = nodeCalcData.velocity.x*( 1 - this.k ) + a.x*this.dtSim;
    newvelocity.y = nodeCalcData.velocity.y*( 1 - this.k ) + a.y*this.dtSim;
    
    var modv = FM.Math.norm(newvelocity);
    
    if( modv > r ){
        newvelocity.x *= (r/modv);
        newvelocity.y *= (r/modv);
    }
    
    var nodecoords = nodeCalcData.coords;
    nodecoords.x += newvelocity.x * this.dtSim;
    nodecoords.y += newvelocity.y * this.dtSim;
    
};

// calculate force acting on child with given index
NodeField.prototype.calcFc = function (index) {
    
    var node = this.childNodesCalcData[index];
    var Fc = this.calcFnm(node, this.mainNodeCalcData);
    
    for(var i=0; i<this.childNodesCalcData.length; i++){
        if( i != index ){
            var Fcci = this.calcFn1n2(node, this.childNodesCalcData[i]);
            Fc.x += Fcci.x;
            Fc.y += Fcci.y;
        }
    }
    
    Fc.x += this.g.x*this.mainNodeCalcData.r;
    Fc.y += this.g.y*this.mainNodeCalcData.r;
    
    //dissipative force
    
    
    return Fc;
    
};

//calculate force acting on node1
//force is returned in forom of { x: fx, y: fy }
NodeField.prototype.calcFn1n2 = function (node1data, node2data) {
    
//    var node1coords = node1.geomModel.getCoords();
//    var node2coords = node2.geomModel.getCoords();
    var node1coords = node1data.coords;
    var node2coords = node2data.coords;
    var r1 = node1data.r;
    var r2 = node2data.r;
    
    var dr = {
        x: node2coords.x - node1coords.x,
        y: node2coords.y - node1coords.y
    }
    
    if( dr.x == 0 && dr.y == 0 ){
        return {
            x: 0,
            y: 0
        };
    }
    
    if( moddr > 1.2*r1 ){
        return {
            x: 0,
            y: 0
        };
    }
    
    var moddr2 = Math.pow(dr.x, 2) + Math.pow(dr.y, 2);
    var moddr = Math.pow(moddr2, 1/2);
    dr.x /= moddr;
    dr.y /= moddr;

    var r0 = r1*1.5 + r2; // force will tend to make distance between nodes == r0
//    var Uk = 1.5; // parameter defines form of energy (r)

    
//    var zeroTrans = 100; //translate energy to left in way it will no be inf in 0
//    moddr2 = Math.pow(moddr+zeroTrans, 2);
//    r0 += zeroTrans;
/*    
    var alpha = Math.pow(Uk*r0, 2)/(Math.pow(Uk, 4) - 1);
    var beta = Math.pow(Uk/r0, 2)/(Math.pow(Uk, 4) - 1);
    
//    var Ff = node1.geomModel.radius*node2.geomModel.radius*( + this.a/Math.pow(moddr2, this.pow1/2) - this.b/Math.pow(moddr2, this.pow2/2) );
    var Ff = - alpha/moddr2 + beta*moddr2;
*/

/*    
    var a = 1/2/r0/(Uk-1);
    var b = -1/(Uk-1);
    
    var Ff = 2*a*moddr+b;
*/
/*    
    var a = 1;
    var b = 1000000;
    
    var Ff = -4*a*(moddr-r0)^2/((moddr-r0)^2+b)^2;
*/  
/*    
    var Ff = (moddr-r0)>0?1:-1;
*/  
/*    
    Uk = 15;
    var a = sign(r0*(Uk-1))/Math.pow(Math.abs(r0*(Uk-1)), 1/2);
        
    var Ff = a*sign(moddr-r0)*Math.pow(Math.abs(moddr-r0), 1/2);
*/    

    var s2 = Math.pow(2,1/4);
    var Uk = r1/3;//width
    var Uh = r1*40000.5;//depth

    var b = (s2-1)/Uk;
    var c = s2 - b*r0;
    var br = Math.pow(b*r0+c, 4);
    var a = Uh/(-1/br + 1/br^2);

    var br2 = b*moddr+c;
    var Ff = 4*a*b*(1/Math.pow(br2, 5)-2/Math.pow(br2,9));
    
    var Fn1n2 = {
        x: dr.x*Ff,
        y: dr.y*Ff
    };
    
    return Fn1n2;
    
};

//function sign(x){
//    return x>0?1:-1;
//}


//calculate force acting on node1 by mainNode
//force is returned in forom of { x: fx, y: fy }
NodeField.prototype.calcFnm = function (node1data, node2data) {
    
//    var node1coords = node1.geomModel.getCoords();
//    var node2coords = node2.geomModel.getCoords();
    var node1coords = node1data.coords;
    var node2coords = node2data.coords;
    var r1 = node1data.r;
    var r2 = node2data.r;
    
    var dr = {
        x: node2coords.x - node1coords.x,
        y: node2coords.y - node1coords.y
    }
    
    if( dr.x == 0 && dr.y == 0 ){
        return {
            x: 0,
            y: 0
        };
    }
    
    var moddr2 = Math.pow(dr.x, 2) + Math.pow(dr.y, 2);
    var moddr = Math.pow(moddr2, 1/2);
    dr.x /= moddr;
    dr.y /= moddr;

    var r0 = r1*2 + r2; // force will tend to make distance between nodes == r0
//    var Uk = 1.001; // parameter defines form of energy (r)

/*    
    var zeroTrans = 100; //translate energy to left in way it will no be inf in 0
    
    moddr2 = Math.pow(moddr+zeroTrans, 2);
    r0 += zeroTrans;
    
    var alpha = Math.pow(Uk*r0, 2)/(Math.pow(Uk, 4) - 1);
    var beta = Math.pow(Uk/r0, 2)/(Math.pow(Uk, 4) - 1);
    
//    var Ff = node1.geomModel.radius*node2.geomModel.radius*( + this.a/Math.pow(moddr2, this.pow1/2) - this.b/Math.pow(moddr2, this.pow2/2) );
    var Ff = - alpha/moddr2 + beta*moddr2;
*/

/*    
    var a = 1/2/r0/(Uk-1);
    var b = -1/(Uk-1);
    
    var Ff = 2*a*moddr+b;
*/    
    
    
    var s2 = Math.pow(2,1/4);
    var Uk = r1/1.5;//width
    var Uh = r1*400000.5;//depth

    var b = (s2-1)/Uk;
    var c = s2 - b*r0;
    var br = Math.pow(b*r0+c, 4);
    var a = Uh/(-1/br + 1/br^2);

    var br2 = b*moddr+c;
    var Ff = 4*a*b*(1/Math.pow(br2, 5)-2/Math.pow(br2,9));
    
    
    var Fn1n2 = {
        x: dr.x*Ff,
        y: dr.y*Ff
    };
    
    return Fn1n2;
    
};
