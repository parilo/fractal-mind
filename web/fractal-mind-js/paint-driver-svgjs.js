function PaintDriverSvgJSFactory (params) {
    
    this.svgContainerElement = document.getElementById(params.canvasId);
    this.svg = SVG(params.canvasId);

    this.svgMainGroup = this.svg.group();
    this.svgMainGroup.addClass('viewport');
    
    this.pan = new PaintDriverPan(params);
    
    this.camera = new Camera();
    
}

PaintDriverSvgJSFactory.prototype.getObjectDriver = function () {
    return new PaintDriverSvgJSObject({
        svg: this.svg,
        svgMainGroup: this.svgMainGroup,
        pan: this.pan,
        camera: this.camera,
        svgContainer: this.svgContainerElement
    });
}

PaintDriverSvgJSFactory.prototype.getScreenDriver = function () {
    return new PaintDriverSvgJSScreen({
        svg: this.svg,
        svgMainGroup: this.svgMainGroup,
        pan: this.pan,
        camera: this.camera
    });
}





///
function PaintDriverSvgJSObject(svg) {
    
    this.svg = svg.svg;
    this.svgMainGroup = svg.svgMainGroup;
    this.panDriver = svg.pan;
    this.camera = svg.camera;
    this.svgContainer = svg.svgContainer;
    
    var offset = $(this.svgContainer).offset();
    this.svgContainerCoords = {
        x: offset.left,
        y: offset.top,
        w: this.svgContainer.clientWidth,
        h: this.svgContainer.clientHeight
    };
    
//    this.drawings = [];
    
    // all drawings will be drawn in group
    // to easy group actions
    this.group = this.svgMainGroup.group();
    
}

PaintDriverSvgJSObject.prototype.getCanvasSize = function () {
    return {
        w: this.svgContainerCoords.w,
        h: this.svgContainerCoords.h
    };
}

PaintDriverSvgJSObject.prototype.getPaintObjectCoordsFromMouseEventsCoords = function (mouseCoords) {
    return {
        x: mouseCoords.x - this.svgContainerCoords.x,
        y: mouseCoords.y - this.svgContainerCoords.y
    };
}

/**
*   c.r
*   c.x
*   c.y
*   c.borderWidth
*   c.borderColor
*   c.fillColor
*   c.fillOpacity
*/
PaintDriverSvgJSObject.prototype.drawCircle = function (c) {
    
    if( !c.hasOwnProperty('borderColor') ) c.borderColor = 'abc';
    if( !c.hasOwnProperty('fillColor') ) c.fillColor = 'fff';
    if( !c.hasOwnProperty('fillOpacity') ) c.fillOpacity = 1.0;
    
    var d = this.group
        .circle(0)
        .attr({ 
            fill: '#'+c.fillColor,
            stroke: '#'+c.borderColor, 
            'stroke-width': c.borderWidth,
            'fill-opacity': c.fillOpacity,
            'stroke-opacity': 1.0
        })
        .move(c.x, c.y)
        ;
    
        d
        .animate({
            duration: 500,
            ease: SVG.easing.swingTo
        })
        .move(c.x-c.r, c.y-c.r)
        .radius(c.r)
        ;
    
//    this.drawings.push(d);
    
    return d;
}

/**
*   c.r
*   c.x
*   c.y
*   c.borderWidth
*   c.borderColor
*   c.fillColor
*   c.fillOpacity
*/
PaintDriverSvgJSObject.prototype.drawCircleAnimateAppear = function (c) {
    
    if( !c.hasOwnProperty('borderColor') ) c.borderColor = 'abc';
    if( !c.hasOwnProperty('fillColor') ) c.fillColor = 'fff';
    if( !c.hasOwnProperty('fillOpacity') ) c.fillOpacity = 1.0;
    
    var d = this.group
        .circle(2*c.r)
        .attr({ 
            fill: '#'+c.fillColor,
            stroke: '#'+c.borderColor, 
            'stroke-width': c.borderWidth,
            'fill-opacity': 0.0,
            'stroke-opacity': 0.0
        })
        .move(c.x-c.r, c.y-c.r)
        ;
    
        d
        .animate({
            duration: 400
        })
        .attr({ 
            'fill-opacity': c.fillOpacity,
            'stroke-opacity': 1.0
        })
        ;
    
//    this.drawings.push(d);
    
    return d;
}

/**
* draw text
* @param {p.x} x global coordinate
* @param {p.y} y global coordinate
* @param {p.text} 
* @param {p.fontSize} 
*
*/
PaintDriverSvgJSObject.prototype.drawText = function (p) {
    
    var d = this.group
        .text(p.text)
        .leading(1.8)
        .attr({
            class: 'node-text',
            opacity: 1.0,
            'font-size': p.fontSize+'px'
        })
        .move(p.x, p.y)
        ;
    
//    this.drawings.push(d);
    
    return d;
    
}

PaintDriverSvgJSObject.prototype.drawTextAnimate = function (p) {
    
    var d = this.group
        .text(p.text)
        .leading(1.8)
        .attr({
            class: 'node-text',
            opacity: 0.0,
            'font-size': p.fontSize+'px'
        })
        .move(p.x, p.y)
        ;
    
        d
        .animate({
            duration: 200,
            ease: SVG.easing.sineIn
        })
        .attr({
            opacity: 1.0
        });
        ;
    
//    this.drawings.push(d);
    
    return d;
    
}

/**
* draw text
* @param {p.text} 
* @param {p.fontSize} 
*
*/
PaintDriverSvgJSObject.prototype.calcTextLength = function (p) {
    
    var d = this.group
        .text(p.text)
        .attr({
            class: 'node-text',
            'fill-opacity': 0.0,
            'stroke-opacity': 0.0,
            'font-size': p.fontSize+'px'
        });
    
    var l = d.length();
    
    d.remove();
    
    return l;
    
}

/**
* draw text
* @param {p.x} x global coordinate of left top corner
* @param {p.y} y global coordinate of left top corner
* @param {p.w} 
* @param {p.h} 
*
*/
PaintDriverSvgJSObject.prototype.drawRect = function (p) {
    
    var d = this.group
        .rect(p.w, p.h)
        .attr({ 
            fill: '#567'
        })
        .move(p.x, p.y)
        ;
    
//    this.drawings.push(d);
    
    return d;
    
}

PaintDriverSvgJSObject.prototype.changeFontSize = function (drawing, p) {
    drawing.attr({
        'font-size': p.fontSize+'px'
    });
}

PaintDriverSvgJSObject.prototype.removeDrawing = function (drawing) {
    drawing.remove();
}

PaintDriverSvgJSObject.prototype.erase = function () {
    this.group.remove();
}

PaintDriverSvgJSObject.prototype.changeCoords = function (p) {
    
// need to understand how to draw new objects after group transformation
    
    this.group.move(
        this.group.x()+p.dx,
        this.group.y()+p.dy
    );
    
//    for(var i=0; i<this.drawings.length; i++){
//        var drawing = this.drawings[i];
//        drawing.move(
//            drawing.x()+p.dx,
//            drawing.y()+p.dy
//        );
//    }
}

PaintDriverSvgJSObject.prototype.flyCoords = function (p) {

// need to understand how to draw new objects after group transformation
    
    this.group.animate({
        duration: 500
    }).move(
        this.group.x()+p.dx,
        this.group.y()+p.dy
    );
    
//    for(var i=0; i<this.drawings.length; i++){
//        var drawing = this.drawings[i];
//        drawing.move(
//            drawing.x()+p.dx,
//            drawing.y()+p.dy
//        );
//    }
}

//All available evenets are:
//click, dblclick, mousedown, mouseup, mouseover, mouseout, mousemove, mouseenter, mouseleave, touchstart, touchmove, touchleave, touchend and touchcancel.

PaintDriverSvgJSObject.prototype.click = function(handler, data) {
    
    this.on('click', 
        //before invoke click needed to check
        //whether it was pan
        bind(
            function(hander, event){
                if( !this.panDriver.wasMovedWhileMousedown ){
                    hander(event, data);
                }
            },
            this,
            handler
        )
    );
    
}

PaintDriverSvgJSObject.prototype.getCamera = function() {
    return this.camera;
}

PaintDriverSvgJSObject.prototype.mousedown = function(handler) {
    this.on('mousedown', handler);
}

PaintDriverSvgJSObject.prototype.mouseup = function(handler) {
    this.on('mouseup', handler);
}

PaintDriverSvgJSObject.prototype.mousemove = function(handler) {
    this.on('mousemove', handler);
}

PaintDriverSvgJSObject.prototype.mouseleave = function(handler) {
    this.on('mouseleave', handler);
}

PaintDriverSvgJSObject.prototype.on = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'group', 'on');
PaintDriverSvgJSObject.prototype.off = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'group', 'off');

PaintDriverSvgJSObject.prototype.globalon = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'svg', 'on');
PaintDriverSvgJSObject.prototype.globaloff = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'svg', 'off');

PaintDriverSvgJSObject.prototype.pan = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'panDriver', 'pan');
PaintDriverSvgJSObject.prototype.zoom = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'panDriver', 'zoom');
PaintDriverSvgJSObject.prototype.panon = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'panDriver', 'on');
PaintDriverSvgJSObject.prototype.panoff = FM.Funcs.bindFieldMethod(PaintDriverSvgJSObject.prototype, 'panDriver', 'off');









function PaintDriverSvgJSScreen(svg) {
    
    this.svg = svg.svg;
    this.svgMainGroup = svg.svgMainGroup;
    this.panDriver = svg.pan;
    this.camera = svg.camera;
    
    this.camera.move(function(event, me){
        me.cameraChanged();
    }, this);
    
    this.camera.fly(function(event, me){
        me.cameraFlown();
    }, this);
    
}

//PaintDriverSvgJS.prototype.calculateViewbox = function (cameraModel) {
//    
//    return {
//        x: Math.round( cameraModel.centerAt.x - (FractalMind.params.viewportSize.w/2)/cameraModel.zoom ),
//        y: Math.round( cameraModel.centerAt.y - (FractalMind.params.viewportSize.h/2)/cameraModel.zoom ),
//        width: Math.round( FractalMind.params.viewportSize.w/cameraModel.zoom ),
//        height: Math.round( FractalMind.params.viewportSize.h/cameraModel.zoom )
//    }
//}

PaintDriverSvgJSScreen.prototype.calculateTransformForCamera = function (cameraModel) {
    return cameraModel.zoom + ',' +
        '0,0,' +
        cameraModel.zoom + ',' +
        cameraModel.centerAt.x + ',' +
        cameraModel.centerAt.y;
}

PaintDriverSvgJSScreen.prototype.cameraChanged = function () {
    
//    this.cameraModel.setFromCamera(cameraModel);
    this.svgMainGroup.transform('matrix', this.calculateTransformForCamera(this.camera.cameraModel));

//    this.svg.viewbox(this.calculateViewbox(cameraModel));
    
}

PaintDriverSvgJSScreen.prototype.cameraFlown = function () {
    
//    this.cameraModel.setFromCamera(cameraModel);

//    var viewbox = this.calculateViewbox(cameraModel);
//    this.svg.animate({
//        duration: 500,
//        ease: SVG.easing.swingTo
//    })
//    .viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
    
    this.svgMainGroup.animate({
        duration: 500,
        ease: SVG.easing.swingTo
    })
    .transform('matrix', this.calculateTransformForCamera(this.camera.cameraModel))
    .after(FM.Funcs.bind(function(){
        this.camera.fireFlyEnd();
    }, this));

}

PaintDriverSvgJSScreen.prototype.getCamera = function() {
    return this.camera;
}

PaintDriverSvgJSScreen.prototype.pan = FM.Funcs.bindFieldMethod(PaintDriverSvgJSScreen.prototype, 'panDriver', 'pan');
PaintDriverSvgJSScreen.prototype.zoom = FM.Funcs.bindFieldMethod(PaintDriverSvgJSScreen.prototype, 'panDriver', 'zoom');
PaintDriverSvgJSScreen.prototype.on = FM.Funcs.bindFieldMethod(PaintDriverSvgJSScreen.prototype, 'panDriver', 'on');
PaintDriverSvgJSScreen.prototype.off = FM.Funcs.bindFieldMethod(PaintDriverSvgJSScreen.prototype, 'panDriver', 'off');




//SVG.easing.quadIn
//SVG.easing.quadOut
//SVG.easing.quadInOut
//SVG.easing.cubicIn
//SVG.easing.cubicOut
//SVG.easing.cubicInOut
//SVG.easing.quartIn
//SVG.easing.quartOut
//SVG.easing.quartInOut
//SVG.easing.quintIn
//SVG.easing.quintOut
//SVG.easing.quintInOut
//SVG.easing.sineIn
//SVG.easing.sineOut
//SVG.easing.sineInOut
//SVG.easing.expoIn
//SVG.easing.expoOut
//SVG.easing.expoInOut
//SVG.easing.circIn
//SVG.easing.circOut
//SVG.easing.circInOut
//SVG.easing.backIn
//SVG.easing.backOut
//SVG.easing.backInOut
//SVG.easing.swingFromTo
//SVG.easing.swingFrom
//SVG.easing.swingTo
//SVG.easing.bounce
//SVG.easing.bounceOut
//SVG.easing.elastic

