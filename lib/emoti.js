var clm = require('./vendor/clmtrackr.js');
var pModel = require('./model_pca_20_svm_emotionDetection.js').pModel;
var emotionModel = require('./emotionmodel.js').emotionModel;
var ec = require('./emotion_classifier.js');

/*********** setup of emotion detection *************/

var ctrack = new clm.tracker({useWebGL : false});
console.log("pModel: " + pModel);

ctrack.init(pModel);

function drawLoop() {
    //requestAnimFrame(drawLoop);
    //overlayCC.clearRect(0, 0, 400, 300);
    //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
    /*if (ctrack.getCurrentPosition()) {
        ctrack.draw(overlay);
    }*/
    var cp = ctrack.getCurrentParameters();
    console.log("Ctrack current parameters: " + cp);

    var er = ec.meanPredict(cp);
    console.log("Emotion Classifier mean predict: " + er);
    /*
    if (er) {
        updateData(er);
        for (var i = 0;i < er.length;i++) {
            if (er[i].value > 0.4) {
                document.getElementById('icon'+(i+1)).style.visibility = 'visible';
            } else {
                document.getElementById('icon'+(i+1)).style.visibility = 'hidden';
            }
        }
    }*/
}

//var ec = emotionClassifier;
ec.init(emotionModel);
var emotionData = ec.getBlank();

exports.startEmotionDetect = function (image) {
    // start video
    //vid.play();
    // start tracking
    try {
        ctrack.start(image);
        // start loop to draw face
        drawLoop();
    }
    catch(err) {
        console.log(err);
        throw err;
    }

};

