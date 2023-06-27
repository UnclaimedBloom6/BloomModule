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
        this.openPacketReceivedThisTick = false

        // Unused if ZeroPingTerminals is not installed. Contains the Terminal type of the terminals with zero ping enabled
        this.zeroPingTerminals = []

        // For terminal timer
        this.lastTerminal = null

        register("guiClosed", () => {
            if (!this.terminal) return

            // Wait until the end of the tick.
            // If no open window packet has been received, then the terminal was actually closed.
            // Otherwise, it was just the window being updated.
            Client.scheduleTask(0, () => {
                if (!this.openPacketReceivedThisTick) {
                    // ChatLib.chat(`Terminal Closed`)
                    this.terminal = null
                }
                this.openPacketReceivedThisTick = false

            })
        })

        onOpenWindowPacket((title, windowID, hasSlots, slotCount) => {
            if (!Config.terminalSolvers) return

            title = title.removeFormatting()
            
            if (this.terminal && title !== this.terminal.title) this.terminal = null
            if (this.terminal) return this.openPacketReceivedThisTick = true

            const startsWithMatch = title.match(/^What starts with: '(\w)'\?$/)
            if (startsWithMatch && Config.startsWithSolver) this.terminal = new StartsWithTerminal(title, slotCount, startsWithMatch[1])

            const rubixMatch = title.match(/^Change all to same color!$/)
            if (rubixMatch && Config.rubixSolver) this.terminal = new RubixTerminal(title, slotCount)

            const colorsMatch = title.match(/^Select all the (\w+) items!$/)
            if (colorsMatch && Config.colorsSolver) this.terminal = new ColorsTerminal(title, slotCount, colorsMatch[1])

            const redGreenMatch = title.match(/^Correct all the panes!$/)
            if (redGreenMatch && Config.redGreenSolver) this.terminal = new RedGreenTerminal(title, slotCount)

            const numbersMatch = title.match(/^Click in order!$/)
            if (numbersMatch && Config.numbersSolver) this.terminal = new NumbersTerminal(title, slotCount)

            const melodyMatch = title.match(/^Click button on time!$/)
            if (melodyMatch) this.terminal = new MelodyTerminal(title, slotCount)
            
            this.lastTerminal = this.terminal
            if (!this.terminal) return

        })

        onSetSlotReceived((item, slot, windowID) => {
            if (!this.terminal || slot >= this.terminal.windowSize || windowID == -1) return
            
            // Convert to CT item
            if (item) item = new Item(item)

            this.terminal.lastKnownWindowItems[slot] = item
            this.terminal.lastKnownWindowID = windowID
            
            // Terminal has not been fully loaded yet
            if (!this.terminal.initializedItems) {
                this.terminal.items[slot] = item
                this.terminal.windowID = windowID

                // The initial loading of items has been finished
                if (slot == this.terminal.windowSize-1) {
                    this.terminal.initializedItems = true
                    this.terminal.solve()
                }
            }
            
            // Update the item in the current version of the window. Don't update it if 0 ping is enabled.
            if (!this.zeroPingTerminals.includes(this.terminal.type)) {
                this.terminal.items[slot] = item

                // Re-solve the terminal
                if (slot == this.terminal.windowSize-1) {
                    // ChatLib.chat(`Solving !`)
                    this.terminal.solve()
                }
            }
        })

        register("renderSlot", (slot, gui, event) => {
            if (!this.terminal) return
            this.terminal.onSlotRender(slot, gui, event)
        })

        register("itemTooltip", (lore, item, event) => {
            if (!this.terminal || !Config.hideTerminalTooltips) return
            cancel(event)
        })
    }
}