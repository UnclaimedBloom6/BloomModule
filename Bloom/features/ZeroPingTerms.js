import { isEnchanted, setEnchanted, setPaneToGreen } from "../Utils/Utils"
import TerminalSolver from "./TerminalSolver"
import Config from "../Config"

class ZeroPingTerms {
    constructor() {
        this.windowId = null
        this.clicked = []
        this.enchantedSlots = []
        this.greenPanes = []
        this.clickSlot = (slot) => Client.getMinecraft().field_71442_b.func_78753_a(this.windowId, slot, 2, 3, Player.getPlayer())
        this.doStuff = (gui, event) => {
            let correct = TerminalSolver.correctSlots
            if (!correct.length) return
    
            let slot = gui ? gui.getSlotUnderMouse()?.field_75222_d : correct[0]
            if (slot == null || this.clicked.includes(slot)) return event ? cancel(event) : null
    
            let wi = Player.getPlayer().field_71070_bA.field_75152_c
            if (this.windowId < wi) this.windowId = wi
    
            let inv = Player.getOpenedInventory()
            let invName = inv.getName()
    
            let action = (slot) => setEnchanted(slot)
    
            if (["Correct all the panes!", "Select all the ", "What starts with: '"].some(a => invName.startsWith(a))) {
                if (!correct.includes(slot)) return event ? cancel(event) : null
                if (invName == "Correct all the panes!") {
                    action = setPaneToGreen
                    this.greenPanes.push(slot)
                }
                else this.enchantedSlots.push(slot)
            }
            if (["Navigate the maze!", "Click in order!"].includes(invName)) {
                if (correct[0] !== slot) return event ? cancel(event) : null
                action = setPaneToGreen
                this.greenPanes.push(slot)
            }
            this.clicked.push(slot)
            TerminalSolver.correctSlots = TerminalSolver.correctSlots.filter(a => a !== slot)
            if (event) cancel(event)
            this.clickSlot(slot)
            action(slot)
            this.windowId++
        }
        register("guiMouseClick", (mx, my, btn, gui, event) => {
            if (!Config.zeroPingTerminals || !TerminalSolver.inTerm || btn !== 0) return
            this.doStuff(gui, event)
        })

        register("guiRender", () => {
            if (!TerminalSolver.inTerm) return
            this.enchantedSlots.filter(a => !isEnchanted(a)).map(a => setEnchanted(a))
            this.greenPanes.map(a => setPaneToGreen(a))
        })
        register("tick", () => {
            if (!TerminalSolver.inTerm) {
                this.windowId = null
                this.clicked = []
                this.greenPanes = []
                this.enchantedSlots = []
            }
        })
    }
}
export default new ZeroPingTerms()