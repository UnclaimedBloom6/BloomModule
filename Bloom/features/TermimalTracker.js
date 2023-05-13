import Party from "../../BloomCore/Party"
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import Config from "../Config"

const Completed = new Map() // "player": {terminal: 0, device: 0, lever: 0}

// Set everything to 0 when P3 starts
register("chat", () => {
    Completed.clear()
    Dungeon.party.forEach(player => {
        Completed.set(player, {terminal: 0, device: 0, lever: 0})
    })
}).setCriteria("[BOSS] Goldor: Who dares trespass into my domain?")

// Listen for completed terms/devices/levers
register("chat", (player, type) => {
    if (!Config.terminalTracker || !Completed.has(player)) return
    const data = Completed.get(player)
    data[type]++
}).setCriteria(/^(\w{1,16}) (?:activated|completed) a (\w+)! \(\d\/\d\)$/)

// Print the completed stuff to chat
register("chat", () => {
    if (!Config.terminalTracker) return
    Completed.forEach((data, player) => {
        let formatted = player
        if (Object.keys(Party.members).includes(player)) formatted = Party.members[player]
        ChatLib.chat(`${formatted} &8| &6${data.terminal} &aTerminals &8| &6${data.device} &aDevices &8| &6${data.lever} &aLevers`)
    })
}).setCriteria("The Core entrance is opening!")

register("worldUnload", () => {
    Completed.clear()
})