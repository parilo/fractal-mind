
function PhysicsModel () {
}

PhysicsModel.prototype = {
    
    isCoordsInitedInNode: function (nodeModel) {
        return nodeModel.geomModel.hasOwnProperty('nodeFieldCoordsSet');
    },
    
    
    
    setCoordsInitedInNode: function (nodeModel) {
        nodeModel.geomModel.nodeFieldCoordsSet = true;
    },
    
    
    
    initCoordsOfNode: function (nodeModel, previousNodes, parentNode) {
        
        var pR = parentNode.geomModel.radius;
        var nR = nodeModel.geomModel.radius;
        var coords;
        
        if( previousNodes.length > 0 ){
            
            // rotating around paren node and shifting radial from parent node to r*1.5 distance
            
            var prevNode = previousNodes[previousNodes.length-1];
            
            var sina = nR*1.5/(pR + nR*1.5)
            var cosa = Math.sqrt(1-Math.pow(sina, 2));
            var px = prevNode.geomModel.coords.x - parentNode.geomModel.coords.x; //vector: parentNode -> prevNode
            var py = prevNode.geomModel.coords.y - parentNode.geomModel.coords.y;
            var nx = px*cosa + py*sina; // vector: parentNode -> node
            var ny = - px*sina + py*cosa;
            var modn = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
            
//            nodeModel.geomModel.setCoords({
//                x: parentNode.geomModel.coords.x + nx + nx*1.5*nR/modn,
//                y: parentNode.geomModel.coords.y + ny + ny*1.5*nR/modn
//            });

            coords = {
                x: parentNode.geomModel.coords.x + nx + nx*1.5*nR/modn,
                y: parentNode.geomModel.coords.y + ny + ny*1.5*nR/modn
            };

        } else {
            
//            nodeModel.geomModel.setCoords({
//                x: parentNode.geomModel.coords.x + pR + nR*1.5,
//                y: parentNode.geomModel.coords.y + pR + nR*1.5
//            });

            coords = {
                x: parentNode.geomModel.coords.x + pR + nR*1.5,
                y: parentNode.geomModel.coords.y + pR + nR*1.5
            };
            
        }
        
        nodeModel.setCoordsWithAllChildren(coords);
    },
    
    
    
    runChildrenFieldOnNode: function (nodeModel) {
        
        //calc first approximation
        this.calcFirstApproximationOnNode(nodeModel);
        // simulating new children all togeather
        var nodeField = new NodeField();
        nodeField.setMainNode(nodeModel);
        nodeField.setChildenNodes(nodeModel.getChildren());
        nodeField.runSimulationAllChildNodes();

    },
    
    calcFirstApproximationOnNode: function (nodeModel) {

        // idea of initialization children nodes coords
        // by field is following:
        // 1. place not inited node at bottom and right position of previous
        //      child node
        // 2. simulate new node movement while all other nodes are not moving
        // 3. place second new node and simulate it movement while all other are not moving
        // 4. simulate all other new nodes in that way
        // 5. simulate all child nodes
        
        var nodeField = new NodeField();
        nodeField.setMainNode(nodeModel);

        var children = nodeModel.getChildren();
        var initedChildren = [];
        
        // simulating new children by one
        for(var i=0; i<children.length; i++){
            var childNode = children[i];
            if( !this.isCoordsInitedInNode(childNode) ){
                
                this.initCoordsOfNode(childNode, initedChildren, nodeModel);
                initedChildren.push(childNode);
                nodeField.setChildenNodes(initedChildren);
                var coords = nodeField.calcSimulationOnNode(initedChildren.length-1);
                childNode.setCoordsWithAllChildren(coords);
                this.setCoordsInitedInNode(childNode);
    
            } else {
                initedChildren.push(childNode);
            }
            
        }
        
    },

    calcChildrenFieldOnNode: function (nodeModel, iterationsLimit) {
        
        if( nodeModel.getChildren().length == 0 ){
            return [];
        }
        
        //calc first approximation
        this.calcFirstApproximationOnNode(nodeModel);
        // simulating new children all togeather
        
        var nodeField = new NodeField();
        
        nodeField.setMainNode(nodeModel);
        nodeField.setChildenNodes(nodeModel.getChildren());
        
        nodeField.calcSimulationAllChildNodes(iterationsLimit);
        var nodesNewCoords = nodeField.getNewNodesCoords();
        this.rotateNodesNewCoordsToVertical(nodesNewCoords, nodeModel.geomModel.coords);
        
        return nodesNewCoords;

    },

    calcChildrenFieldOnChildNodeExcept: function (nodeModel, exceptNodeModels, iterationsLimit) {

        var parentNode = nodeModel.parentNode;
        if( parentNode == null ) return [];
        
        //we disable force on except node models by attaching
        //it while simulation
        
        var storedAttached = [];
        for(var i=0; i<exceptNodeModels.length; i++){
            storedAttached.push(exceptNodeModels[i].attached);
            exceptNodeModels[i].attached = true;
        }

        var nodeField = new NodeField();
        nodeField.setMainNode(parentNode);
        nodeField.setChildenNodes(parentNode.getChildren());
        nodeField.calcSimulationAllChildNodes(iterationsLimit);
        var nodesNewCoords = nodeField.getNewNodesCoords();
            
        for(var i=0; i<exceptNodeModels.length; i++){
            exceptNodeModels[i].attached = storedAttached[i];
        }
        
        return nodesNewCoords;
        
    },
    
//    rotateChildrenToVertical: function (nodeModel) {
//        
//        //calculate average point
//        var avg = {
//            x: 0,
//            y: 0
//        };
//        
//        var parentCoords = nodeModel.geomModel.coords;
//        var childNodes = nodeModel.childNodes;
//        
//        for(var i=0; i<childNodes.length; i++){
//            var childNode = childNodes[i];
//            avg.x += ( childNode.geomModel.coords.x - parentCoords.x );
//            avg.y += ( childNode.geomModel.coords.y - parentCoords.y );
//        }
//        
//        avg.x /= childNodes.length;
//        avg.y /= childNodes.length;
//        
//        //calculate average point angle
//        modavg = Math.sqrt(Math.pow(avg.x, 2) + Math.pow(avg.y, 2));
//        var sina = avg.x/modavg;
//        var cosa = avg.y/modavg;
//        
//        //rotate all child nodes -angle
//        for(var i=0; i<childNodes.length; i++){
//            
//            var childNode = childNodes[i];
//            
//            var nx = ( childNode.geomModel.coords.x - parentCoords.x );
//            var ny = ( childNode.geomModel.coords.y - parentCoords.y );
//            
////            childNode.geomModel.setCoords({
////                x: parentCoords.x + nx*cosa - ny*sina,
////                y: parentCoords.y + nx*sina + ny*cosa
////            });
//            
//            var coords = {
//                x: parentCoords.x + nx*cosa - ny*sina,
//                y: parentCoords.y + nx*sina + ny*cosa
//            };
//            
//            childNode.setCoordsWithAllChildren(coords);
//
//        }
//        
//    },
    
    rotateNodesNewCoordsToVertical: function (nodesNewCoords, parentCoords) {
        
        //calculate average point
        var avg = {
            x: 0,
            y: 0
        };
        
//        var parentCoords = nodeModel.geomModel.coords;
//        var childNodes = nodeModel.childNodes;
        
        for(var i=0; i<nodesNewCoords.length; i++){
            var nodeNewCoords = nodesNewCoords[i];
            avg.x += ( nodeNewCoords.x - parentCoords.x );
            avg.y += ( nodeNewCoords.y - parentCoords.y );
        }
        
        avg.x /= nodesNewCoords.length;
        avg.y /= nodesNewCoords.length;
        
        //calculate average point angle
        modavg = Math.sqrt(Math.pow(avg.x, 2) + Math.pow(avg.y, 2));
        var sina = avg.x/modavg;
        var cosa = avg.y/modavg;
        
        //rotate all child nodes -angle
        for(var i=0; i<nodesNewCoords.length; i++){
            
            var nodeNewCoords = nodesNewCoords[i];
            
            var nx = ( nodeNewCoords.x - parentCoords.x );
            var ny = ( nodeNewCoords.y - parentCoords.y );
            
            nodeNewCoords.x = parentCoords.x + nx*cosa - ny*sina;
            nodeNewCoords.y = parentCoords.y + nx*sina + ny*cosa;
        }
        
    }

};
