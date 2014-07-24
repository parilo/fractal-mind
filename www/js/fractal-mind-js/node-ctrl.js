function NodeViewCtrl () {
    
    this.nodeView = null;
    
    this.nodeViewDetalizationLevelChangedHandler = FM.Funcs.bind(function(event){
        if( this.nodeView.visible &&
            ( event.oldDetailLevel != event.detailLevel )
        ){
            this.changeDetailLevelLazy(event.oldDetailLevel, event.detailLevel);
        }
    }, this);

    this.nodeModelChangedHandler = FM.Funcs.bind(function(event){
        if( this.nodeView.visible ){
            this.refreshView();
        }
    }, this);
    
    this.changeDetailLevelLazy = FM.Funcs.bindLazy( function () {
        this.changeDetailLevel.apply(this, arguments);
    }, this, 100);

};

NodeViewCtrl.prototype.setNodeView = function (nodeView) {
    this.nodeView = nodeView;
    this.init();
}

NodeViewCtrl.prototype.init = function () {
    this.nodeView.detalizationLevelChanged(this.nodeViewDetalizationLevelChangedHandler);
    this.nodeView.nodeModelChanged(this.nodeModelChangedHandler);
    this.nodeView.visibilityChanged(this.nodeModelChangedHandler);
}

NodeViewCtrl.prototype.changeDetailLevel = function (oldDetailLevel, newDetailLevel) {

    if( oldDetailLevel == newDetailLevel ) return;

    if( oldDetailLevel == 2 ){
        this.nodeView.setChildrenVisible(false);
    }

    if( oldDetailLevel == 1 ){
        this.nodeView.setChildrenAreaVisible(false);
    }

//    if( oldDetailLevel == 0 ){
//    }
//    
//    if( newDetailLevel == 0 ){
//    }
    
    if( newDetailLevel == 1 ){
        this.nodeView.setChildrenAreaVisible(true);
    }
    
    if( newDetailLevel == 2 ){
        this.nodeView.setChildrenVisible(true);
    }
    
}

NodeViewCtrl.prototype.refreshView = function () {
    var l = this.nodeView.getDetalizationLevel();
    this.changeDetailLevel(l, -1);
    this.changeDetailLevel(-1, l);
}
