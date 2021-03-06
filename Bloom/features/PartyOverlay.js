import Config from "../Config"
import { data } from "../Utils/Utils"
import Party from "../../BloomCore/Party"

register("dragged", (dx, dy, x, y, btn) => {
    if (!Config.partyOverlayMoveGui.isOpen()) return
    data.party.x = x
    data.party.y = y
    data.save()
})

register("renderOverlay", () => {
    if (!Config.partyOverlayMoveGui.isOpen() && !Config.partyOverlay) return
    if (!Object.keys(Party.members).length) return
    let str = `&cParty (&6${Object.keys(Party.members).length}&c)`
    Object.keys(Party.members).forEach(member => {
        if (member == Party.leader) str += `\n&6ā &r${Party.members[member]}`
        else if (Party.excludePlayers.includes(member)) str += `\n&cā &r${Party.members[member]}`
        else str += `\n${Party.members[member]}`
    })
    Renderer.drawString(str, data.party.x, data.party.y)
})