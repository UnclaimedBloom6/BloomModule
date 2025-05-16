import PartyV2 from "../../BloomCore/PartyV2"
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { onChatPacket } from "../../BloomCore/utils/Events"
import Config from "../Config"

const completed = new Map() // "player": {terminal: 0, device: 0, lever: 0}

// Set everything to 0 when P3 starts
onChatPacket(() => {
    completed.clear()
    Dungeon.party.forEach(player => {
        completed.set(player, {terminal: 0, device: 0, lever: 0})
    })
}).setCriteria("[BOSS] Goldor: Who dares trespass into my domain?")

// Listen for completed terms/devices/levers
onChatPacket((player, type) => {
    if (!Config.terminalTracker || !completed.has(player)) {
        return
    }

    const data = completed.get(player)
    data[type]++
}).setCriteria(/^(\w{1,16}) (?:activated|completed) a (\w+)! \(\d\/\d\)$/)

// Print the completed stuff to chat
register("chat", () => {
    if (!Config.terminalTracker) {
        return
    }

    completed.forEach((data, player) => {
        const formatted = PartyV2.getFormattedName(player)

        ChatLib.chat(`${formatted} &8| &6${data.terminal} &aTerminals &8| &6${data.device} &aDevices &8| &6${data.lever} &aLevers`)
    })
}).setCriteria("The Core entrance is opening!")

register("worldUnload", () => {
    completed.clear()
})