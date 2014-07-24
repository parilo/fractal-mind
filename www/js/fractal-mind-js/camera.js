function CameraModel() {
    
    this.centerAt = { x: FractalMind.params.viewportSize.w/2, y: FractalMind.params.viewportSize.h/2 };
    this.rotation = 0;
    this.zoom = 1.0;
    
};

CameraModel.prototype.centerCameraAtNode = function (nodeModel) {
    
    this.centerAt.x = -nodeModel.geomModel.coords.x;
    this.centerAt.y = -nodeModel.geomModel.coords.y;
    
    var minViewportSize = Math.min( FractalMind.params.viewportSize.w, FractalMind.params.viewportSize.h );
    var z = minViewportSize / 2 / nodeModel.geomModel.radius / 2;

    this.zoom = 1;
    this.zoomCamera(z);

    this.translateCamera({ x: FractalMind.params.viewportSize.w/2, y: FractalMind.params.viewportSize.h/2 });
    
}

CameraModel.prototype.translateCamera = function (tr) {
    this.centerAt.x += tr.x;
    this.centerAt.y += tr.y;
}

CameraModel.prototype.zoomCamera = function (zoom) {
    this.zoom *= zoom;
    this.centerAt.x *= zoom;
    this.centerAt.y *= zoom;
}

CameraModel.prototype.set = function (cameraModel) {
    
    this.centerAt.x = cameraModel.centerAt.x;
    this.centerAt.y = cameraModel.centerAt.y;
    this.rotation = cameraModel.rotation;
    this.zoom = cameraModel.zoom;
    
}

CameraModel.prototype.clone = function () {

    var cm = new CameraModel();
    cm.centerAt.x = this.centerAt.x;
    cm.centerAt.y = this.centerAt.y;
    cm.rotation = this.rotation;
    cm.zoom = this.zoom;
    
    return cm;
}



function Camera() {
    
    this.registerEvents(
        'change',
        'move',
        'fly',
        'flyEnd'
    );
    
    this.cameraModel = new CameraModel();
    
}

Camera.prototype.getCameraModel = function () {
    return this.cameraModel.clone();
};

/**
* move instantly
*/
Camera.prototype.moveTo = function (cameraModel) {

    var oldCameraModel = this.cameraModel.clone();
    this.cameraModel.set(cameraModel);
    
    var ev = {
        camera: this,
        oldCameraModel: oldCameraModel
    };
    
    this.fire('move', ev);
    this.fire('change', ev);
}

Camera.prototype.flyTo = function (cameraModel) {

    var oldCameraModel = this.cameraModel.clone();
    this.cameraModel.set(cameraModel);
    
    var ev = {
        camera: this,
        oldCameraModel: oldCameraModel
    };
    
    this.fire('fly', ev);
    this.fire('change', ev);
}

// method for paint driver to inform camera that fly ended
Camera.prototype.fireFlyEnd = function () {
    this.fire('flyEnd', {camera: this});
}

Camera = FM.Funcs.mixIn(Camera, FM.HandlersTool);
