let r;
let baseR;
let isCalculating = false;
let isPaused = false;
let hashCount;
let startTime;
let hashBigInt;
let target;
let inputNumber; // difficulty value
const updateInterval = 1000;
let currentNumberElement;
let resultElement;

function sha256(message) {
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

function startCalculation() {
    if (isPaused) {
        isPaused = false; // Resume calculation from the last state
        findR(document.getElementById("inputText").value);
        return;
    }

    const inputText = document.getElementById("inputText").value;
    inputNumber = parseInt(document.getElementById("inputNumber").value);
    const initial_r = parseInt(document.getElementById("initial_r").value);
    resultElement = document.getElementById("result");

    if (!inputText || isNaN(inputNumber) || inputNumber < 0 || inputNumber > 256) {
        resultElement.innerHTML = "Please enter a valid block content and difficulty between 0 and 256.";
        return;
    }

    resultElement.innerHTML = "";
    r = initial_r;
    baseR = initial_r;
    isCalculating = true;
    hashCount = 0;
    startTime = new Date().getTime();
    hashBigInt = BigInt("0x" + sha256(inputText + r));
    target = BigInt(2) ** BigInt(256 - inputNumber);

    currentNumberElement = document.getElementById("currentNumber");
    updateCalculationProgress(inputText);
    findR(inputText);
}

function updateCalculationProgress(inputText) {
    if (isCalculating) {
        const currentTime = new Date().getTime();
        const elapsedTime = (currentTime - startTime) / 1000;
        let speed = 0;
        let remainingTime = 0;

        if (elapsedTime > 0) {
            speed = hashCount / elapsedTime;
            const expectedAttempts = 2 ** inputNumber;
            const remainingAttempts = expectedAttempts - hashCount;
            remainingTime = remainingAttempts > 0 ? remainingAttempts / speed : 0;
        }

        currentNumberElement.innerHTML = `
          <span class="caption">Current number in inspection:</span> <span class="result">${r}</span><br>
          <span class="caption">Elapsed Time:</span> <span class="result">${elapsedTime.toFixed(0)} seconds</span><br>
          <span class="caption">Speed:</span> <span class="result">${speed.toFixed(2)} hashes per second</span><br>
          <span class="caption">Estimated Time Remaining:</span> <span class="result">${remainingTime.toFixed(2)} seconds</span>`;

        setTimeout(() => updateCalculationProgress(inputText), updateInterval);
    }
}

function findR(inputText) {
    if (!isCalculating || isPaused) {
        return;
    }

    for (let i = 0; i < updateInterval; i++) {
        const hash = sha256(inputText + r.toString());
        hashCount++;
        hashBigInt = BigInt("0x" + hash);

        if (hashBigInt < target) {
            isCalculating = false;
            const elapsedTime = (new Date().getTime() - startTime) / 1000;
            const speed = hashCount / elapsedTime;
            const inputWithR = inputText + (r + baseR);
            resultElement.innerHTML = `
                <span class="caption">Found! The number r is:</span> <span class="result">${r}</span><br>
                <span class="caption">Input text with r:</span> <span class="result">${inputWithR}</span><br>
                <span class="caption">SHA256 Hash Value:</span> <span class="result">${hash}</span><br>
                <span class="caption">Elapsed Time:</span> <span class="result">${elapsedTime.toFixed(2)} seconds</span><br>
                <span class="caption">Speed:</span><span class="result">${speed.toFixed(2)} hashes per second</span>`;
            currentNumberElement.innerHTML = "";
            break;
        }
        r++;
    }

    if (isCalculating) {
        setTimeout(() => findR(inputText), 0);
    }
}

// Pause functionality
function pauseCalculation() {
    if (isCalculating) {
        isPaused = true;
        isCalculating = false;
        resultElement.innerHTML += "<br><span class='caption'>Paused</span>";
    }
}

// Stop functionality
function stopCalculation() {
    if (isCalculating || isPaused) {
        isCalculating = false;
        isPaused = false;
        resultElement.innerHTML += "<br><span class='caption'>Stopped</span>";
        currentNumberElement.innerHTML = "";
    }
}

function updateExpectedAttempts() {
    inputNumber = parseInt(document.getElementById("inputNumber").value);
    const expectedAttemptsElement = document.getElementById("expectedAttempts");
    const expectedAttempts = 2 ** inputNumber;

    expectedAttemptsElement.innerHTML = `
        <span class="caption">Expected Attempts:</span> <span class="result">${expectedAttempts.toLocaleString()}</span>`;
}

function clearResult() {
    document.getElementById("result").innerHTML = "";
}