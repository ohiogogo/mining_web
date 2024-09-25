onmessage = async function(e) {
    const { inputText, difficulty, startR, rangeSize, target } = e.data;
    let r = startR;
    const endR = startR + rangeSize;
    let hashCount = 0;
    const startTime = Date.now(); // 记录开始时间

    while (r < endR) {
        const data = new TextEncoder().encode(inputText + r);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data); // 使用 WebCrypto 进行哈希计算
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        hashCount++;
        const hashBigInt = BigInt("0x" + hashHex);

        // 每1000次哈希计算后，发送进度更新
        if (hashCount % 1000 === 0) {
            const elapsedTime = (Date.now() - startTime) / 1000; // 计算经过的时间（秒）
            const speed = hashCount / elapsedTime; // 计算每秒的哈希次数
            postMessage({
                progress: true,
                r: r,
                speed: speed.toFixed(2), // 每秒的哈希次数
                elapsedTime: elapsedTime.toFixed(2), // 已经过的时间
                hashCount: hashCount
            });
        }

        if (hashBigInt < target) {
            postMessage({
                found: true,
                r: r,
                hash: hashHex,
                hashCount: hashCount
            });
            break;
        }
        r++;
    }

    // 如果没有找到合适的 r 值
    postMessage({
        found: false,
        r: endR,
        hashCount: hashCount
    });
};