import Terminal from "./Terminal";

export default class ColorsTerminal extends Terminal {
    constructor(title, slotCount, color) {
        super(title, slotCount)

        this.name = "Colors"
        this.type = Terminal.COLORS
        this.saveName = "colors"
        this.color = color.toLowerCase()

        this.replacements = {
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
    }

    fixItemName(itemName) {
        Object.entries(this.replacements).forEach(([k, v]) => {
            itemName = itemName.replace(new RegExp(`^${k}`), v)
        })
        return itemName
    }

    solve() {
        this.solution = this.items.reduce((a, b, i) => {
            if (!b || b.getID() == 160 && b.getMetadata() == 15 || b.isEnchanted()) return a
            if (!this.fixItemName(b.getName().removeFormatting().toLowerCase()).startsWith(this.color)) return a
            a.push(i)
            return a
        }, [])
    }

    toString() {
        return `ColorsTerminal[name=${this.name}, color="${this.color}", solution=${JSON.stringify(this.solution)}]`
    }
}