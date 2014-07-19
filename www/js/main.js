
$(function() {

    var fm = new FractalMind({
        canvasId: "canvas",
        viewportSize: {
            w: document.getElementById("canvas").clientWidth,
            h: document.getElementById("canvas").clientHeight
        }
    });
    fm.main();
    

});
