import { onOpenWindowPacket, onSetSlotReceived } from "../../BloomCore/utils/Events"
import ColorsTerminal from "../terminals/ColorsTerminal"
import NumbersTerminal from "../terminals/NumbersTerminal"
import RedGreenTerminal from "../terminals/RedGreenTerminal"
import RubixTerminal from "../terminals/RubixTerminal"
import StartsWithTerminal from "../terminals/StartsWithTerminal"
import MelodyTerminal from "../terminals/MelodyTerminal"
import Terminal from "../terminals/Terminal"
import Config from "../Config"


export default new class TerminalSolver {
    constructor() {

        /** @type {Terminal} */
        this.terminal = null

        // Unused if ZeroPingTerminals is not installed. Contains the Terminal type of the terminals with zero ping enabled
        this.zeroPingTerminals = []

        // For terminal timer
        this.lastTerminal = null

        register("tick", () => {
            if (!this.terminal) return
            const inv = Player.getContainer()
            if (!inv || inv.getName().removeFormatting() !== this.terminal.title) {
                // ChatLib.chat(`Terminal Closed!`)
                this.terminal = null
                return
            }
        })

        onOpenWindowPacket((...args) => this.onWindowOpen(...args))
        onSetSlotReceived((...args) => this.setSlotReceived(...args))

        register("renderSlot", (slot, gui, event) => {
            if (!this.terminal) return
            this.terminal.onSlotRender(slot, gui, event)
        })

        register("itemTooltip", (lore, item, event) => {
            if (!this.terminal || !Config.hideTerminalTooltips) return
            cancel(event)
        })
    }

    onWindowOpen(title, windowID, hasSlots, slotCount) {
        
        title = title.removeFormatting()
        
        if (this.terminal && title !== this.terminal.title) {
            // ChatLib.chat(`New contained opened`)
            this.terminal = null
        }

        if (this.terminal) return

        const startsWithMatch = title.match(/^What starts with: '(\w)'\?$/)
        if (startsWithMatch && Config.startsWithSolver) this.terminal = new StartsWithTerminal(title, slotCount, startsWithMatch[1])

        const rubixMatch = title.match(/^Change all to same color!$/)
        if (rubixMatch && Config.rubixSolver) this.terminal = new RubixTerminal(title, slotCount)

        const colorsMatch = title.match(/^Select all the ([\w ]+) items!$/)
        if (colorsMatch && Config.colorsSolver) this.terminal = new ColorsTerminal(title, slotCount, colorsMatch[1])

        const redGreenMatch = title.match(/^Correct all the panes!$/)
        if (redGreenMatch && Config.redGreenSolver) this.terminal = new RedGreenTerminal(title, slotCount)

        const numbersMatch = title.match(/^Click in order!$/)
        if (numbersMatch && Config.numbersSolver) this.terminal = new NumbersTerminal(title, slotCount)

        const melodyMatch = title.match(/^Click button on time!$/)
        if (melodyMatch) this.terminal = new MelodyTerminal(title, slotCount)
        
        if (!this.terminal) return
        // ChatLib.chat(`Terminal Created: ${this.terminal.name}`)
        this.lastTerminal = this.terminal

    }

    setSlotReceived(item, slot, windowID) {
        if (!this.terminal || slot >= this.terminal.windowSize || windowID == -1) return
        
        // Convert to CT item
        if (item) item = new Item(item)

        this.terminal.lastKnownWindowItems[slot] = item
        this.terminal.lastKnownWindowID = windowID
        
        // Terminal has not been fully loaded yet
        if (!this.terminal.initializedItems) {
            // ChatLib.chat(`Not initialized yet`)
            this.terminal.items[slot] = item
            this.terminal.windowID = windowID

            // The initial loading of items has been finished
            if (slot == this.terminal.windowSize-1) {
                this.terminal.initializedItems = true
                // ChatLib.chat(`&aInitialized terminal!`)
                // ChatLib.chat(`Doing initial solve!`)
                this.terminal.solve()
            }

        }

        // ChatLib.chat(JSON.stringify(this.zeroPingTerminals))
        // Update the item in the current version of the window. Don't update it if 0 ping is enabled.
        if (this.zeroPingTerminals.includes(this.terminal.type)) return

        this.terminal.items[slot] = item
        // ChatLib.chat(`Re-set slot ${slot}: ${item}, ${windowID}`)

        // Re-solve the terminal
        if (slot == this.terminal.windowSize-1) {
            // ChatLib.chat(`Solving!`)
            this.terminal.solve()
        }
    }
}