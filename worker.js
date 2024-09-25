// 引入 asmCrypto
importScripts('https://cdnjs.cloudflare.com/ajax/libs/asmCrypto.js/2.3.2/asmcrypto.all.min.js');

onmessage = function(e) {
    const { inputText, difficulty, startR, rangeSize, target } = e.data;
    let r = startR;
    const endR = startR + rangeSize;
    let hashCount = 0;

    while (r < endR) {
        // 使用 asmCrypto 进行 SHA-256 计算
        const hash = asmCrypto.SHA256.hex(inputText + r);
        hashCount++;
        const hashBigInt = BigInt("0x" + hash);

        if (hashBigInt < target) {
            postMessage({
                found: true,
                r: r,
                hash: hash,
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