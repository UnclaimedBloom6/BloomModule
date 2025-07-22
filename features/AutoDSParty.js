import PartyV2 from "../../BloomCore/PartyV2"
import Config from "../Config"

let storedNames = [] // Store until the message of you joining the party actually appears in chat

register("guiMouseClick", (mx, my, btn, gui, event) => {
    if (!Player.getContainer() || Player.getContainer().getName() !== "Party Finder") return

    const slot = Client.currentGui.getSlotUnderMouse()
    if (!slot) return
    
    const item = Player.getContainer().getStackInSlot(slot.getIndex())
    if (!item) return
    let match = item.getName().match(/^(?:§.)+(\w+)'s Party$/)
    if (!match) return

    storedNames = []
    storedNames.push(match[1])

    const memberStartInd = item.getLore().indexOf("§5§o§f§7Members: ")

    if (memberStartInd == -1) {
        return
    }

    const nameLines = item.getLore().slice(memberStartInd+1, memberStartInd+6)
    
    for (let line of nameLines) {
        let match = line.match(/^§5§o §.(\w{1,16})§f: §e\w+§b \(§e(\d+)§b\)$/)
        if (!match || storedNames.includes(match[1])) continue

        storedNames.push(match[1])
    }
})

register("chat", (player, classs, level) => {
    if (player !== Player.getName() || !storedNames.length) return

    for (let i = 0; i < storedNames.length; i++) {
        let name = storedNames[i]
        PartyV2._addMember(name)

        // Leader will always be first in the list
        if (i == 0) {
            PartyV2.leader = name
        }
    }

    storedNames = []

    if (!Config.autoDSParty) return

    ChatLib.command("ds p", true)
}).setChatCriteria("Party Finder > ${player} joined the dungeon group! (${classs} Level ${*})")
