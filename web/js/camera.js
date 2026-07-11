// SensiSign AI - Camera Controller & Skeleton Canvas Renderer
class CameraController {
    static init() {
        this.videoEl = document.getElementById("webcam");
        this.canvasEl = document.getElementById("overlay");
        this.canvasCtx = this.canvasEl.getContext("2d");
        this.fpsCounter = document.getElementById("fpsCounter");
        this.handTrackText = document.getElementById("handTrackBadge");
        
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
        this.videoEl.addEventListener("loadedmetadata", () => this.resizeCanvas());
    }

    static resizeCanvas() {
        this.canvasEl.width = this.videoEl.clientWidth || 640;
        this.canvasEl.height = this.videoEl.clientHeight || 480;
    }

    static trackFPS() {
        const state = window.appState;
        const now = performance.now();
        state.frameCount++;
        if (now - state.lastFrameTime >= 1000) {
            state.fps = Math.round((state.frameCount * 1000) / (now - state.lastFrameTime));
            this.fpsCounter.innerText = `${state.fps} FPS`;
            state.frameCount = 0;
            state.lastFrameTime = now;
        }
    }

    static updateTrackingBadge(detected) {
        if (detected) {
            this.handTrackText.innerText = "Hand Tracked";
            this.handTrackText.style.background = "#d1fae5";
            this.handTrackText.style.color = "#059669";
        } else {
            this.canvasCtx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
            this.handTrackText.innerText = "No Hand";
            this.handTrackText.style.background = "#f1f5f9";
            this.handTrackText.style.color = "#64748b";
        }
    }

    static drawHandSkeleton(landmarks) {
        this.canvasCtx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [9, 10], [10, 11], [11, 12],
            [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];

        // Draw connections with clean gray lines
        this.canvasCtx.lineWidth = 3;
        this.canvasCtx.strokeStyle = "rgba(71, 85, 105, 0.6)";
        this.canvasCtx.shadowBlur = 0;
        
        for (const conn of connections) {
            const start = landmarks[conn[0]];
            const end = landmarks[conn[1]];
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(start.x * this.canvasEl.width, start.y * this.canvasEl.height);
            this.canvasCtx.lineTo(end.x * this.canvasEl.width, end.y * this.canvasEl.height);
            this.canvasCtx.stroke();
        }

        // Draw joint points with simple filled circles
        for (let i = 0; i < landmarks.length; i++) {
            const pt = landmarks[i];
            const x = pt.x * this.canvasEl.width;
            const y = pt.y * this.canvasEl.height;
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(x, y, [4, 8, 12, 16, 20].includes(i) ? 6 : 4, 0, 2 * Math.PI);
            this.canvasCtx.fillStyle = [4, 8, 12, 16, 20].includes(i) ? "#2563eb" : "#475569";
            this.canvasCtx.fill();
        }
    }
}

window.CameraController = CameraController;
