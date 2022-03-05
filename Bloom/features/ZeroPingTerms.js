import { clickSlot, colorOrder, isEnchanted, paneMetas, setEnchanted, setPaneToGreen } from "../Utils/Utils"
import Config from "../Config"
import TerminalSolver from "./TerminalSolver"

class ZeroPingTerms {
    constructor() {
        this.windowId = null
        this.enchantedSlots = []
        this.greenPanes = []
        this.paneMetas = {}
        const incrementPane = (slot, meta, reverse) => Player.getOpenedInventory().getStackInSlot(slot).setDamage(colorOrder[(colorOrder.length+colorOrder.indexOf(meta)+(reverse ? -1 : 1))%colorOrder.length])
        const removeSlot = (slot, amount) => {
            let removed = 0
            for (let i = 0; i < TerminalSolver.correctSlots.length; i++) {
                if (removed == amount) return
                if (TerminalSolver.correctSlots[i] == slot) {
                    TerminalSolver.correctSlots.splice(i, 1)
                    i--
                    removed++
                }
            }
        }
        this.doStuff = (gui, event, button) => {
            let correct = TerminalSolver.correctSlots
            if (!correct.length || !TerminalSolver.inTerm) return

            let slot = gui ? gui.getSlotUnderMouse()?.field_75222_d : correct[0]
            if (slot == null) return event ? cancel(event) : null

            if (!correct.includes(slot)) return cancel(event)

            let meta = Player.getOpenedInventory()?.getStackInSlot(slot)?.getMetadata()
            let finalClick = 2

            let wi = Player.getPlayer().field_71070_bA.field_75152_c
            if (this.windowId < wi) this.windowId = wi

            let inv = Player.getOpenedInventory()
            let invName = inv.getName()

            let action = (slot) => setEnchanted(slot)
            let toRemove = 1

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
            // This doesn't work properly.
            if (invName == "Change all to same color!") {
                return
            //     if (!meta) return
            //     action = null
            //     let amount = TerminalSolver.correctSlots.filter(a => a == slot).length
            //     let backwards = colorOrder.length-amount
                
            //     if (amount <= 2) finalClick = 0
            //     else finalClick = 1
                
            //     incrementPane(slot, meta, finalClick == 0 ? false : true)
            //     this.paneMetas[slot] = inv.getStackInSlot(slot)?.getMetadata()
            //     // ChatLib.chat(`Clicking ${finalClick}`)

            //     if (finalClick == 1 && backwards == 1) toRemove = 4
            //     else if (finalClick == 1) {
            //         toRemove = 0
            //         TerminalSolver.correctSlots.push(slot)
            //     }
            }

            removeSlot(slot, toRemove)
            if (event) cancel(event)
            clickSlot(slot, this.windowId, finalClick)
            try {
                if (action) action(slot)
            }
            catch(e) {}
            this.windowId++
        }
        register("guiMouseClick", (mx, my, btn, gui, event) => {
            if (!Config.zeroPingTerminals || !TerminalSolver.inTerm || !Config.terminalSolvers || ![0, 1].includes(btn) || !TerminalSolver.correctSlots.length) return
            this.doStuff(gui, event, btn)
        })

        register("guiRender", () => {
            if (!TerminalSolver.inTerm) return
            // Index out of range error that I cba making an actual fix for
            try { 
                this.greenPanes.map(a => setPaneToGreen(a))
                this.enchantedSlots.filter(a => !isEnchanted(a)).map(a => setEnchanted(a))
                Object.keys(this.paneMetas).map(a => Player.getOpenedInventory().getStackInSlot(a).setDamage(this.paneMetas[a]))
            }
            catch(e) {}
        })
        register("tick", () => {
            if (TerminalSolver.inTerm) return
            this.windowId = null
            this.greenPanes = []
            this.enchantedSlots = []
            this.paneMetas = {}
    })
    }
}
export default new ZeroPingTerms()