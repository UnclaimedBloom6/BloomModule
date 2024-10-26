import { getSkyblockItemID } from "../../BloomCore/utils/Utils"

register("command", (count) => {
    // Custom number of pearls
    if (count) {
        const num = parseInt(count)
        if (isNaN(num)) return ChatLib.chat(`&c/enderpearl [amount]`)
        ChatLib.command(`gfs ender_pearl ${num}`, false)
        return
    }

    const pearlStack = Player.getInventory().getItems().find(a => getSkyblockItemID(a) == "ENDER_PEARL")

    // No ender pearls in inventory
    if (!pearlStack) {
        ChatLib.command(`gfs ender_pearl 16`, false)
        return
    }

    const toGive = 16 - pearlStack.getStackSize()
    if (toGive == 0) return
    ChatLib.command(`gfs ender_pearl ${toGive}`, false)

}).setName("/enderpearl").setAliases(["/ep"])