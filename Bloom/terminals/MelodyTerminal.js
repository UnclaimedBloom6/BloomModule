import Terminal from "./Terminal";

export default class MelodyTerminal extends Terminal {
    constructor(title, slotCount) {
        super(title, slotCount)
        
        this.name = "Melody"
        this.saveName = 
        this.type = Terminal.MELODY
    }

    solve() {

    }

    onSlotRender(slot, gui, event) {
        
    }
}