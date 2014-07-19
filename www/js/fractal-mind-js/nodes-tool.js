
FM.NodesTool = {};

FM.NodesTool.setNodesCoords = function (nodes, nodesNewCoords) {
    for(var i=0; i<nodes.length; i++){
        
        var oldCoords = nodes[i].geomModel.getCoords();

        var p = FM.Math.coordsDiff(nodesNewCoords[i], oldCoords);
        
        nodes[i].moveWithAllChildren(p);
    }
};

FM.NodesTool.flyNodesToNewCoords = function (nodes, nodesNewCoords) {
    for(var i=0; i<nodes.length; i++){
        nodes[i].nodeView.flyToCoords(nodesNewCoords[i]);
    }
};
