

register("command", (count) => {
    // Custom number of pearls
    if (count) {
        const num = parseInt(count)
        if (isNaN(num)) return ChatLib.chat(`&c//spiritleap [amount]`)
        ChatLib.command(`gfs spirit leap ${num}`, false)
        return
    }

    const stackSizes = Player.getInventory().getItems().filter(a => a?.getName() == "§9Spirit Leap").map(a => a.getStackSize())

    // No superboom in inventory
    if (!stackSizes.length) {
        ChatLib.command(`gfs spirit leap 16`, false)
        return
    }

    const toGive = 16 - Math.max(...stackSizes)
    if (toGive == 0) return
    
    ChatLib.command(`gfs spirit leap ${toGive}`, false)

}).setName("/spiritleap").setAliases(["/sl"])