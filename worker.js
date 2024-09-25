onmessage = async function(e) {
    const { inputText, difficulty, startR, rangeSize, target } = e.data;
    let r = startR;
    const endR = startR + rangeSize;
    let hashCount = 0;

    while (r < endR) {
        const data = new TextEncoder().encode(inputText + r);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data); // 使用 WebCrypto 进行哈希计算
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        hashCount++;
        const hashBigInt = BigInt("0x" + hashHex);

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