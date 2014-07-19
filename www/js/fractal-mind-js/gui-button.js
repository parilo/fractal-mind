
///
function Button(buttonParams, nodeParams) {
    
    this.paintCtrl = new NodePaintCtrl();
    
    this.drawButton(buttonParams, nodeParams);
    
}

Button.prototype = {
    
    drawButton: function (buttonParams, nodeParams) {
    
        buttonParams.x = nodeParams.x;
        buttonParams.y = nodeParams.y - nodeParams.r - buttonParams.r*buttonParams.distParam;

        FM.Geom.rotateCoordsAroundPoint(buttonParams, nodeParams, buttonParams.angle );

        this.paintCtrl.drawCircleBorder(buttonParams);

        if( buttonParams.hasOwnProperty('text') ){
            this.paintCtrl.drawTextAtCenter(buttonParams);
        }
    
    }
    
};

Button.prototype.moveOnDistance = FM.Funcs.bindFieldMethod(Button.prototype, 'paintCtrl', 'changeCoords');
Button.prototype.flyCoords = FM.Funcs.bindFieldMethod(Button.prototype, 'paintCtrl', 'flyCoords');
Button.prototype.erase = FM.Funcs.bindFieldMethod(Button.prototype, 'paintCtrl', 'erase');
Button.prototype.click = FM.Funcs.bindFieldMethod(Button.prototype, 'paintCtrl', 'click');





function NodeMoveButton (buttonParams, nodeParams) {
    
    this.paintCtrl = new NodePaintCtrl();
    
    this.drawButton(buttonParams, nodeParams);

    this.registerEvents(
        'move',
        'moveend'
    );
    
    this.paintCtrl.mousedownmove(
        function(event, me){
            me.fire('move', event);
        },
        this
    );
    
    this.paintCtrl.mousedownmoveend(
        function(me){
            me.fire('moveend');
        },
        this
    )
    
}

FM.Funcs.extend(NodeMoveButton, Button);
NodeMoveButton = FM.Funcs.mixIn(NodeMoveButton, FM.HandlersTool);
