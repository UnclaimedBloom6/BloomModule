import { getSlotRenderPosition } from "../../BloomCore/utils/Utils";
import Terminal from "./Terminal";

export default class RubixTerminal extends Terminal {
    constructor(title, slotCount) {
        super(title, slotCount)
        
        this.name = "Rubix"
        this.type = Terminal.RUBIX
        this.saveName = "rubix"
        this.colorOrder = [1, 4, 13, 11, 14]
    }

    getColorIndex(meta) {
        return this.colorOrder.indexOf(meta)
    }

    solve() {
        const paneIndexes = this.items.reduce((a, b, i) => {
            if (!b || b.getID() !== 160 || b.getMetadata() == 15) return a
            a.push(i)
            return a
        }, [])

        let leastClicks = this.colorOrder.reduce((a, b, i) => {
            const slotsToClick = []
            const distances = []
            for (let index of paneIndexes) {
                let paneMeta = this.items[index].getMetadata()
                let distance = Math.abs(this.colorOrder.length-1 - (this.getColorIndex(paneMeta) + i) % this.colorOrder.length)
                for (let j = 0; j < distance; j++) slotsToClick.push(index)

                if (distance > 2) distance = distance%2 + 1
                distances.push(distance)
            }
            
            const totalClicks = distances.reduce((c, d) => c + d, 0)
            
            if (!a || totalClicks < a.clicks) a = {
                clicks: totalClicks,
                toClick: slotsToClick
            }

            return a
        }, null)

        
        if (!leastClicks) return this.solution = []
        this.solution = leastClicks.toClick
    }

    onSlotRender(slot, gui, event) {
        const slotIndex = slot.getIndex()
        const count = this.solution.reduce((a, b) => a + (b == slotIndex ? 1 : 0), 0)
        if (count == 0) return

        const x = slot.getDisplayX()
        const y = slot.getDisplayY()

        let clicks = count
        if (clicks > 2) clicks = -(clicks%2 + 1)

        const str = `§l${clicks}`
        const stringWidth = Renderer.getStringWidth(str)

        Renderer.translate(x + 8 - stringWidth/2, y + 4, 251)
        Renderer.drawString(str, 0, 0, true)
    }

    toString() {
        return `RubixTerminal[name=${this.name}, solution=${JSON.stringify(this.solution)}]`
    }
}