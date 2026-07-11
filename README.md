# Real-Time Sign Language Recognition Web Application

A lightweight, zero-dependency, real-time browser-based **American Sign Language (ASL) Fingerspelling Recognition** dashboard. This application tracks hands via webcams at 60 FPS, classifies gestures using geometric mathematical heuristics, and features an interactive speller text area with text-to-speech output.

---

## ✨ Features

* **High Performance (60 FPS):** Uses MediaPipe's WebGL-accelerated hand tracking pipeline directly in the browser, eliminating the lag and low framerates of traditional Python OpenCV models.
* **Handedness Aware (Left/Right):** Automatically detects whether you are using your left or right hand and adapts the thumb classification math parameters dynamically.
* **Speller Interface:** Hold a sign steady for **1 second (1.2 seconds)** to lock and type it into the editor text box.
* **Speech Synthesis:** Read your typed words out loud with browser-native text-to-speech.
* **Large UI elements:** Giant character display (`7rem`) and large spelled text outputs (`1.25rem`) designed for easy viewing from a distance.
* **Unified Single Screen:** Statically displays a large ASL manual alphabet chart next to the camera feed.

---

## 🚀 How to Launch the Web App

You do not need to compile any code or install complex neural network libraries. Launching is simple:

### Step 1: Run the Local Web Server
Open your terminal (PowerShell, Command Prompt, or Bash) in the project root directory and run the built-in Python HTTP server:

```bash
python -m http.server 8080
```
*(Note: If `python` is not recognized, try `py -m http.server 8080`)*

### Step 2: Open the Application
Keep the terminal window running, open your web browser, and go to:
👉 **[http://localhost:8080](http://localhost:8080)**

The root index page will automatically redirect you to the main interface (`web/index.html`).

---

## 🎯 How Recognition Works (Under the Hood)

1. **MediaPipe Hands** detects 21 joints (3D landmarks) on your hand.
2. The coordinate points are passed to the heuristic engine in `web/js/classifier.js`.
3. It measures **finger straightness ratios** to classify finger status:
   * **Extended:** Finger straightness ratio $> 0.80$
   * **Folded:** Finger straightness ratio $< 0.50$
   * **Curved:** Finger straightness ratio is intermediate ($0.50 \text{ to } 0.78$)
4. Handedness check dynamically mirrors thumb positions to check if it's on the outer or inner side of the hand.
5. If at least 3 fingers are folded, the engine registers a robust **fist** state.

---

## ⚠️ Limitations & Gestures

### ✅ Easily Recognized Signs (Static Shapes)
Simple signs that rely on static finger extensions, folds, or curves are detected highly reliably:
* **`A`**, **`B`**, **`C`**, **`D`**, **`F`**, **`I`**, **`L`**, **`O`**, **`U`**, **`V`**, **`W`**, **`Y`**
* Standard fists (**`S`**, **`E`**, **`T`**) are supported via robust folding voting rules.

### ❌ Harder Signs (Motion / Depth Occlusion)
Signs that require motion or suffer from finger occlusion relative to a single camera perspective are less reliable or not supported by static heuristics:
* **`J` and `Z`:** These signs require tracing shapes in the air (a curve and a zig-zag). Since the classification engine is static-frame based, they are not dynamically traced.
* **`M` and `N`:** These require tucking the thumb under three or two fingers. From a front-facing camera view, this causes heavy depth overlap (occlusion), making them hard to distinguish from normal fists.


