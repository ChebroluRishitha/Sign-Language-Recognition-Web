// SensiSign AI - Global State Manager
window.appState = {
    activePrediction: null,
    predictionHistory: [],
    spellerText: "",
    targetLetter: "A",
    practiceProgress: 0,
    lastMatchTime: null,
    scoreCount: 0,
    streakCount: 0,
    completedLetters: new Set(),
    activeHoldLetter: null,
    activeHoldStart: null,
    fps: 0,
    lastFrameTime: performance.now(),
    frameCount: 0
};
