function WorldPaintCtrl() {
    this.paintDriver = FractalMind.paintDriverFactory.getScreenDriver();
}

WorldPaintCtrl.prototype.getCamera = FM.Funcs.bindFieldMethod(WorldPaintCtrl.prototype, 'paintDriver', 'getCamera');

WorldPaintCtrl.prototype.pan = FM.Funcs.bindFieldMethod(WorldPaintCtrl.prototype, 'paintDriver', 'pan');
WorldPaintCtrl.prototype.zoom = FM.Funcs.bindFieldMethod(WorldPaintCtrl.prototype, 'paintDriver', 'zoom');
WorldPaintCtrl.prototype.on = FM.Funcs.bindFieldMethod(WorldPaintCtrl.prototype, 'paintDriver', 'on');
WorldPaintCtrl.prototype.off = FM.Funcs.bindFieldMethod(WorldPaintCtrl.prototype, 'paintDriver', 'off');





///
function NodePaintCtrl() {

    this.paintDriver = FractalMind.paintDriverFactory.getObjectDriver();
    
    this.mouseIsDown = false;
    
    this.handlersTool = new FM.HandlersTool();
    this.handlersTool.registerEvents(
        'mousedown',
        'mouseup',
        'mousemove',
        'mousedownmove',
        'mousedownmoveend',
        'mouseleave'
    );

    this.mouseDownMoveHandler = FM.Funcs.bind(
        function (event){

            //if user mouseup outside we need to do mouseup
            if( event.which == 0 ){
                this.mouseupHandler.apply(this, event);
                return;
            }
            
            var coords = this.paintDriver.getPaintObjectCoordsFromMouseEventsCoords({
                x: event.clientX,
                y: event.clientY
            });
            
            var ev = {
                x: coords.x,
                y: coords.y,
                dx: coords.x - this.previousMouseCoords.x,
                dy: coords.y - this.previousMouseCoords.y
            };
            
            this.previousMouseCoords.x = ev.x;
            this.previousMouseCoords.y = ev.y;
            
            this.addRealCoords(ev);

            this.handlersTool.fire('mousedownmove', ev);
            
            event.stopImmediatePropagation();
            event.preventDefault();
        },
        this
    );
    
    this.mousedownHandler = FM.Funcs.bind(
        function(event){

            this.mouseIsDown = true;

            this.previousMouseCoords = this.paintDriver.getPaintObjectCoordsFromMouseEventsCoords({
                x: event.clientX,
                y: event.clientY
            });
            
            if( this.handlersTool.countHandlers('mousedownmove') > 0 ){
                
                this.paintDriver.globalon('mousemove', this.mouseDownMoveHandler);
                
                // need to prevent pan mousedown
                event.stopImmediatePropagation();
                event.preventDefault();
            }
            
            this.handlersTool.fire('mousedown', event);

        },
        this
    );
    
    this.mouseupHandler = FM.Funcs.bind(
        function(event){

            this.mouseIsDown = false;
            
            if( this.handlersTool.countHandlers('mousedownmove') > 0 ){
                this.paintDriver.globaloff('mousemove', this.mouseDownMoveHandler);
                this.handlersTool.fire('mousedownmoveend');
            }
            
            this.handlersTool.fire('mouseup', event);

        },
        this
    );
    
    this.mousemoveHandler = FM.Funcs.bind(
        function(event){
            this.handlersTool.fire('mousemove', event);
        },
        this
    );
    
    this.mouseleaveHandler = FM.Funcs.bind(
        function(event){
            this.handlersTool.fire('mouseleave', event);
        },
        this
    );
    
    this.emptyHandler = function(){};
    
//    this.zoomChangeHandler = FM.Funcs.bind(
//        function(event){
//    
//            if( this.hasOwnProperty('nodeZoomInvariantText') ){
//                
////                this.paintDriver.changeFontSize(this.nodeZoomInvariantTextDrawing, {
////                    fontSize: this.getZoomInvariantTextHeight()
////                });
//                
//                this.redrawZoomInvariantTextLazy();
//                
//            }
//    
//        },
//        this
//    );

    this.cameraChangeHandler = FM.Funcs.bind(
        function(event){
    
            if(
                this.hasOwnProperty('nodeZoomInvariantText') &&
                event.oldCameraModel.zoom != event.camera.cameraModel.zoom
            ){
                this.redrawZoomInvariantTextLazy();
            }
    
        },
        this
    );
    
    this.center = { x: 0, y: 0 };
    this.radius = 0;
    
}

NodePaintCtrl.prototype.addRealCoords = function (screenCoords) {
    
    var camera = this.paintDriver.getCamera().cameraModel;
    
    screenCoords.realX = ( screenCoords.x - camera.centerAt.x ) / camera.zoom;
    screenCoords.realY = ( screenCoords.y - camera.centerAt.y ) / camera.zoom;
    
    screenCoords.realDx = screenCoords.dx / camera.zoom;
    screenCoords.realDy = screenCoords.dy / camera.zoom;
}

NodePaintCtrl.prototype.drawCircleBorder = function (p) {
    this.paintDriver.drawCircle(p);
};

NodePaintCtrl.prototype.drawTextAtCenter = function (p) {
    this.paintDriver.drawText(p);
};

/**
*   p.rInner
*   p.rOuter
*   p.x
*   p.y
*/
NodePaintCtrl.prototype.drawRing = function (p) {

    var c = {
        r: (p.rInner+p.rOuter)/2,
        x: p.x,
        y: p.y,
        borderWidth: p.rOuter - p.rInner,
        borderColor: 'def',
        fillOpacity: 0.0
    };
    
    return this.paintDriver.drawCircleAnimateAppear(c);
};



// zoom invariant text
NodePaintCtrl.prototype.drawZoomInvariantText = function (p) {
    
    this.nodeZoomInvariantText = {
        text: p.text
    };
    
    this.redrawZoomInvariantText();
    
//    this.paintDriver.zoom(this.zoomChangeHandler);
    this.paintDriver.getCamera().move(this.cameraChangeHandler);
    this.paintDriver.getCamera().fly(this.cameraChangeHandler);
    
};

NodePaintCtrl.prototype.redrawZoomInvariantTextLazy = function () {
    
    if( this.hasOwnProperty('redrawZoomInvariantTextLazyTimer') ){
        clearTimeout(this.redrawZoomInvariantTextLazyTimer);
    }
    
    this.redrawZoomInvariantTextLazyTimer = setTimeout(FM.Funcs.bind(function(){
        this.redrawZoomInvariantText();
        delete this.redrawZoomInvariantTextLazyTimer;
    }, this), 100);
}

NodePaintCtrl.prototype.redrawZoomInvariantText = function () {

    if( !this.hasOwnProperty('nodeZoomInvariantText') ) return;
    
    var textDrawFunction = 'drawText';
    
    if( this.nodeZoomInvariantText.hasOwnProperty('textDrawings') ){
        for(var i=0; i<this.nodeZoomInvariantText.textDrawings.length; i++){
            this.paintDriver.removeDrawing(this.nodeZoomInvariantText.textDrawings[i]);
//            this.paintDriver.removeDrawing(this.nodeZoomInvariantText.rect[i]);
        }
    } else {
        textDrawFunction = 'drawTextAnimate';
    }
    
    // line height h divides on text part and space part
    var textPart = 0.9;
    var spacePart = 0.1;
    
    var r = 0.9*this.radius;
    
    var h = this.getZoomInvariantTextHeight();
    
    var fontSize = textPart*h;
    
    //compute text length
    var textLength = this.paintDriver.getCamera().cameraModel.zoom*this.paintDriver.calcTextLength({
        text: this.nodeZoomInvariantText.text,
        fontSize: fontSize
    });
    
    // count max text lines
    var c = Math.floor(2*r/h);

    // calculate how many text lines we need
    // for text
    var li;
    for(var i=1; i<=c; i++){
        li = this.calcZoomInvariantTextLength(i, h, r) 
        if( li > textLength ){
            c = i;
            break;
        }
    }
    if( li < textLength ){
        // our text length bigger than possible text lenth we can draw
    }
    
    var lines = this.calcZoomInvariantTextLines(c, h, r);
    var textLines = this.splitZoomInvariantTextToLines(this.nodeZoomInvariantText.text, textLength, lines, fontSize);
    
    this.nodeZoomInvariantText.textDrawings = [];
//    this.nodeZoomInvariantText.rect = [];
    
    for(var i=0; i<lines.yn.length; i++){

//        this.nodeZoomInvariantText.rect.push(this.paintDriver.drawRect({
//            x: this.center.x - lines.ln[i]/2,
//            y: this.center.y + lines.yn[i],
//            w: lines.ln[i],
//            h: 0.9*h
//        }));

        this.nodeZoomInvariantText.textDrawings.push(this.paintDriver[textDrawFunction]({
            x: this.center.x,
            y: this.center.y + lines.yn[i],
            text: textLines[i],
            fontSize: fontSize
        }));

    }
    
}

NodePaintCtrl.prototype.calcZoomInvariantTextLength = function (columnsCount, textRealHeight, r) {
    
    var textLength = 0;
    
    for(var i=0; i<Math.ceil(columnsCount/2); i++){

        var yni = textRealHeight*(i-columnsCount/2);
        var k = 2;
        
        if( i == (columnsCount-i-1) ){
            k = 1;
        }
            
        textLength += k*2*r*Math.sqrt(1-Math.pow(yni/r, 2));
        
    }
    
    return this.paintDriver.getCamera().cameraModel.zoom*textLength;
    
}

NodePaintCtrl.prototype.calcZoomInvariantTextLines = function (c, h, r) {
    
    // y position of n line
    var yn = []; yn.length = c;
    
    // length on n line
    var ln = []; ln.length = c;

    for(var i=0; i<Math.ceil(c/2); i++){
        
        var yni = h*(i-c/2);

        yn[i] = - yni -h;
        if( i != (c-i-1) ){
            yn[c-i-1] = yni;
        }

        ln[i] = 2*r*Math.sqrt(1-Math.pow(yni/r, 2));
        ln[c-i-1] = ln[i];
    }
    
    return {
        yn: yn,
        ln: ln
    };
    
}

NodePaintCtrl.prototype.splitZoomInvariantTextToLines = function (text, textLength, lines, fontSize) {
    
    var textCharCount = text.length;

    var textLines = [];
    
    for(var i=0; i<lines.ln.length; i++){

        var l = Math.floor(textCharCount*lines.ln[i]/textLength);
        var res = this.adjustStringLineToLength(text, l, lines.ln[i], fontSize);
        textLines.push( res.string );
        text = res.tail;
    }
    
    textLines.reverse()
    
    return textLines;
}

NodePaintCtrl.prototype.adjustStringLineToLength = function (text, charLength, pxLength, fontSize) {
    
//    var l = charLength;
    var l = text.length;
    var string;
    
    for(;;) {
        
        string = text.substring(0, l);
        var stringL = this.paintDriver.calcTextLength({
            text: string,
            fontSize: fontSize
        });
        
        if( stringL <= pxLength ){
            break;
        }
        
        l--;
    }
    
    return {
        string: string,
        tail: text.substring(l)
    };
}



NodePaintCtrl.prototype.setCenter = function (p) {
    this.center = {
        x: p.x,
        y: p.y
    };
}

NodePaintCtrl.prototype.setRadius = function (p) {
    this.radius = p.r;
}

NodePaintCtrl.prototype.getZoomInvariantTextHeight = function () {
    return 0.035*this.getRealHeight();
}

NodePaintCtrl.prototype.getRealHeight = function () {
    return this.paintDriver.getCanvasSize().h/this.paintDriver.getCamera().cameraModel.zoom;
}

NodePaintCtrl.prototype.setPaintDriverListener = function(eventName, handler) {
    
    if( this.handlersTool.countHandlers(eventName) == 0 ){
        this.paintDriver[eventName](this[eventName+'Handler']);
    }
    
    this.handlersTool.on.apply(this.handlersTool, arguments);
    
}

NodePaintCtrl.prototype.mousedown = function(handler) {
    this.setPaintDriverListener('mousedown', handler);
}

NodePaintCtrl.prototype.mouseup = function(handler) {
    this.setPaintDriverListener('mouseup', handler);
}

NodePaintCtrl.prototype.mousemove = function(handler) {
    this.setPaintDriverListener('mousemove', handler);
}

NodePaintCtrl.prototype.mouseleave = function(handler, data) {
    this.setPaintDriverListener('mouseleave', handler, data);
}

NodePaintCtrl.prototype.mousedownmove = function(handler, data) {
    this.handlersTool.mousedownmove(handler, data);
    if( this.handlersTool.countHandlers('mousedownmove') == 1 ){
        this.mousedown(this.emptyHandler);
        this.mouseup(this.emptyHandler);
    }
};

NodePaintCtrl.prototype.mousedownmoveend = function(handler, data) {
    this.handlersTool.mousedownmoveend(handler, data);
}

NodePaintCtrl.prototype.off = function (eventName, handler) {

    if( eventName == 'click' ){
        
        this.paintDriver.off(eventName, handler);
        
    } else {
        
        if( this.handlersTool.countHandlers(eventName) == 1 ){
            if( eventName in this.paintDriver ){
                this.paintDriver.off(eventName, this[eventName+'Handler']);
            }
        }
        
        this.handlersTool.off(eventName, handler);
        
        if( eventName == 'mousedownmove' ){
            
            if( this.handlersTool.countHandlers('mousedownmove') == 0 ){
                this.off('mousedown', this.emptyHandler);
                this.off('mouseup', this.emptyHandler);
            }
        }
        
    }
    
};

NodePaintCtrl.prototype.click = FM.Funcs.bindFieldMethod(NodePaintCtrl.prototype, 'paintDriver', 'click');
NodePaintCtrl.prototype.changeCoords = FM.Funcs.bindFieldMethod(NodePaintCtrl.prototype, 'paintDriver', 'changeCoords');
NodePaintCtrl.prototype.flyCoords = FM.Funcs.bindFieldMethod(NodePaintCtrl.prototype, 'paintDriver', 'flyCoords');
NodePaintCtrl.prototype.getCamera = FM.Funcs.bindFieldMethod(NodePaintCtrl.prototype, 'paintDriver', 'getCamera');
NodePaintCtrl.prototype.getCanvasSize = FM.Funcs.bindFieldMethod(NodePaintCtrl.prototype, 'paintDriver', 'getCanvasSize');
NodePaintCtrl.prototype.removeDrawing = FM.Funcs.bindFieldMethod(NodePaintCtrl.prototype, 'paintDriver', 'removeDrawing');
NodePaintCtrl.prototype.erase = FM.Funcs.bindFieldMethod(NodePaintCtrl.prototype, 'paintDriver', 'erase');
