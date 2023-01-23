import Party from "../../BloomCore/Party"
import { prefix } from "../utils/Utils"

export const dontRp = register("command", player => {
    if (!player) return ChatLib.chat(`${prefix} &c/dontrp <player>`)
    if (player == Player.getName()) return ChatLib.chat(`${prefix} &cCan't add yourself !`)
    for (let i = 0; i < Party.excludePlayers.length; i++) {
        if (Party.excludePlayers[i] !== player) continue
        Party.excludePlayers.splice(i, 1)
        return ChatLib.chat(`${prefix} &aRemoved &c${player} &afrom the exclude list!`)
    }
    if (!Object.keys(Party.members).includes(player)) return ChatLib.chat(`${prefix} &c${player} is not in the Party!`)
    ChatLib.chat(`${prefix} &aAuto Reparty won't invite &c${player} &anext time!`)
    Party.excludePlayers.push(player)
}).setName("dontrp")
