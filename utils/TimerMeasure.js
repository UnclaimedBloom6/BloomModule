
const S32PacketConfirmTransaction = Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction")

// Active timers here as {ticksLeft: TICKS, onComplete: Function}
const funcs = []

const packetListener = register("packetReceived", () => {
    // Decrement each tick counter in the array
    for (let i = 0; i < funcs.length; i++) {
        let thing = funcs[i]
        thing.ticksLeft--

        // Timer not finished
        if (thing.ticksLeft > 0) continue
        
        // This timer has finished
        thing.onComplete()
        funcs.splice(i, 1)
    }

    // Unregister this listener if there's nothing left
    if (funcs.length == 0) {
        packetListener.unregister()
    }
}).setFilteredClass(S32PacketConfirmTransaction).unregister()

/**
 * Runs a function after a certain amount of server ticks has passed
 * @param {Number} ticks 
 * @param {Function} onComplete 
 */
export const waitServerTicks = (ticks, onComplete) => {
    funcs.push({
        ticksLeft: ticks,
        onComplete
    })

    packetListener.register()
}

/**
 * Runs a function after a certain amount of server ticks has passed
 * @param {Number} ticks 
 * @param {Function} onComplete 
 */
export const waitServerTime = (ms, onComplete) => waitServerTicks(Math.floor(ms / 50), onComplete)
