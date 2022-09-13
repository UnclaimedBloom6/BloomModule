import { colorOrder, isEnchanted, setEnchanted, setPaneToGreen } from "../Utils/Utils"
import Config from "../Config"
import TerminalSolver from "./TerminalSolver"
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { clickSlot, S30PacketWindowItems } from "../../BloomCore/utils/Utils"

export default new class ZeroPingTerms {
    constructor() {
        this.windowId = null
        this.enchantedSlots = []
        this.greenPanes = []
        this.paneMetas = {}
        this.lastClick = null
        const incrementPane = (slot, meta, reverse) => Player.getContainer().getStackInSlot(slot).setDamage(colorOrder[(colorOrder.length+colorOrder.indexOf(meta)+(reverse ? -1 : 1))%colorOrder.length])
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
        this.doStuff = (gui, event) => {
            let correct = TerminalSolver.correctSlots
            if (!correct.length || !TerminalSolver.terminal) return

            let slot = gui ? gui.getSlotUnderMouse()?.field_75222_d : correct[0]
            if (slot == null) return event ? cancel(event) : null

            if (!correct.includes(slot)) return cancel(event)

            let meta = Player.getContainer()?.getStackInSlot(slot)?.getMetadata()
            let finalClick = 2

            let wi = Player.getContainer().getWindowId()
            if (this.windowId < wi) this.windowId = wi

            let inv = Player.getContainer()
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
            if (!Config.zeroPingTerminals || !TerminalSolver.terminal || !Config.terminalSolvers || btn || !TerminalSolver.correctSlots.length) return
            if (TerminalSolver.terminal == "NUMBERS" && !Config.numbersZeroPing) return
            if (TerminalSolver.terminal == "COLORS" && !Config.colorsZeroPing) return
            if (TerminalSolver.terminal == "STARTSWITH" && !Config.startsWithZeroPing) return
            if (TerminalSolver.terminal == "RUBIX" && !Config.rubixZeroPing) return
            if (TerminalSolver.terminal == "REDGREEN" && !Config.redGreenZeroPing) return
            this.doStuff(gui, event, btn)
        })

        register("guiRender", () => {
            if (!TerminalSolver.terminal) return
            // Index out of range error that I cba making an actual fix for
            try { 
                this.greenPanes.map(a => setPaneToGreen(a))
                this.enchantedSlots.filter(a => !isEnchanted(a)).map(a => setEnchanted(a))
                Object.keys(this.paneMetas).map(a => Player.getContainer().getStackInSlot(a).setDamage(this.paneMetas[a]))
            }
            catch(e) {}
        })
        register("tick", () => {
            if (TerminalSolver.terminal) return
            this.greenPanes = []
            this.enchantedSlots = []
            this.paneMetas = {}
            this.windowId = null

            this.packet = null
            this.lastPacketReceived = null
        })

        // Tries to fix when the client's and server's window ids get unsyncedd
        register("packetReceived", (packet) => {
            if (!Dungeon.inDungeon || !TerminalSolver.terminal || !Config.zeroPingTerminals) return
            this.packet = packet
            this.lastPacketReceived = new Date().getTime()
        }).setPacketClass(S30PacketWindowItems)

        register("tick", () => {
            if (!TerminalSolver.terminal) return
            if (!this.lastPacketReceived || new Date().getTime() - this.lastPacketReceived < 500 || new Date().getTime() - this.lastClick < 500 || !Client.isInGui()) return

            this.windowId = null
            this.greenPanes = []
            this.paneMetas = {}

            // Re-Send the window packet
            Client.scheduleTask(() => Client.getMinecraft().func_147114_u().func_147241_a(this.packet))

            TerminalSolver.solve()

            this.packet = null
            this.lastPacketReceived = null
        })
    }
}

