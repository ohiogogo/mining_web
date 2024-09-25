let workers = [];
let isPaused = false;
let workerCount = 4;  // 可以根据设备性能调整线程数量
let workerStatus = new Array(workerCount).fill(false);
let hashCount = 0;
let currentNumberElement;
let resultElement;
let inputText, difficulty, initial_r;

function startCalculation() {
    if (isPaused) {
        isPaused = false;
        workers.forEach(worker => worker.postMessage({ inputText, difficulty }));
        return;
    }

    inputText = document.getElementById("inputText").value;
    difficulty = parseInt(document.getElementById("inputNumber").value);
    initial_r = parseInt(document.getElementById("initial_r").value);
    resultElement = document.getElementById("result");

    if (!inputText || isNaN(difficulty) || difficulty < 0 || difficulty > 256) {
        resultElement.innerHTML = "请输入有效的内容和难度（0-256之间）";
        return;
    }

    resultElement.innerHTML = "";
    currentNumberElement = document.getElementById("currentNumber");

    // 启动多个Web Workers
    const target = BigInt(2) ** BigInt(256 - difficulty);
    const rangeSize = 1000000;  // 每个 Worker 负责处理的 r 值范围

    for (let i = 0; i < workerCount; i++) {
        const worker = new Worker('worker.js');
        workers.push(worker);

        // 为每个 worker 设置不同的起点
        const startR = initial_r + i * rangeSize;

        worker.postMessage({
            inputText,
            difficulty,
            startR,
            rangeSize,
            target
        });

        worker.onmessage = function(e) {
            const { found, r, hash, hashCount, workerIndex } = e.data;
            if (found) {
                workers.forEach(w => w.terminate());  // 停止所有 worker
                resultElement.innerHTML = `
                    <span class="caption">找到结果，r = </span><span class="result">${r}</span><br>
                    <span class="caption">哈希值: </span><span class="result">${hash}</span><br>
                    <span class="caption">尝试次数: </span><span class="result">${hashCount}</span><br>
                `;
                currentNumberElement.innerHTML = "";
            } else {
                currentNumberElement.innerHTML = `Worker ${workerIndex}: 当前正在检查的数字: ${r}`;
            }
        };
    }
}

function pauseCalculation() {
    if (workers.length > 0) {
        isPaused = true;
        workers.forEach(worker => worker.terminate()); // 暂停计算时终止所有 worker
        resultElement.innerHTML += "<br><span class='caption'>计算已暂停</span>";
    }
}

function stopCalculation() {
    if (workers.length > 0) {
        workers.forEach(worker => worker.terminate()); // 完全停止计算
        workers = [];
        resultElement.innerHTML += "<br><span class='caption'>计算已终止</span>";
        currentNumberElement.innerHTML = "";
    }
}

function updateExpectedAttempts() {
    const inputNumber = parseInt(document.getElementById("inputNumber").value);
    const expectedAttemptsElement = document.getElementById("expectedAttempts");
    const expectedAttempts = 2 ** inputNumber;
    expectedAttemptsElement.innerHTML = `
        <span class="caption">预期尝试次数: </span><span class="result">${expectedAttempts.toLocaleString()}</span>`;
}

function clearResult() {
    document.getElementById("result").innerHTML = "";
}