function WorldModel() {
    this.rootNodes = [];
}

WorldModel.prototype.addRootNode = function(node) {
    this.rootNodes.push(node);
};





///
function WorldCtrl() {
    
    this.worldModel = null;
    this.worldView = new WorldView();
    
    this.worldView.nodeClicked(function(nodeView, me){
        me.nodeClicked(nodeView);
    }, this);
    
    this.worldView.nodeMoved(function(nodeView, event, me){
        me.nodeMoved(nodeView, event);
    }, this);
    
    this.worldView.nodeMoveEnded(function(nodeView, me){
        me.nodeMoveEnded(nodeView);
    }, this);
    
    this.worldView.nodeAddChild(FM.Funcs.bindMethod(this, 'nodeAddChild'));
    this.worldView.nodeRemove(FM.Funcs.bindMethod(this, 'nodeRemove'));
    
    this.physModel = new PhysicsModel();
    
}

WorldCtrl.prototype.showWorld = function(worldModel) {

    this.worldModel = worldModel;
    this.worldView.clear();
    this.worldView.drawNodes(this.worldModel.rootNodes);
    
};

WorldCtrl.prototype.nodeClicked = function (nodeView) {

//    this.worldView.centerCameraAtNode(nodeView);
    
//    var childNodesNewCoords = this.physModel.calcChildrenFieldOnNode(nodeView.nodeModel);
//    this.setNodesCoords(nodeView.nodeModel.getChildren(), childNodesNewCoords);
//        
//    this.worldView.drawChildNodes(nodeView);
    
};

WorldCtrl.prototype.nodeMoved = function (nodeView, event) {
    
    nodeView.getModel().moveWithAllChildren({
        x: event.realX,
        y: event.realY,
        dx: event.realDx,
        dy: event.realDy
    });
    
    var childNodesNewCoords = this.physModel.calcChildrenFieldOnChildNodeExcept(nodeView.nodeModel, [nodeView.nodeModel], 25);
    if( childNodesNewCoords.length > 0 ){
        FM.NodesTool.setNodesCoords(nodeView.nodeModel.parentNode.getChildren(), childNodesNewCoords);
    }
    
};

WorldCtrl.prototype.nodeMoveEnded = function (nodeView) {
    
    if( nodeView.nodeModel.parentNode == null ) return;
    
    var childNodesNewCoords = this.physModel.calcChildrenFieldOnNode(nodeView.nodeModel.parentNode);
    FM.NodesTool.flyNodesToNewCoords(nodeView.nodeModel.parentNode.getChildren(), childNodesNewCoords);
    
}

WorldCtrl.prototype.nodeAddChild = function (nodeView) {
    alert('add');
};

WorldCtrl.prototype.nodeRemove = function (nodeView) {
    alert('remove');
};





///
function WorldView() {
    this.worldModel = null;
    
    this.registerEvents(
        'nodeClicked',
        'nodeMoved',
        'nodeMoveEnded',
        'nodeAddChild',
        'nodeRemove'
    );
    
    this.worldPaintCtrl = new WorldPaintCtrl();
    this.camera = this.worldPaintCtrl.getCamera();
    
    this.worldPaintCtrl.pan(
        FM.Funcs.bind(
            function(event){
                var cameraModel = this.camera.getCameraModel();
                cameraModel.translateCamera({
                    x: -event.dx,
                    y: -event.dy
                });
                this.camera.moveTo(cameraModel);
            },
            this
        )
    );
    
    this.worldPaintCtrl.zoom(
        FM.Funcs.bind(
            function(event){

                var cameraModel = this.camera.getCameraModel();
                
                var z = (1+event.zoom*0.1);
                
                var tr = {
                    x: -event.pointerX,
                    y: -event.pointerY
                };
                
                cameraModel.translateCamera({
                    x: tr.x,
                    y: tr.y
                });
                
                cameraModel.zoomCamera(z);
                
                cameraModel.translateCamera({
                    x: -tr.x,
                    y: -tr.y
                });

                this.camera.moveTo(cameraModel);
            },
            this
        )
    );
    
    this.childNodeDrewHander = FM.Funcs.bind(
        function(event){
            this.initHandlersOnNodeView(event.nodeView);
        }, this);

    this.childNodeErasingHander = FM.Funcs.bind(
        function(event){
            this.deinitHandlersOnNodeView(event.nodeView);
        }, this);

    this.nodeViewClickHander = FM.Funcs.bind(
        function(event, nodeView){
            this.fire('nodeClicked', nodeView);
        }, this);

    this.nodeViewMovedHander = FM.Funcs.bind(
        function(event, nodeView){
            this.fire('nodeMoved', nodeView, event);
        }, this);

    this.nodeViewModeEndedHander = FM.Funcs.bind(
        function(nodeView){
            this.fire('nodeMoveEnded', nodeView);
        }, this);

    this.nodeViewAddChildHander = FM.Funcs.bind(
        function(nodeView){
            this.fire('nodeAddChild', nodeView);
        }, this);

    this.nodeViewRemoveHander = FM.Funcs.bind(
        function(nodeView){
            this.fire('nodeRemove', nodeView);
        }, this);
    
}

WorldView.prototype.clear = function () {
}

WorldView.prototype.drawNode = function (nodeModel) {
    var nv = new NodeView();
    nv.setModel(nodeModel);
    nodeModel.nodeView = nv;
    
    this.initHandlersOnNodeView(nv);
    
    nv.draw();
}

WorldView.prototype.drawNodes = function (nodeModels) {
    for(var i=0; i<nodeModels.length; i++){
        this.drawNode(nodeModels[i]);
    }
}

WorldView.prototype.initHandlersOnNodeView = function (nodeView) {
    
    nodeView.childNodeDrew(this.childNodeDrewHander);
    nodeView.childNodeErasing(this.childNodeErasingHander);
    nodeView.click(this.nodeViewClickHander);
    nodeView.move(this.nodeViewMovedHander);
    nodeView.moveend(this.nodeViewModeEndedHander);
    nodeView.addChild(this.nodeViewAddChildHander);
    nodeView.remove(this.nodeViewRemoveHander);
    
}

WorldView.prototype.deinitHandlersOnNodeView = function (nodeView) {
    
    nodeView.off('childNodeDrew', this.childNodeDrewHander);
    nodeView.off('childNodeErasing', this.childNodeErasingHander);
    nodeView.off('click', this.nodeViewClickHander);
    nodeView.off('move', this.nodeViewMovedHander);
    nodeView.off('moveend', this.nodeViewModeEndedHander);
    nodeView.off('addChild', this.nodeViewAddChildHander);
    nodeView.off('remove', this.nodeViewRemoveHander);
    
}

WorldView.prototype.centerCameraAtNode = function (nodeView) {
    var cameraModel = this.camera.getCameraModel();
    cameraModel.centerCameraAtNode(nodeView.nodeModel);
    this.camera.flyTo(cameraModel);
}

WorldView.prototype.getCamera = FM.Funcs.bindFieldMethod(WorldView.prototype, 'worldPaintCtrl', 'getCamera');

WorldView = FM.Funcs.mixIn(WorldView, FM.HandlersTool);
