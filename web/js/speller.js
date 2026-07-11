// SensiSign AI - Speller Controller
class SpellerController {
    static init() {
        this.outputArea = document.getElementById("spelledText");
        
        document.getElementById("btnBackspace").addEventListener("click", () => this.backspace());
        document.getElementById("btnSpace").addEventListener("click", () => this.space());
        document.getElementById("btnSpeak").addEventListener("click", () => this.speak());
        document.getElementById("btnClearText").addEventListener("click", () => this.clear());
    }

    static handleHold(letter) {
        const state = window.appState;
        const now = Date.now();
        
        if (state.activeHoldLetter !== letter) {
            state.activeHoldLetter = letter;
            state.activeHoldStart = now;
        } else {
            const elapsed = now - state.activeHoldStart;
            if (elapsed >= 1200) { // 1.2s to add a letter in speller mode
                this.append(letter);
                state.activeHoldStart = now;
                window.AudioController.playBeep('tick');
            }
        }
    }

    static append(char) {
        const state = window.appState;
        if (state.spellerText.length === 0) {
            this.outputArea.innerHTML = "";
        }
        state.spellerText += char;
        this.outputArea.innerText = state.spellerText;
        this.outputArea.scrollTop = this.outputArea.scrollHeight;
    }

    static backspace() {
        const state = window.appState;
        window.AudioController.playBeep('skip');
        if (state.spellerText.length > 0) {
            state.spellerText = state.spellerText.slice(0, -1);
            if (state.spellerText.length === 0) {
                this.outputArea.innerHTML = `<span class="text-placeholder">Spell words by holding hand gestures in front of the camera...</span>`;
            } else {
                this.outputArea.innerText = state.spellerText;
            }
        }
    }

    static space() {
        const state = window.appState;
        window.AudioController.playBeep('tick');
        if (state.spellerText.length > 0 && state.spellerText[state.spellerText.length - 1] !== " ") {
            state.spellerText += " ";
            this.outputArea.innerText = state.spellerText;
        }
    }

    static speak() {
        const state = window.appState;
        window.AudioController.speak(state.spellerText || "No text to speak");
    }

    static clear() {
        const state = window.appState;
        window.AudioController.playBeep('skip');
        state.spellerText = "";
        this.outputArea.innerHTML = `<span class="text-placeholder">Spell words by holding hand gestures in front of the camera...</span>`;
    }
}

window.SpellerController = SpellerController;
