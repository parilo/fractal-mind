
///
function PaintDriverPan (params) {

    this.registerEvents(
        'pan',
        'zoom'
    );
    
    var elementId = params.canvasId;
    var element = $('#'+elementId);
    
    var eloffset = $(element).offset();
    var elementCoords = {
        x: eloffset.left,
        y: eloffset.top
    };
    
    var previousMouseCoords = { x:0, y:0 };
    this.wasMovedWhileMousedown = false;
    
    $(element).mousewheel(
        $.proxy(
            function(event) {

                this.fire('zoom', {
                    zoom: event.deltaY,
                    pointerX: event.clientX - elementCoords.x,
                    pointerY: event.clientY - elementCoords.y
                });
                
                // if needed to pass wheel to inner object
                // maybe it's needed to pass possibility to preventDefault to them
                // instead preventDefault here
                event.preventDefault();
            },
            this
        )
    );
    
    $(element).mousedown(
        $.proxy(
            function(event) {

                this.wasMovedWhileMousedown = false;
                
                previousMouseCoords = {
                    x: event.clientX,
                    y: event.clientY
                };
                $(element).on('mousemove', mouseMoveHandler);
            },
            this
        )
    );
    
    $(element).mouseup(
        $.proxy(
            function(event) {
                $(element).off('mousemove', mouseMoveHandler);
            },
            this
        )
    );
    
    var mouseMoveHandler = $.proxy(
        function(event) {

            this.wasMovedWhileMousedown = true;
            
            var ev = {
                x: event.clientX,
                y: event.clientY,
                dx: previousMouseCoords.x - event.clientX,
                dy: previousMouseCoords.y - event.clientY
            };
            
            this.fire('pan', ev);
            
            previousMouseCoords = {
                x: event.clientX,
                y: event.clientY
            };

//            event.preventDefault();
            
        },
        this
    );

}

PaintDriverPan = FM.Funcs.mixIn(PaintDriverPan, FM.HandlersTool);
