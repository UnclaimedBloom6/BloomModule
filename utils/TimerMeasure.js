const S32PacketConfirmTransaction = Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction");

let tickCount = 0;
let startTime = null;
let endTime = null;
let measuring = false;
const targetDuration = 25 * 1000;

export const startMeasuring = () => {
    tickCount = 0;
    startTime = new Date().getTime();
    endTime = startTime + targetDuration;
    measuring = true;
    //ChatLib.chat('Started measuring server time...');
}

export const getCurrentTime = () => {

    const actualDuration = new Date().getTime() - startTime;
    const actualDurationSeconds = actualDuration / 1000;
    const serverTPS = tickCount / actualDurationSeconds;
    const perceivedDuration = (tickCount / 20) * 1000;

    // ChatLib.chat(`Measured server time: ${tickCount} ticks`);
    // ChatLib.chat(`Actual duration: ${actualDurationSeconds.toFixed(2)} seconds`);
    // ChatLib.chat(`Server TPS: ${serverTPS.toFixed(2)}`);
    // ChatLib.chat(`Perceived duration: ${(perceivedDuration / 1000).toFixed(2)} seconds`);
    return { actualDuration, tickCount };
}

export const stopMeasuring = () => {
    measuring = false;
}

register("packetReceived", (packet, event) => {
    if (measuring && packet instanceof S32PacketConfirmTransaction) {
        tickCount++;
    }
}).setFilteredClass(S32PacketConfirmTransaction);

register("command", () => {
    startMeasuring();
}).setName("measuretime");

