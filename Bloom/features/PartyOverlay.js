import Config from "../Config"
import { data } from "../utils/Utils"
import Party from "../../BloomCore/Party"

register("dragged", (dx, dy, x, y, btn) => {
    if (!Config.partyOverlayMoveGui.isOpen()) return
    data.party.x = x
    data.party.y = y
    data.save()
})

let partyStr = null
register("tick", () => {
    if (!Config.partyOverlayMoveGui.isOpen() && !Config.partyOverlay) return partyStr = null
    if (!Object.keys(Party.members).length) return partyStr = null
    partyStr = `&cParty (&6${Object.keys(Party.members).length}&c)`
    Object.keys(Party.members).forEach(member => {
        if (member == Party.leader) partyStr += `\n&6♔ &r${Party.members[member]}`
        else if (Party.excludePlayers.includes(member)) partyStr += `\n&c✘ &r${Party.members[member]}`
        else partyStr += `\n${Party.members[member]}`
    })
})

register("renderOverlay", () => {
    if (!partyStr) return
    Renderer.drawString(partyStr, data.party.x, data.party.y)
})