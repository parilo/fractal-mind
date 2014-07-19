
///
function NodeView() {
    
    this.visible = false;
    
    this.paintCtrl = new NodePaintCtrl();
    this.nodeModel = new NodeModel();
    this.nodeCtrl = new NodeViewCtrl();
    
    this.registerEvents(
        'click',
        'move',
        'moveend',
        'detalizationLevelChanged',
        'nodeModelChanged',
        'visibilityChanged',
        'childNodeDrew',
        'childNodeErasing',
        'addChild',
        'remove'
    );
    
    this.nodeCoordsChangedHandler = FM.Funcs.bind(function (event) {

        this.paintCtrl.changeCoords(event);
        this.moveButton.moveOnDistance(event);
//        this.resizeButton.moveOnDistance(event);
//        this.attachButton.moveOnDistance(event);
        this.addButton.moveOnDistance(event);
        this.delButton.moveOnDistance(event);
        
    }, this);
    
    this.cameraChangeHandler = FM.Funcs.bind(function (event) {
        
        var ev = {
            oldDetailLevel: this.getDetalizationLevel(event.oldCameraModel.zoom),
            detailLevel: this.getDetalizationLevel(event.camera.cameraModel.zoom)
        };
        
        this.fire('detalizationLevelChanged', ev);
    }, this);

    this.paintCtrl.getCamera().move(this.cameraChangeHandler);
    this.paintCtrl.getCamera().fly(this.cameraChangeHandler);
 
    this.nodeCtrl.setNodeView(this);
}

/**
* returns int
* 0 - low detail
* 1 - medium detail
* 2 - max detail
*/
NodeView.prototype.getDetalizationLevel = function (zoom) {
    
    // calc current detalization level
    if (zoom === undefined) {
        return this.getDetalizationLevel(this.paintCtrl.getCamera().cameraModel.zoom);
    }
    
    var size = this.paintCtrl.getCanvasSize();
    var canvasLinearSize = Math.min(size.w, size.h);
    var viewLinearSize = 2 * this.nodeModel.geomModel.radius * zoom;
    
    if (viewLinearSize < canvasLinearSize/10) {
        return 1;
    } else if( viewLinearSize < canvasLinearSize/3 ){
        return 1;
    }
    
    return 2;
}

NodeView.prototype.getModel = function () {
    return this.nodeModel;
}

NodeView.prototype.setModel = function (nodeModel) {
    this.unsetHandlers();
    this.nodeModel = nodeModel;
    this.setHandlers();
    this.fire('nodeModelChanged', this);
}

NodeView.prototype.setHandlers = function () {
    this.nodeModel.geomModel.coordsChanged(this.nodeCoordsChangedHandler);
}

NodeView.prototype.unsetHandlers = function () {
    this.nodeModel.geomModel.off('coordsChanged', this.nodeCoordsChangedHandler);
}

NodeView.prototype.draw = function () {

    var nodeParams = {
        x: this.nodeModel.geomModel.coords.x,
        y: this.nodeModel.geomModel.coords.y,
        r: this.nodeModel.geomModel.radius,
        borderWidth: 5*this.nodeModel.geomModel.radius / 150,
        text: this.nodeModel.text,
        fontSize: 36*this.nodeModel.geomModel.radius / 150
    };
    
    this.paintCtrl.setCenter(nodeParams);
    this.paintCtrl.setRadius(nodeParams);
    
    this.paintCtrl.drawCircleBorder(nodeParams);
//    this.paintCtrl.drawTextAtCenter(nodeParams);
    this.paintCtrl.drawZoomInvariantText(nodeParams);

    this.paintCtrl.click(function(event, me){
        me.fire('click', event, me);
    }, this);
    

    
    var buttonParams = {
        angle: 20,
        r: this.nodeModel.geomModel.radius/10,
        distParam: 0.0,
        borderWidth: 3*this.nodeModel.geomModel.radius/150,
        text: 'M',
        fontSize: 144*this.nodeModel.geomModel.radius/1500
    };

    
    
    this.moveButton = new NodeMoveButton(buttonParams, nodeParams);
    
    this.moveButton.move(function (event, me){
        me.fire('move', event, me)
    }, this);
    
    this.moveButton.moveend(function (me){
        me.fire('moveend', me)
    }, this);

    
//    buttonParams.text = 'R';
//    buttonParams.angle = 35;
//    this.resizeButton = new Button(buttonParams, nodeParams);
//
//    buttonParams.text = 'A';
//    buttonParams.angle = 50;
//    this.attachButton = new Button(buttonParams, nodeParams);

    buttonParams.text = '+';
    buttonParams.angle = 160;
    this.addButton = new Button(buttonParams, nodeParams);
    
    this.addButton.click(function(event, me){
        me.fire('addChild', me);
    }, this);

    
    
    buttonParams.text = '-';
    buttonParams.angle = 145;
    this.delButton = new Button(buttonParams, nodeParams);

    this.delButton.click(function(event, me){
        me.fire('remove', me);
    }, this);
    
    

    this.setVisible(true);
    
};

NodeView.prototype.setVisible = function (visibility) {
    
    if( this.visible == visibility ) return;
    
    var ev = {
        oldVisibility: this.visible,
        newVisibility: visibility
    };
    
    this.visible = visibility;
    
    this.fire('visibilityChanged', ev);
}

NodeView.prototype.erase = function () {
    this.paintCtrl.erase();
    this.moveButton.erase();
//    this.resizeButton.erase();
//    this.attachButton.erase();
    this.addButton.erase();
    this.delButton.erase();
}

NodeView.prototype.isChildrenAreaVisible = function () {
    return this.hasOwnProperty('childrenArea');
}

NodeView.prototype.isChildrenVisible = function () {
    return this.hasOwnProperty('childrenViews');
}

NodeView.prototype.setChildrenAreaVisible = function (visible) {
    
    if( !visible && this.isChildrenAreaVisible() ){
        //hide
        
        this.paintCtrl.removeDrawing(this.childrenArea);
        delete this.childrenArea;
    }

    if( visible && !this.isChildrenAreaVisible() ){
        //show
        
        var p = {
            rInner: this.nodeModel.geomModel.radius,
            rOuter: this.nodeModel.getRadiusWithAllChildren(),
            x: this.nodeModel.geomModel.coords.x,
            y: this.nodeModel.geomModel.coords.y
        };

        this.childrenArea = this.paintCtrl.drawRing(p);
        
    }

}

NodeView.prototype.setChildrenVisible = function (visible) {
    
    if( !visible && this.isChildrenVisible() ){
        //hide
        
        for(var i=0; i<this.childrenViews.length; i++){
            this.fire('childNodeErasing', {nodeView: this.childrenViews[i]});
            this.childrenViews[i].erase();
        }
        delete this.childrenViews;
    }

    if( visible && !this.isChildrenVisible() ){
        //show
        this.childrenViews = [];
        
        var childNodeModels = this.nodeModel.getChildren();

        for(var i=0; i<childNodeModels.length; i++){
            var childNodeModel = childNodeModels[i];
            this.childrenViews.push(this.drawChildNode(childNodeModel));
        }
        
    }

}

NodeView.prototype.drawChildNode = function (nodeModel) {
    
    var nv = new NodeView();
    nodeModel.nodeView = nv;
    nv.setModel(nodeModel);
    
    nv.draw();
    
    this.fire('childNodeDrew', {nodeView: nv});

    return nv;
    
}

NodeView.prototype.flyToCoords = function (coords) {

    var coordsDiff = FM.Math.coordsDiff(coords, this.nodeModel.geomModel.getCoords());
    
    this.paintCtrl.flyCoords(coordsDiff);
    this.moveButton.flyCoords(coordsDiff);
//    this.resizeButton.flyCoords(coordsDiff);
//    this.attachButton.flyCoords(coordsDiff);
    this.addButton.flyCoords(coordsDiff);
    this.delButton.flyCoords(coordsDiff);
    
    this.nodeModel.setCoordsWithAllChildren(coords);
    
}

NodeView = FM.Funcs.mixIn(NodeView, FM.HandlersTool);
