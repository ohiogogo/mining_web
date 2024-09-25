importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js');

onmessage = function(e) {
    const { inputText, difficulty, startR } = e.data;
    let r = startR;
    const target = BigInt(2) ** BigInt(256 - difficulty);
    let hashCount = 0;

    while (true) {
        const hash = CryptoJS.SHA256(inputText + r).toString(CryptoJS.enc.Hex);
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
};