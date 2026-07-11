// American Sign Language (ASL) Finger-Spelling Classifier (Geometric Logic)
class ASLClassifier {
    static dist(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
    }

    static classify(landmarks, handedness = "Right") {
        if (!landmarks || landmarks.length < 21) return { letter: null, confidence: 0 };

        const checkFingerExtended = (tip, dip, pip, mcp) => {
            const straight = this.dist(landmarks[tip], landmarks[mcp]);
            const path = this.dist(landmarks[tip], landmarks[dip]) + this.dist(landmarks[dip], landmarks[pip]) + this.dist(landmarks[pip], landmarks[mcp]);
            return straight / path;
        };

        const rIndex = checkFingerExtended(8, 7, 6, 5);
        const rMiddle = checkFingerExtended(12, 11, 10, 9);
        const rRing = checkFingerExtended(16, 15, 14, 13);
        const rPinky = checkFingerExtended(20, 19, 18, 17);

        const indexExtended = rIndex > 0.80;
        const middleExtended = rMiddle > 0.80;
        const ringExtended = rRing > 0.80;
        const pinkyExtended = rPinky > 0.80;

        const wrist = landmarks[0];
        const indexMcp = landmarks[5];
        const middleMcp = landmarks[9];
        const pinkyMcp = landmarks[17];
        
        const handScale = this.dist(wrist, middleMcp);
        const handWidth = this.dist(indexMcp, pinkyMcp);

        const thumbTip = landmarks[4];
        const thumbCmc = landmarks[1];
        const thumbLength = this.dist(thumbTip, landmarks[3]) + this.dist(landmarks[3], landmarks[2]) + this.dist(landmarks[2], thumbCmc);
        const thumbStraight = this.dist(thumbTip, thumbCmc);
        const thumbIsStraight = (thumbStraight / thumbLength) > 0.82;
        const thumbExtended = thumbIsStraight && (this.dist(thumbTip, indexMcp) > handWidth * 0.65);

        const dThumbIndex = this.dist(thumbTip, landmarks[8]);
        const dThumbMiddle = this.dist(thumbTip, landmarks[12]);
        const dThumbRing = this.dist(thumbTip, landmarks[16]);
        const dThumbPinky = this.dist(thumbTip, landmarks[20]);
        const touchThreshold = handWidth * 0.35;

        // Expose debug details
        window.appState.debugData = {
            rIndex, rMiddle, rRing, rPinky,
            indexExtended, middleExtended, ringExtended, pinkyExtended, thumbExtended
        };

        // Left vs Right Hand adjustments
        const isRight = handedness === "Right";
        const thumbIsOuter = isRight ? (thumbTip.x < indexMcp.x) : (thumbTip.x > indexMcp.x);
        const thumbIsInner = isRight ? (thumbTip.x > indexMcp.x) : (thumbTip.x < indexMcp.x);

        // Robust Fist detection: if at least 3 of the 4 fingers are folded
        const numFolded = [rIndex, rMiddle, rRing, rPinky].filter(r => r < 0.50).length;
        const isFist = numFolded >= 3;

        // --- GESTURE RULES ---
        if (thumbExtended && pinkyExtended && !indexExtended && !middleExtended && !ringExtended) return { letter: "Y", confidence: 0.95 };
        if (indexExtended && thumbExtended && !middleExtended && !ringExtended && !pinkyExtended) return { letter: "L", confidence: 0.95 };
        if (indexExtended && middleExtended && ringExtended && !pinkyExtended) return { letter: "W", confidence: 0.92 };
        if (!indexExtended && middleExtended && ringExtended && pinkyExtended && dThumbIndex < touchThreshold) return { letter: "F", confidence: 0.90 };

        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
            // H: Horizontal pointing fingers
            const isHorizontal = Math.abs(landmarks[8].y - indexMcp.y) < handScale * 0.40 && 
                                Math.abs(landmarks[12].y - middleMcp.y) < handScale * 0.40;
            if (isHorizontal) return { letter: "H", confidence: 0.90 };

            // K: Thumb touching middle finger joint
            if (this.dist(thumbTip, landmarks[10]) < touchThreshold * 1.4) return { letter: "K", confidence: 0.88 };

            // R: Crossed fingers
            const tipsCrossed = (landmarks[8].x > landmarks[12].x && indexMcp.x < middleMcp.x) ||
                                (landmarks[8].x < landmarks[12].x && indexMcp.x > middleMcp.x);
            if (tipsCrossed && this.dist(landmarks[8], landmarks[12]) < touchThreshold) {
                return { letter: "R", confidence: 0.88 };
            }

            // V vs U: Spread vs Closed
            return { letter: (this.dist(landmarks[8], landmarks[12]) > handWidth * 0.35) ? "V" : "U", confidence: 0.90 };
        }

        if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) return { letter: "B", confidence: 0.95 };
        
        if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && dThumbMiddle < touchThreshold * 1.5 && dThumbRing < touchThreshold * 1.5) {
            return { letter: "D", confidence: 0.92 };
        }
        if (pinkyExtended && !indexExtended && !middleExtended && !ringExtended) return { letter: "I", confidence: 0.92 };

        // Curved / Circle states (C / O)
        if (!isFist) {
            const avgStraightness = (rIndex + rMiddle + rRing + rPinky) / 4;
            const isCurvedHand = avgStraightness > 0.45 && avgStraightness < 0.78;

            if (dThumbIndex < touchThreshold * 1.35 && dThumbMiddle < touchThreshold * 1.35 && dThumbRing < touchThreshold * 1.35) {
                return { letter: "O", confidence: 0.90 };
            }
            if (isCurvedHand && thumbIsOuter && dThumbIndex > touchThreshold * 1.6) {
                return { letter: "C", confidence: 0.88 };
            }
        }

        // Sideways pointers (G / H / K)
        if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && Math.abs(landmarks[8].y - indexMcp.y) < handScale * 0.35) {
            return { letter: "G", confidence: 0.85 };
        }


        // Fist states (A / E / M / N / S / T / X)
        if (isFist) {
            if (numFolded === 3 && rIndex >= 0.50 && rIndex <= 0.75) return { letter: "X", confidence: 0.80 };
            if (thumbIsOuter && thumbTip.y < indexMcp.y) return { letter: "A", confidence: 0.90 };
            if (thumbIsInner && thumbTip.y > middleMcp.y) {
                if (dThumbMiddle < touchThreshold) return { letter: "E", confidence: 0.85 };
                return { letter: "S", confidence: 0.85 };
            }
            if (thumbIsInner && thumbTip.x > Math.min(indexMcp.x, middleMcp.x) && thumbTip.x < Math.max(indexMcp.x, middleMcp.x)) {
                return { letter: "T", confidence: 0.85 };
            }
            return { letter: "S", confidence: 0.70 };
        }

        return { letter: null, confidence: 0 };
    }
}
window.ASLClassifier = ASLClassifier;
