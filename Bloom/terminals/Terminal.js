import { GuiContainer, hightlightSlot } from "../../BloomCore/utils/Utils"
import Config from "../Config"

export default class Terminal {

    static MELODY = 0
    static NUMBERS = 1
    static COLORS = 2
    static STARTSWITH = 3
    static MAZE = 4
    static RUBIX = 5
    static REDGREEN = 6

    constructor(title, slotCount) {

        this.title = title
        this.name = "Terminal"
        this.type = null
        this.saveName = ""
        this.initializedItems = false
        this.windowSize = slotCount

        this.createdAt = new Date().getTime()

        // CT Items. These can be modified (Like for zero ping terminals)
        this.items = new Array(this.windowSize).fill(null)
        this.windowID = 0
        this.solution = [] // Slot Indexes
        
        // These should not be modified
        this.lastKnownWindowID = 0
        this.lastKnownWindowItems = new Array(this.windowSize).fill(null)
        this.lastClick = null
    }

    solve() {

    }

    /**
     * 
     * @param {Slot} slot 
     * @param {GuiContainer} gui 
     * @param {CancellableEvent} event 
     */
    onSlotRender(slot, gui, event) {
        const slotIndex = slot.getIndex()
        if (slotIndex >= this.windowSize) return

        const item = this.items[slotIndex]
        if (item && item.getID() == 160 && item.getMetadata() == 15) return

        const solutionIndex = this.solution.indexOf(slotIndex)
        if (solutionIndex == -1) {
            if (Config.hideWrongItems) cancel(event)
            return
        }

        const x = slot.getDisplayX()
        const y = slot.getDisplayY()

        Renderer.translate(x, y, 31)
        Renderer.drawRect(Renderer.color(0, 200, 0, 255), 0, 0, 16, 16)
    }

    toString() {
        return `Terminal[name=${this.name}, solution=${JSON.stringify(this.solution)}]`
    }
}