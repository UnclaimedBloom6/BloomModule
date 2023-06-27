import Terminal from "./Terminal";

export default class StartsWithTerminal extends Terminal {
    constructor(title, slotCount, letter) {
        super(title, slotCount)

        this.name = "Starts With"
        this.type = Terminal.STARTSWITH
        this.saveName = "startsWith"
        this.letter = letter.toLowerCase()
    }

    solve() {
        this.solution = this.items.reduce((a, b, i) => {
            if (!b || (b.getID() == 160 && b.getMetadata() == 15) || b.isEnchanted()) return a
            if (!b.getName().removeFormatting().toLowerCase().startsWith(this.letter)) return a
            a.push(i)
            return a
        }, [])
    }

    toString() {
        return `StartsWithTerminal[name=${this.name}, letter="${this.letter}", solution=${JSON.stringify(this.solution)}]`
    }
}