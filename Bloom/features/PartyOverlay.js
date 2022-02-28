import Config from "../Config"
import Party from "../utils/Party"
import { data } from "../Utils/Utils"

register("dragged", (dx, dy, x, y) => {
    if (Config.partyOverlayMoveGui.isOpen()) {
        data.party.x = x
        data.party.y = y
        data.save()
    }
})

register("renderOverlay", () => {
    if (Config.partyOverlayMoveGui.isOpen() || Config.partyOverlay) {
        let str = `&cParty (&6${Object.keys(Party.members).length}&c)`
        Object.keys(Party.members).forEach(member => {
            if (member == Party.leader) { str += `\n&6♔ &r${Party.members[member]}` }
            else if (Party.excludePlayers.includes(member)) { str += `\n&c✘ &r${Party.members[member]}` }
            else { str += `\n${Party.members[member]}` }
        })
        Renderer.drawString(str, data.party.x, data.party.y)
    }
})