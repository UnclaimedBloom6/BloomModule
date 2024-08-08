import ScalableGui from "../../../BloomCore/utils/ScalableGui"
import { data } from "../../utils/Utils"
import Config from "../../Config"
import { readFileLines, registerWhen } from "../../../BloomCore/utils/Utils"
import { ChestItem, DungeonChest, alwaysBuy, chestData } from "./chestUtils"
import Dungeon from "../../../BloomCore/dungeons/Dungeon"

let openedChests = []
let renderStr = null

const editGui = new ScalableGui(data, data.dungeonChestProfit).setCommand("editdungeonlootlocation")
const exampleText = readFileLines("Bloom", "features/dungeonChestProfit/exampleText.txt").join("\n")

const renderProfitGui = () => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    let textToDraw = renderStr ?? exampleText

    // Draw the background
    if (Config.dungeonChestProfitBackground) {
        const lines = textToDraw.split("\n")

        let width = Math.max(...lines.map(a => Renderer.getStringWidth(a)))
        let height = lines.length * 9
        Renderer.drawRect(Renderer.color(0, 0, 0, 175), -2, -2, width+10, height+2)
    }

    Renderer.drawString(textToDraw, 0, 0)

    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

registerWhen(register("renderOverlay", () => {
    if (!renderStr || !Config.dungeonChestProfit) return
    renderProfitGui()
}), () => !!renderStr && Config.dungeonChestProfit)

editGui.onRender(() => {
    const centerX = Renderer.screen.getWidth() / 2
    const centerY = Renderer.screen.getHeight() / 2
    const lines = [
        "Scroll to change the scale.",
        "Click anywhere to move."
    ]

    lines.forEach((line, i) => {
        const dx = - Renderer.getStringWidth(line) / 2
        Renderer.drawString(line, centerX + dx, centerY - (9*lines.length) / 2 + i*9, true)
    })

    renderProfitGui()
})

// The actual stuff now

const sortChests = () => openedChests.sort((a, b) => {
    // Force valuable drops to be opened first, even if their price has been manipulated
    if (b.items.some(c => alwaysBuy.has(c.itemID))) return Infinity
    
    return b.profit - a.profit
})

const updateRenderString = () => {
    renderStr = openedChests.map(a => a.getChestStr()).join("\n")
}

register("tick", () => {
    if (!Config.dungeonChestProfit) return

    let inv = Player.getContainer()
    let match = inv.getName().match(/^(\w+) Chest$/)
    if (!match) return

    let [_, chestName] = match
    if (!(chestName in chestData)) return

    // Coin cost
    let nugget = inv.getStackInSlot(31)

    // Row of loot, with glass panes filtered out.
    let items = inv.getItems().slice(9, 18).filter(a => a && a?.getID() !== 160)

    // Initialize a new chest to store all of the items in.
    const chest = new DungeonChest(chestName)

    if (!nugget) return // The whole chest isn't loaded yet
    
    // Check if the gold nugget has been loaded, then grab the coin cost from it's lore.
    let lore = nugget.getLore()
    // Parse the chest cost from the lore.
    if (nugget && lore.length >= 7) {
        let match = lore[7].removeFormatting().match(/^([\d,]+) Coins$/)
        if (match) chest.cost = parseInt(match[1].replace(/,/g, ""))
    }
    
    // Update the chest items, value and profit and update the render string.
    chest.items = items.map(a => new ChestItem(a))
    chest.calcValueAndProfit()

    // If this chest exists already then delete it. This will also update the chest contents after a reroll.
    const existingInd = openedChests.findIndex(a => a.name == chestName)
    if (existingInd !== -1) openedChests.splice(existingInd, 1)

    openedChests.push(chest)

    sortChests()
    updateRenderString()
})

register("worldUnload", () => {
    openedChests = []
    renderStr = null
})