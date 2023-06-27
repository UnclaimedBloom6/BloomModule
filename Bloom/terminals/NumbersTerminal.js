import Terminal from "./Terminal";

export default class NumbersTerminal extends Terminal {
    constructor(title, slotCount) {
        super(title, slotCount)

        this.name = "Numbers"
        this.saveName = "numbers"
        this.type = Terminal.NUMBERS

    }

    solve() {
        this.solution = this.items.reduce((a, item, index) => {
            if (!item || item.getID() !== 160 || item.getMetadata() !== 14) return a
            a.push([index, item.getStackSize()])
            return a
        }, []).sort((a, b) => a[1] - b[1]).map(a => a[0])
    }

    /**
     * 
     * @param {Slot} slot 
     */
    onSlotRender(slot, gui, event) {
        const slotIndex = slot.getIndex()
        const solutionIndex = this.solution.indexOf(slotIndex)
        if (solutionIndex == -1 || solutionIndex > 2) return

        cancel(event)

        const x = slot.getDisplayX()
        const y = slot.getDisplayY()
        const color = 1 - solutionIndex * (1/3)

        Renderer.translate(x, y, 33)
        Renderer.drawRect(Renderer.color(0, color*255, color*255, 175), 0, 0, 16, 16)
    }

    toString() {
        return `NumbersTerminal[name=${this.name}, solution=${JSON.stringify(this.solution)}]`
    }
}