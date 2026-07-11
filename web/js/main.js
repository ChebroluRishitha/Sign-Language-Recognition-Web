document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Controllers
    window.CameraController.init();
    window.SpellerController.init();

    const predictedLetterEl = document.getElementById("predictedLetter");
    const predictionConfidenceEl = document.getElementById("predictionConfidence");
    const guideActiveInfo = document.getElementById("guideActiveInfo");

    const letterDescriptions = {
        A: "Fist: Place thumb against side of index.", B: "Flat: Fingers straight, thumb across palm.",
        C: "Curved: Curve fingers and thumb to form 'C'.", D: "Pointer: Index straight up, others touch thumb.",
        E: "Fist: Fingers folded flat, thumb across bottom.", F: "OK: Circle with thumb/index, others straight.",
        G: "Sideways Pinch: Index/thumb pointing sideways.", H: "Sideways Double: Index/middle point sideways.",
        I: "Pinky: Pinky finger straight up, others folded.", J: "Pinky Trace: Pinky up, trace 'J' in the air.",
        K: "V with Thumb: V sign, thumb against middle joint.", L: "L Shape: Index up, thumb out at 90 degrees.",
        M: "Tucked 3: Fist, thumb under index/middle/ring.", N: "Tucked 2: Fist, thumb under index/middle.",
        O: "Circle: All finger tips touch thumb tip.", P: "K Down: Form K sign pointing down.",
        Q: "G Down: Form G sign pointing down.", R: "Crossed: Index and middle fingers crossed.",
        S: "Simple Fist: Fist, thumb across index/middle.", T: "Tucked 1: Fist, thumb under index.",
        U: "Double Up: Index/middle straight up and touching.", V: "V Sign: Index/middle straight up and spread.",
        W: "W Sign: Index/middle/ring straight up and spread.", X: "Hook: Curve index, other fingers folded.",
        Y: "Shaka: Extend thumb and pinky, fold others.", Z: "Trace: Index straight, trace 'Z' in the air."
    };



    const guideFeedback = document.getElementById("guideFeedback");

    const highlightActiveGuide = (char) => {
        if (char) {
            guideActiveInfo.innerText = letterDescriptions[char] || "Form the hand gesture as described.";
            guideFeedback.innerText = `Letter ${char} Active`;
        }
    };

    // Initialize MediaPipe Hands
    const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    
    hands.onResults((results) => {
        window.CameraController.trackFPS();
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            window.CameraController.drawHandSkeleton(landmarks);
            window.CameraController.updateTrackingBadge(true);

            const rawHandedness = results.multiHandedness[0].label;
            const handedness = rawHandedness === "Left" ? "Right" : "Left";
            const classification = window.ASLClassifier.classify(landmarks, handedness);

            
            const debugEl = document.getElementById("debugInfo");
            if (debugEl && window.appState.debugData) {
                const d = window.appState.debugData;
                debugEl.style.display = "block";
                debugEl.innerText = `Hand: ${handedness}\n` +
                                    `Idx: ${d.rIndex.toFixed(2)} (${d.indexExtended?'Ext':'Fld'})\n` +
                                    `Mid: ${d.rMiddle.toFixed(2)} (${d.middleExtended?'Ext':'Fld'})\n` +
                                    `Rng: ${d.rRing.toFixed(2)} (${d.ringExtended?'Ext':'Fld'})\n` +
                                    `Pky: ${d.rPinky.toFixed(2)} (${d.pinkyExtended?'Ext':'Fld'})\n` +
                                    `ThbExt: ${d.thumbExtended?'Yes':'No'}`;
            }

            if (classification.letter) {
                const history = window.appState.predictionHistory;
                history.push(classification.letter);
                if (history.length > 5) history.shift();
                
                // Mode prediction
                const counts = {};
                let modeLetter = history[0], maxCount = 1;
                for (const l of history) {
                    counts[l] = (counts[l] || 0) + 1;
                    if (counts[l] > maxCount) { modeLetter = l; maxCount = counts[l]; }
                }
                
                predictedLetterEl.innerText = modeLetter;
                predictionConfidenceEl.innerText = `${Math.round(classification.confidence * 100)}% Match`;
                
                window.SpellerController.handleHold(modeLetter);
                highlightActiveGuide(modeLetter);
            } else {
                predictedLetterEl.innerText = "-";
                predictionConfidenceEl.innerText = "0% Match";
            }
        } else {
            window.CameraController.updateTrackingBadge(false);
            const debugEl = document.getElementById("debugInfo");
            if (debugEl) debugEl.style.display = "none";
            predictedLetterEl.innerText = "-";
            predictionConfidenceEl.innerText = "0% Match";
            
            guideFeedback.innerText = "Active Sign Guide";
            guideActiveInfo.innerText = "Show any sign to the camera to see its description, or look at the chart on the left to practice the letters A-Z.";
            
            window.appState.activeHoldLetter = null;
        }
    });

    const videoEl = document.getElementById("webcam");
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then(stream => {
            videoEl.srcObject = stream;
            videoEl.addEventListener("loadeddata", () => {
                document.getElementById("cameraLoader").style.display = "none";
                window.CameraController.resizeCanvas();
                
                const processFrame = async () => {
                    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) await hands.send({ image: videoEl });
                    requestAnimationFrame(processFrame);
                };
                requestAnimationFrame(processFrame);
            });
        }).catch(err => {
            console.error("Camera error:", err);
        });
});
