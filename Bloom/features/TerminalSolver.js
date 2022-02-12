import { isEnchanted } from "../utils/Utils"
import Config from "../Config"

class TerminalSolver {
    constructor() {
        const colorReplacements = {
            "light gray": "silver",
            "wool": "white",
            "bone": "white",
            "ink": "black",
            "lapis": "blue",
            "cocoa": "brown",
            "dandelion": "yellow",
            "rose": "red"
        }
        const windowNames = [
            "Correct all the panes!",
            "Select all the ",
            "What starts with: '",
            "Navigate the maze!",
            "Click in order!"
        ]
        
        const getInvItemsTo = (endIndex) => Array.from(Array(endIndex).keys()).filter(a => Player.getOpenedInventory().getStackInSlot(a))
        const filterPanesWithMeta = (array, meta) => array.filter(a => Player.getOpenedInventory().getStackInSlot(a).getRegistryName() == "minecraft:stained_glass_pane" && Player.getOpenedInventory().getStackInSlot(a).getMetadata() == meta) 
        const getStackFromIndex = (index) => Player.getOpenedInventory().getStackInSlot(index)
        const sortStackSize = (array) => array.sort((a, b) => getStackFromIndex(a).getStackSize() - getStackFromIndex(b).getStackSize())
        const fixColor = (itemName) => {
            Object.keys(colorReplacements).map(a => itemName = itemName.toLowerCase().replace(new RegExp(`^${a}`), colorReplacements[a]))
            return itemName
            
        }
        this.inTerm = false
        this.correctSlots = []
        register("tick", () => {
            if (!Config.terminalSolvers && !Config.zeroPingTerminals) return
            let inv = Player.getOpenedInventory()
            if (!inv) return
            this.inTerm = windowNames.some(a => inv.getName().startsWith(a))
            if (this.inTerm && this.correctSlots.length) return
            if (inv.getName() == "Correct all the panes!") {
                this.correctSlots = filterPanesWithMeta(getInvItemsTo(45), 14)
            }
            else if (inv.getName().startsWith("Select all the ")) {
                let color = inv.getName().match(/Select all the (.+) items!/)[1].toLowerCase()
                ChatLib.chat(color)
                this.correctSlots = getInvItemsTo(45).filter(a => fixColor(inv.getStackInSlot(a).getName().removeFormatting().toLowerCase()).startsWith(color)).filter(a => !isEnchanted(a))
            }
            else if (inv.getName().startsWith("What starts with: '")) {
                let letter = inv.getName().match(/What starts with: '(\w+)'?/)[1].toLowerCase()
                this.correctSlots = getInvItemsTo(45).filter(a => inv.getStackInSlot(a).getName().removeFormatting().toLowerCase().startsWith(letter)).filter(a => !isEnchanted(a))
            }
            else if (inv.getName() == "Navigate the maze!") {
                let greenPane = filterPanesWithMeta(getInvItemsTo(54), 5)
                let whitePanes = filterPanesWithMeta(getInvItemsTo(54), 0)
                let redPane = filterPanesWithMeta(getInvItemsTo(54), 14)
                const areAdjacent = (slot1, slot2) => [slot1%9==0 ? -1 : slot1-1, slot1%9==8 ? -1 : slot1+1, slot1+9, slot1-9].filter(a => a >= 0).some(a => a == slot2)
                this.correctSlots = []
                let unvisited = whitePanes
                let previous = greenPane
                while (!areAdjacent(previous, redPane)) {
                    let nextStep = unvisited.filter(a => areAdjacent(a, previous) && !this.correctSlots.includes(a))[0]
                    previous = nextStep
                    if (previous == null) break
                    this.correctSlots.push(nextStep)
                }
            }
            else if (inv.getName() == "Click in order!") {
                this.correctSlots = sortStackSize(filterPanesWithMeta(getInvItemsTo(35), 14))
            }
            else {
                this.inTerm = false
                this.correctSlots = []
            }
        })

        const highlightSlot = (slot, rgba) => {
            // From AlonAddons
            let x = slot % 9;
            let y = Math.floor(slot / 9);
            let renderX = Renderer.screen.getWidth() / 2 + ((x - 4) * 18);
            let renderY = (Renderer.screen.getHeight() + 10) / 2 + ((y - Player.getOpenedInventory().getSize() / 18) * 18);
            Renderer.translate(0, 0, 260);
            Renderer.drawRect(rgba ? Renderer.color(rgba[0], rgba[1], rgba[2], rgba[3]) : Renderer.color(0, 255, 0, 255), renderX - 8, renderY - 8, 16, 16);
        }

        register("guiRender", () => {
            if (!this.correctSlots.length || !this.inTerm) return
            let invName = Player.getOpenedInventory().getName()
            if (invName == "Click in order!" && Config.terminalSolvers) this.correctSlots.slice(0, 3).map((a, b, c) => highlightSlot(a, [0, 255 - (c.indexOf(a)*75), 255 - (c.indexOf(a)*75), 255]))
            if (["What starts with: '", "Select all the "].some(a => invName.includes(a)) && Config.terminalSolvers) this.correctSlots.map(a => highlightSlot(a))
            // if (invName == "Navigate the maze!" && Config.mazeHelper) this.correctSlots.map(a => highlightSlot(a, [255, 150, 150, 255]))
            if (invName == "Navigate the maze!" && Config.mazeHelper && Config.zeroPingTerminals) highlightSlot(this.correctSlots[0], [255, 150, 150, 255])
        })

        register("itemTooltip", (lore, item, event) => {
            if (this.inTerm) cancel(event)
        })
    }
}
export default new TerminalSolver()