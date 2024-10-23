
register("command", (count) => {
    // Custom number of pearls
    if (count) {
        const num = parseInt(count)
        if (isNaN(num)) return ChatLib.chat(`&c//superboom [amount]`)
        ChatLib.command(`gfs ender_pearl ${num}`, false)
        return
    }

    const stackSizes = Player.getInventory().getItems().filter(a => a?.getName() == "§9Superboom TNT").map(a => a.getStackSize())

    // No superboom in inventory
    if (!stackSizes.length) {
        ChatLib.command(`gfs superboom_tnt 64`, false)
        return
    }

    const toGive = 64 - Math.max(...stackSizes)
    if (toGive == 0) return
    
    ChatLib.command(`gfs superboom_tnt ${toGive}`, false)

}).setName("/superboom").setAliases(["/sb"])