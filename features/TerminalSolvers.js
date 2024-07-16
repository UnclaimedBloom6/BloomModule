
import { C0EPacketClickWindow, clickSlot, getSlotRenderPosition, highlightSlot, registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"

let correctSlots = []
let currentTerminalID = null

const Terminals = {
    NUMBERS: {id: 0, regex: /^Click in order!$/},
    COLORS: {id: 1, regex: /^Select all the (.+?) items!$/},
    STARTSWITH: {id: 2, regex: /^What starts with: '(.+?)'\?$/},
    RUBIX: {id: 3, regex: /^Change all to same color!$/},
    REDGREEN: {id: 4, regex: /^Correct all the panes!$/},
    MELODY: {id: 5, regex: /^Click the button on time!$/},
}

const colorReplacements = {
    "light gray": "silver",
    "wool": "white",
    "bone": "white",
    "ink": "black",
    "lapis": "blue",
    "cocoa": "brown",
    "dandelion": "yellow",
    "rose": "red",
    "cactus": "green"
}

const rubixOrder = [1, 4, 13, 11, 14]

const getSlotsWithPaneMeta = (items, meta) => {
    const final = []
    items.forEach((item, i) => {
        if (!item || item.getRegistryName() !== "minecraft:stained_glass_pane") return
        if (item.getMetadata() !== meta) return
        final.push(i)
    })
    return final
}

const fixColorItemName = (itemName) => {
    Object.entries(colorReplacements).forEach(([from, to]) => {
        itemName = itemName.replace(new RegExp(`^${from}`), to)
    })
    return itemName
}

const solveCurrentTerminal = (container, match) => {

    const invItems = container.getItems().slice(0, 55)

    if (currentTerminalID == Terminals.NUMBERS.id && Config.numbersTerminalSolver) {
        const redPanes = getSlotsWithPaneMeta(invItems, 14)
        redPanes.sort((a, b) => container.getStackInSlot(a).getStackSize() - container.getStackInSlot(b).getStackSize())
        correctSlots = redPanes
    }

    else if (currentTerminalID == Terminals.COLORS.id && Config.colorsTerminalSolver) {
        const targetColor = match.toLowerCase()
        correctSlots = invItems.reduce((a, item, i) => {
            if (!item || item.isEnchanted()) return a
            const fixedName = fixColorItemName(item.getName().removeFormatting().toLowerCase())
            if (!fixedName.startsWith(targetColor)) return a

            a.push(i)
            return a
        }, [])
    }

    else if (currentTerminalID == Terminals.STARTSWITH.id && Config.startsWithTerminalSolver) {
        const letter = match.toLowerCase()
        correctSlots = invItems.reduce((a, item, i) => {
            if (!item || !item.getName().removeFormatting().toLowerCase().startsWith(letter)) return a
            if (item.isEnchanted()) return a
            
            a.push(i)
            return a
        }, [])
    }

    else if (currentTerminalID == Terminals.RUBIX.id && Config.rubixTerminalSolver) {
        let leastClicks = null // [totalClicks, [...slotIndexes]]
        // The 3x3 area in the container where the panes spawn
        const paneIndexes = [12, 13, 14, 21, 22, 23, 30, 31, 32]
        const slotMetaMap = new Map()

        for (let slot of paneIndexes) {
            let item = container.getStackInSlot(slot)
            if (!item || item.getRegistryName() !== "minecraft:stained_glass_pane") return
            let meta = item.getMetadata()
            if (!rubixOrder.includes(meta)) continue
            slotMetaMap.set(slot, meta)
        }

        correctSlots = []
        for (let i = 0; i < rubixOrder.length; i++) {
            let clicks = 0 // Counting minimum clicks (Using left and right click)
            let slotClicks = [] // Left clicks only
            for (let index of paneIndexes) {
                let meta = slotMetaMap.get(index)
                let metaIndex = rubixOrder.indexOf(meta)

                let distance = metaIndex < i ? i - metaIndex : i + rubixOrder.length - metaIndex
                let actualDistance = distance
                // Account for right clicks
                if (actualDistance > 2) actualDistance = Math.abs(actualDistance - 5)
                clicks += actualDistance

                for (let j = 0; j < distance; j++) {
                    slotClicks.push(index)
                }
            }
            if (leastClicks == null || clicks < leastClicks[0]) {
                leastClicks = [clicks, slotClicks]
                correctSlots = slotClicks
            }
        }
    }
    
    else if (currentTerminalID == Terminals.REDGREEN.id) {
        correctSlots = getSlotsWithPaneMeta(invItems, 14)
    }
}

/**
 * Gets info about the current terminal, or null if not in a terminal
 */
const getCurrentTerminalInfo = () => {
    const inv = Player.getContainer()
    if (!inv) return null

    const invName = inv.getName()

    for (let e of Object.entries(Terminals)) {
        let [term, { id, regex }] = e

        let match = invName.match(regex)
        if (!match) continue

        return [id, inv, match[1]]
    }

    return null
}

register("tick", () => {
    if (!Config.terminalSolvers && !Config.terminalBlockWrongClicks) return

    const result = getCurrentTerminalInfo()

    if (result == null) {
        currentTerminalID = null
        correctSlots = []
        return
    }

    const [termId, inv, match] = result

    currentTerminalID = termId
    solveCurrentTerminal(inv, match)
})

register("guiRender", (mx, mt, gui) => {
    if (!Config.terminalSolvers || currentTerminalID == null || !correctSlots.length || currentTerminalID == Terminals.REDGREEN.id) return
    
    if (currentTerminalID == Terminals.NUMBERS.id) {
        correctSlots.slice(0, 3).forEach((slot, i) => {
            highlightSlot(gui, slot, 0, 1 - i*0.3, 1, 1, true, 400)
        })
        return
    }

    else if (currentTerminalID == Terminals.RUBIX.id) {
        const slotCounts = new Map()
        for (let slot of correctSlots) {
            slotCounts.set(slot, (slotCounts.get(slot) ?? 0) + 1)
        }
        for (let e of slotCounts.entries()) {
            let [index, count] = e
            // Convert 4 left clicks into 1 right click, 3 left into 2 right
            let displayNumber = count
            if (displayNumber > 2) displayNumber -= 5

            if (displayNumber == 0) continue

            let [x, y] = getSlotRenderPosition(index, gui)
            let renderStr = `${displayNumber < 0 ? "&7" : "&r"}${displayNumber}`
            // Center the number in the slot
            Renderer.translate(x+4, y+5, 275)
            Renderer.drawString(renderStr, 0, 0, true)
        }
        return
    }

    // Starts with and colors
    correctSlots.forEach(slot => {
        highlightSlot(gui, slot, 0, 1, 0, 1, false)
    })
})

// Hide wrong slots (For colors and startswith terminals)
registerWhen(register("renderSlot", (slot, gui, event) => {
    if (!Config.hideWrongTerminalItems || !correctSlots.length || currentTerminalID == null) return
    if (currentTerminalID !== Terminals.COLORS.id && currentTerminalID !== Terminals.STARTSWITH.id) return

    const slotIndex = slot.getIndex()
    const inv = Player.getContainer()
    if (slotIndex >= inv.getSize() - 36) return

    const item = Player.getContainer().getStackInSlot(slotIndex)
    if (item && item.getRegistryName() == "minecraft:stained_glass_pane") return

    if (correctSlots.includes(slot.getIndex())) return
    cancel(event)
}), () => Config.terminalSolvers && correctSlots.length)

// Hide terminal tooltips
register("itemTooltip", (lore, item, event) => {
    if (!Config.hideTerminalTooltips || currentTerminalID == null) return
    cancel(event)
})

register("guiMouseClick", (mc, my, btn, gui, event) => {
    if (currentTerminalID == null) return
    const termInfo = getCurrentTerminalInfo()
    if (!termInfo || (btn !== 0 && btn !== 1)) return

    const [termId, inv, group] = termInfo

    const clickedSlot = Client.currentGui.getSlotUnderMouse()
    if (!clickedSlot) return
    
    const index = clickedSlot.getIndex()

    // Block wrong clicks
    if (Config.terminalBlockWrongClicks && !correctSlots.includes(index) && correctSlots.length) {
        // ChatLib.chat(`Cancelled wrong click!`)
        cancel(event)
        return
    }

    // No item pickup
    if (!Config.terminalPreventItemPickup) return
    //                       .container.getgetNextTransactionID()      .inventory
    const nextActionNum = inv.container.func_75136_a(Player.getPlayer().field_71071_by)
    const windowId = inv.getWindowId()
    const ctItem = inv.getStackInSlot(index)
    const clickedItem = ctItem ? ctItem.itemStack : null
    // ChatLib.chat(`Clicked Slot: ${index}, Btn: ${btn}, Action: ${nextActionNum}`)
    // I hope to god this doesn't end up banning people somehow
    // It shouldn't though (pray)
    cancel(event)
    Client.sendPacket(new C0EPacketClickWindow(windowId, index, btn, 0, clickedItem, nextActionNum))

})

registerWhen(register("renderItemOverlayIntoGui", (item, x, y, event) => {
    if (currentTerminalID !== Terminals.NUMBERS.id || !correctSlots.length || item.getMetadata() !== 14) return 
    cancel(event)

    const stackSize = item.getStackSize().toString()
    const offset = stackSize.length == 2 ? 2 : 5.5

    Renderer.translate(x + offset, y + 4.5, 800);
    Renderer.drawString(stackSize, 0, 0, true)
}), () => correctSlots.length)

// register("packetSent", (p, e) => {
//     const ActionNumber = p.func_149547_f()
//     const ClickedItem = p.func_149546_g()
//     const Mode = p.func_149542_h()
//     const SlotId = p.func_149544_d()
//     const UsedButton = p.func_149543_e()
//     const WindowId = p.func_149548_c()
//     ChatLib.chat(`actionnum: &6${ActionNumber}&r, item: &6${ClickedItem}&r, mode: &6${Mode}&r, slotid: &6${SlotId}&r, btn: &6${UsedButton}&r, windid: &6${WindowId}&r`)
// }).setFilteredClass(C0EPacketClickWindow)