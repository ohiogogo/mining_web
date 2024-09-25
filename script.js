let worker;
let isPaused = false;
let hashCount = 0;
let currentNumberElement;
let resultElement;
let inputText, difficulty, initial_r;

function startCalculation() {
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

    // 启动 Web Worker
    worker = new Worker('worker.js');
    worker.postMessage({
        inputText: inputText,
        difficulty: difficulty,
        startR: initial_r,
        rangeSize: 1000000,
        target: BigInt(2) ** BigInt(256 - difficulty)
    });

    worker.onmessage = function(e) {
        if (e.data.progress) {
            // 更新进度和速度
            currentNumberElement.innerHTML = `
                当前正在检查的数字: ${e.data.r}<br>
                每秒哈希次数: ${e.data.speed}<br>
                已计算哈希次数: ${e.data.hashCount}<br>
                已经过的时间: ${e.data.elapsedTime} 秒
            `;
        }

        if (e.data.found) {
            resultElement.innerHTML = `
                找到结果，r = ${e.data.r}<br>
                哈希值: ${e.data.hash}<br>
                总哈希次数: ${e.data.hashCount}
            `;
            currentNumberElement.innerHTML = ""; // 清除进度
            worker.terminate(); // 任务完成后终止 worker
        }
    };
}

function pauseCalculation() {
    if (worker) {
        isPaused = true;
        worker.terminate(); // 暂停计算时终止 worker
        resultElement.innerHTML += "<br><span class='caption'>计算已暂停</span>";
    }
}

function stopCalculation() {
    if (worker) {
        worker.terminate(); // 完全停止计算
        worker = null;
        resultElement.innerHTML += "<br><span class='caption'>计算已终止</span>";
        currentNumberElement.innerHTML = "";
    }
}