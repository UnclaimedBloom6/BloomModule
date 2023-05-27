import { Terminal, colorOrder, isEnchanted } from "../utils/Utils"
import Config from "../Config"
import { getSlotCenter } from "../../BloomCore/utils/Utils"
import Dungeon from "../../BloomCore/dungeons/Dungeon"

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

const getInvItemsTo = (container, endIndex) => Array.from(Array(endIndex).keys()).filter(a => container.getStackInSlot(a))
const filterPanesWithMeta = (container, array, meta) => array.filter(a => container.getStackInSlot(a).getRegistryName() == "minecraft:stained_glass_pane" && container.getStackInSlot(a).getMetadata() == meta) 
const filterPanesWithoutMeta = (container, array, meta) => array.filter(a => container.getStackInSlot(a).getRegistryName() == "minecraft:stained_glass_pane" && container.getStackInSlot(a).getMetadata() !== meta) 
const getStackFromIndex = (container, index) => container.getStackInSlot(index)
const sortStackSize = (container, array) => array.sort((a, b) => getStackFromIndex(container, a).getStackSize() - getStackFromIndex(container, b).getStackSize())
const fixColor = (itemName) => {
    Object.keys(colorReplacements).map(a => itemName = itemName.toLowerCase().replace(new RegExp(`^${a}`), colorReplacements[a]))
    return itemName
}

const terminalInvNames = {
    "Click the button on time!": Terminal.MELODY, // <-- you were a mistake
    "Click in order!": Terminal.NUMBERS,
    "Select all the ": Terminal.COLORS,
    "What starts with: '": Terminal.STARTSWITH,
    "Navigate the maze!": Terminal.MAZE, // rest in peace
    "Change all to same color!": Terminal.RUBIX,
    "Correct all the panes!": Terminal.REDGREEN,
}

export default new class TerminalSolver {

    constructor() {

        this.reset()

        register("tick", () => {
            if (!Dungeon.inDungeon || !Config.terminalSolvers) return this.reset()
            let inv = Player.getContainer()
            let invName = inv.getName()

            this.terminal = null
            Object.entries(terminalInvNames).forEach(([k, v]) => {
                if (!invName.startsWith(k)) return
                this.terminal = v
            })

            if (!this.terminal) return this.reset()

            if (this.correctSlots.length) return

            if (this.terminal == Terminal.MELODY) return
            if (this.terminal == Terminal.NUMBERS && !Config.numbersSolver) return
            if (this.terminal == Terminal.COLORS && !Config.colorsSolver) return
            if (this.terminal == Terminal.STARTSWITH && !Config.startsWithSolver) return
            if (this.terminal == Terminal.RUBIX && !Config.rubixSolver) return
            if (this.terminal == Terminal.REDGREEN && !Config.redGreenSolver) return

            this.solve(inv)
        })

        const highlightSlot = (slot, rgba) => {
            let [x, y] = getSlotCenter(slot)
            Renderer.translate(0, 0, 260);
            Renderer.drawRect(rgba ? Renderer.color(rgba[0], rgba[1], rgba[2], rgba[3]) : Renderer.color(0, 255, 0, 255), x - 8, y - 8, 16, 16);
        }

        const drawTextOnSlot = (slot, text) => {
            let [x, y] = getSlotCenter(slot)
            Renderer.translate(0, 0, 260);
            Renderer.drawString(text, x - 3, y - 3)
        }

        register("guiRender", () => {
            if (!this.correctSlots.length || !this.terminal || !Config.terminalSolvers) return
            if (this.terminal == Terminal.NUMBERS && Config.numbersSolver) this.correctSlots.slice(0, 3).forEach((v, i, arr) => highlightSlot(v, [0, 255 - (arr.indexOf(v)*75), 255 - (arr.indexOf(v)*75), 255]))
            if ([Terminal.STARTSWITH, Terminal.COLORS].includes(this.terminal)) this.correctSlots.forEach(a => highlightSlot(a))
            // if (invName == "Navigate the maze!" && Config.mazeHelper && Config.zeroPingTerminals) highlightSlot(this.correctSlots[0], [255, 150, 150, 255])
            if (this.terminal == Terminal.RUBIX && Config.rubixSolver) new Set(this.correctSlots).forEach(a => {
                let toClick = this.correctSlots.filter(b => b == a).length
                if (!Config.colorsRightClick) drawTextOnSlot(a, `&f&l${toClick}`)
                else drawTextOnSlot(a, `${toClick <= 2 ? "&f&l" + toClick : "&0&l" + (colorOrder.length-toClick)}`)
            })
        })
        
        register("itemTooltip", (lore, item, event) => {
            if (this.terminal && Config.hideTerminalTooltips) cancel(event)
        })
    }
    reset() {
        this.correctSlots = []
        this.terminal = null
    }
    solve(container) {
        let invName = container.getName()
        // ChatLib.chat("SOLVING")
        if (this.terminal == Terminal.REDGREEN) {
            this.correctSlots = filterPanesWithMeta(container, getInvItemsTo(container, 45), 14)
        }
        else if (this.terminal == Terminal.COLORS) {
            let color = invName.match(/Select all the (.+) items!/)[1].toLowerCase()
            this.correctSlots = getInvItemsTo(container, 45).filter(a => fixColor(container.getStackInSlot(a).getName().removeFormatting().toLowerCase()).startsWith(color)).filter(a => !isEnchanted(a))
        }
        else if (this.terminal == Terminal.STARTSWITH) {
            let letter = invName.match(/What starts with: '(\w+)'?/)[1].toLowerCase()
            this.correctSlots = getInvItemsTo(container, 45).filter(a => container.getStackInSlot(a).getName().removeFormatting().toLowerCase().startsWith(letter)).filter(a => !isEnchanted(a))
        }
        // else if (invName == "Navigate the maze!") {
        //     let greenPane = filterPanesWithMeta(getInvItemsTo(54), 5)
        //     let whitePanes = filterPanesWithMeta(getInvItemsTo(54), 0)
        //     let redPane = filterPanesWithMeta(getInvItemsTo(54), 14)
        //     const areAdjacent = (slot1, slot2) => [slot1%9==0 ? -1 : slot1-1, slot1%9==8 ? -1 : slot1+1, slot1+9, slot1-9].filter(a => a >= 0).some(a => a == slot2)
        //     this.correctSlots = []
        //     let unvisited = whitePanes
        //     let previous = greenPane
        //     while (!areAdjacent(previous, redPane)) {
        //         let nextStep = unvisited.filter(a => areAdjacent(a, previous) && !this.correctSlots.includes(a))[0]
        //         previous = nextStep
        //         if (previous == null) break
        //         this.correctSlots.push(nextStep)
        //     }
        // }
        else if (this.terminal == Terminal.NUMBERS) {
            this.correctSlots = sortStackSize(container, filterPanesWithMeta(container, getInvItemsTo(container, 35), 14))
        }
        else if (this.terminal == Terminal.RUBIX) {
            // I hope to god this never breaks.
            this.correctSlots = colorOrder.map((v, i) => filterPanesWithoutMeta(container, getInvItemsTo(container, 45), 15).map(a => Array(Math.abs(colorOrder.length-1 - (colorOrder.indexOf(container.getStackInSlot(a).getMetadata())+i)%colorOrder.length)).fill(a)).reduce((a, b) => a.concat(b), [])).sort((a, b) => a.length - b.length)[0]
        }
    }
}
