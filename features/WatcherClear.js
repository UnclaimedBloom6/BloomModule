import { waitServerTime } from "../utils/TimerMeasure"
import Config from "../Config"
import { onChatPacket } from "../../BloomCore/utils/Events"

let targetServerTime = 22_000 // 22 Seconds
let bloodOpen = false

register("worldUnload", () => {
    bloodOpen = false
})

const displayCountdown = (seconds, onDone) => {
    // Countdown is done!
    Client.showTitle("", `&a0`, 0, 20, 0)

    if (seconds <= 0) {
        onDone()
        return
    }

    Client.showTitle("", `&a${seconds}`, 0, 20, 0)

    // Decrement one second
    waitServerTime(1000, () => displayCountdown(seconds - 1, onDone))
}

const showKillMobsMessage = () => {
    ChatLib.chat("&6Kill Mobs")
    Client.showTitle("", "&c&lKill Blood Mobs", 0, 30, 0)
    World.playSound("fireworks.twinkle", 100, 1)
}

onChatPacket(() => {
    if (!Config.watcherClear || bloodOpen) return
    
    ChatLib.chat("&cBlood Opened.")
    bloodOpen = true
    
    waitServerTime(targetServerTime, () => {
        displayCountdown(3, showKillMobsMessage)
    })
}).setCriteria(/^\[BOSS\] The Watcher: .+$/)