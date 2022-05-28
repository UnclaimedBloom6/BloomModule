import { clickSlot, colorOrder, isEnchanted, prefix, setEnchanted, setPaneToGreen } from "../Utils/Utils"
import Config from "../Config"
import TerminalSolver from "./TerminalSolver"
import Dungeon from "../../BloomCore/Dungeons/Dungeon"
// import { S30PacketWindowItems } from "../../BloomCore/Utils/Utils"

export default new class ZeroPingTerms {
    constructor() {
        this.windowId = null
        this.enchantedSlots = []
        this.greenPanes = []
        this.paneMetas = {}
        this.lastClick = null
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
            // The rest of this terminal doesn't work properly.
            if (invName == "Change all to same color!") {
                action = null
                incrementPane(slot, meta, false)
                this.paneMetas[slot] = inv.getStackInSlot(slot)?.getMetadata()

            }

            removeSlot(slot, toRemove)
            if (event) cancel(event)
            clickSlot(slot, this.windowId, finalClick)
            this.lastClick = new Date().getTime()
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

            this.lastPacketItems = null
            this.lastWindowId = null
            this.lastWindowPacket = null
        })

        // No workey ):
        // register("packetReceived", (packet) => {
        //     if (!Dungeon.inDungeon || !TerminalSolver.inTerm || !Config.zeroPingTerminals) return
        //     if (!(packet instanceof S30PacketWindowItems)) return
        //     this.lastPacketItems = packet.func_148910_d() // getItemStacks()
        //     this.lastWindowId = packet.func_148911_c() // getWindowId()
        //     this.lastWindowPacket = new Date().getTime()
        // })

        // register("tick", () => {
        //     if (!this.lastWindowPacket || new Date().getTime() - this.lastWindowPacket < 500 || new Date().getTime() - this.lastClick < 500) return
        //     let currentContainer = Player.getOpenedInventory().container
        //     // if (this.lastPacketItems.length > currentContainer.)
        //     this.x = []
        //     this.greenPanes = []
        //     this.paneMetas = {}
        //     // ChatLib.chat(`${this.lastPacketItems}`)
        //     // currentContainer.func_75131_a(new Array(this.lastPacketItems.length).fill(null))
        //     currentContainer.func_75131_a(this.lastPacketItems)
        //     TerminalSolver.solve()
        //     // ChatLib.chat(`${prefix} &a&lUPDATED ITEMS`)

        //     this.windowId = this.lastWindowId
        //     this.lastPacketItems = null
        //     this.lastWindowId = null
        //     this.lastWindowPacket = null
        // })
    }
}
