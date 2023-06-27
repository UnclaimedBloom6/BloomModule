import Terminal from "./Terminal";

export default class RedGreenTerminal extends Terminal {
    constructor(title, slotCount) {
        super(title, slotCount)

        this.name = "Red Green"
        this.saveName = "redgreen"
        this.type = Terminal.REDGREEN
    }
    
    solve() {
        this.solution = this.items.reduce((a, b, i) => {
            if (!b || b.getID() !== 160 || b.getMetadata() !== 14) return a
            a.push(i)
            return a
        }, [])
    }

    onSlotRender(slot, gui, event) {
        
    }

    toString() {
        return `RedGreenTerminal[name=${this.name}, solution=${JSON.stringify(this.solution)}]`
    }
}