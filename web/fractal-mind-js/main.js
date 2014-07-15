"use strict";

function FractalMind(params){
    
    FractalMind.params = params;
    FractalMind.paintDriverFactory = new PaintDriverFactory(params);
}

FractalMind.prototype.main = function(params){
    
//    var root = new NodeModel();
//    root.text = "Hi! I'm root node";
//
//    var n = new NodeModel();
//    n.text = "I'm child node 1";
//
//        for( var i=0; i<5; i++ ){
//            var n2 = new NodeModel();
//            n2.text = "I'm child node "+i;
//            n.addChildNode(n2);
//            
//            if( i==0 )
//            for( var ii=0; ii<5; ii++ ){
//                var nn2 = new NodeModel();
//                nn2.text = "I'm child node "+ii;
//                n2.addChildNode(nn2);
//            
//                if( ii==0 )
//                for( var iii=0; iii<5; iii++ ){
//                    var nnn2 = new NodeModel();
//                    nnn2.text = "I'm child node "+iii;
//                    nn2.addChildNode(nnn2);
//                }
//
//            }
//            
//        }
//
//    root.addChildNode(n);
//    
//    
//    var n = new NodeModel();
//    n.text = "I'm child node 2";
//    root.addChildNode(n);
//    
////    n.geomModel.setRadius(100);
//
//    var n = new NodeModel();
//    n.text = "I'm child node 3";
//    root.addChildNode(n);
//
//    var n = new NodeModel();
//    n.text = "I'm child node 4";
//    root.addChildNode(n);
//    
//    for( var i=0; i<4; i++ ){
//        var n = new NodeModel();
//        n.text = "I'm child node "+(5+i);
//        root.addChildNode(n);
//    }

    var root = new NodeModel();
    root.text = "Hi! Welcome to fractal mind! Scroll up on me :)";

    var n = new NodeModel();
    n.text = "We are";
    root.addChildNode(n);

    var n = new NodeModel();
    n.text = "the children";
    root.addChildNode(n);

    var n = new NodeModel();
    n.text = "Drag on me :)";
    root.addChildNode(n);

    var n = new NodeModel();
    n.text = "Move me with move button at top";
    root.addChildNode(n);

    var n = new NodeModel();
    n.text = "Add child to me with '+' button";
    root.addChildNode(n);

    var n = new NodeModel();
    n.text = "I have children. Scroll on me until you see them :)";

        for( var i=0; i<5; i++ ){
            var n2 = new NodeModel();
            n2.text = "I'm child "+i;
            n.addChildNode(n2);
            
            if( i==0 )
            for( var ii=0; ii<5; ii++ ){
                var nn2 = new NodeModel();
                nn2.text = "I'm child "+ii;
                n2.addChildNode(nn2);
            }
        }
    
    root.addChildNode(n);
    
    
    
    var wm = new WorldModel();
    wm.addRootNode(root);
    
    var w = new WorldCtrl();
    
    var cameraModel = w.worldView.getCamera().cameraModel;
    cameraModel.zoomCamera(/*0.80*/FractalMind.params.viewportSize.h/7.7/150);
    cameraModel.centerAt = {
        x: FractalMind.params.viewportSize.w/2,
        y: FractalMind.params.viewportSize.h/2
    };
    
    w.worldView.getCamera().moveTo(cameraModel);
    w.showWorld(wm);
    
}
