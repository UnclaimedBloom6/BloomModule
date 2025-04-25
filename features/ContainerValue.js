import PriceUtils from "../../BloomCore/PriceUtils"
import { onOpenWindowPacket, onWindowItemsPacket } from "../../BloomCore/utils/Events"
import { C0DPacketCloseWindow, fn, sortObjectByValues } from "../../BloomCore/utils/Utils"
import Config from "../Config"

let inContainer = false
let invSize = null
let dontResetNext = false
let renderData = null

const containerNames = [
    /^\w+ Backpack§r \(Slot #\d{1,2}\)§r$/,
    /^Ender Chest \(\d+\/\d+\)§r$/,
    /^§rWardrobe \(\d+\/\d+\)§r$/,
    /^Chest§r$/,
    /^Large Chest§r$/
]

onOpenWindowPacket((title, windowid, hasSlots, slotCount, guiID, entityID, event) => {
    if (!Config.containerValue) return
    if (!containerNames.some(a => title.match(a))) return
    
    invSize = slotCount
    inContainer = true
    dontResetNext = true
})

const reset = () => {
    if (!Config.containerValue || dontResetNext) return dontResetNext = false

    inContainer = false
    invSize = null
    guiRenderer.unregister()
    renderData = null
}

register("guiClosed", reset)
register("packetSent", reset).setFilteredClass(C0DPacketCloseWindow)

onWindowItemsPacket((items) => {
    if (!Config.containerValue || !inContainer) return

    let currentItems = {} // {"Legion I": {value: 1000000, amount:3}, ...}

    for (let i = 0; i < items.length && i < invSize; i++) {
        if (!items[i]) continue

        let item = new Item(items[i])
        let itemName = item.getName()
        
        let value = PriceUtils.getItemValue(items[i])
        
        if (itemName.removeFormatting() == "Enchanted Book") {
            let lore = item.getLore()
            if (lore.length < 1) continue

            itemName = lore[1]

            if (Config.containerValueCraftBooks) {
                value = PriceUtils.getBookPriceWhenCrafted(item)
            }
        }
        
        if (value == null) continue

        if (!(itemName in currentItems)) currentItems[itemName] = {
            amount: 0,
            value: value
        }

        currentItems[itemName].amount += item.getStackSize()
    }

    // Make the string and set up the render variables
    const sorted = sortObjectByValues(currentItems, false, (a, b) => currentItems[b].amount * currentItems[b].value - currentItems[a].amount * currentItems[a].value)
    const lines = []

    let totalValue = 0
    Object.entries(sorted).forEach(([k, v]) => {
        const itemValue = v.amount * v.value
        totalValue += itemValue
        lines.push(`&7${v.amount}x &r${k}: &6${fn(Math.floor(itemValue))}`)
    })
    lines.splice(0, 0, `&aTotal Value: &6${fn(Math.floor(totalValue))}`)

    renderData = {
        x: 10,
        y: 10,
        string: lines.join("\n"),
        textWidth: Math.max(...lines.map(a => Renderer.getStringWidth(a))),
        textHeight: lines.length * 9,
    }

    guiRenderer.register()
})

const guiRenderer = register("guiRender", () => {
    Renderer.retainTransforms(true)
    Renderer.translate(renderData.x, renderData.y)
    Renderer.drawRect(Renderer.color(0, 0, 0, 175), 0, 0, renderData.textWidth + 10, renderData.textHeight + 10)
    Renderer.drawString(renderData.string, 5, 5)
    Renderer.retainTransforms(false)
}).unregister()