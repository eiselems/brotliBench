import fs from "fs";
import zlib from "zlib";

try {
    const data = fs.readFileSync("big_report.json");

    const uncompressedBuffer = Buffer.from(data);

    console.log(`Initial size: ${uncompressedBuffer.length/1024/1024}mb`)
    let maxTime, maxCompressed
    const maxCompressionForBenchmark = 8
    for (let i = maxCompressionForBenchmark; i >= 0; i--) {

        const startTime = process.hrtime();
        const compressedBuffer = zlib.brotliCompressSync(uncompressedBuffer, {
            params: {
                [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
                [zlib.constants.BROTLI_PARAM_QUALITY]: i
            }
        })
        const diff = process.hrtime(startTime);
        const timingSeconds = diff[0] + diff[1] / 1000000000
        const sizeAfter = compressedBuffer.length / 1024 / 1024
        const ratio = compressedBuffer.length / uncompressedBuffer.length * 100
        if (i === maxCompressionForBenchmark) {
            maxCompressed = compressedBuffer.length
            maxTime = timingSeconds
        }

        // const compressedSizeVsMaxCompression = ((uncompressedBuffer.length - compressedBuffer.length) / (uncompressedBuffer.length - maxCompressed)) * 100
        const compressedSizeVsMaxCompression = ((compressedBuffer.length - maxCompressed ) / maxCompressed * 100)
        const timeBenefit = timingSeconds / maxTime * 100

        console.log(`quality ${i}: Compressed size after: ${sizeAfter}mb (Percent: ${ratio}. Took ${timingSeconds}s).`)
        console.log(`Got: ${compressedSizeVsMaxCompression}% more size vs maxCompression on ${timeBenefit}% of time`);
        fs.writeFileSync("compressed_" + i + ".br", compressedBuffer);
    }

} catch (err) {
    console.error(err)
}