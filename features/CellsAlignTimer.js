import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { C08PacketPlayerBlockPlacement, getSkyblockItemID, registerWhen, renderCenteredString } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"

// Move Logic
register("dragged", (dx, dy, mx, my, btn) => {
    if (!Config.cellsAlignMoveGui.isOpen()) return
    data.cellsAlignTimer.x = mx
    data.cellsAlignTimer.y = my
    data.save()
})

register("scrolled", (mx, my, dir) => {
    if (!Config.cellsAlignMoveGui.isOpen()) return
    if (dir == 1) data.cellsAlignTimer.scale += 0.05
    else data.cellsAlignTimer.scale -= 0.05
    data.save()
})

// Main shit

let lastAlign = null
const baseCooldown = 10
let alignCooldown = 10 // Accounting for cooldown reductions

const isCooldownOver = () => !lastAlign || Date.now() - lastAlign > alignCooldown * 1000

registerWhen(register("renderOverlay", () => {
    if ((!Config.cellsAlignTimer || isCooldownOver() || Client.isInGui()) && !Config.cellsAlignMoveGui.isOpen()) return

    const remaining = alignCooldown * 1000 - (Date.now() - lastAlign)
    const secs = Math.floor(remaining/10)/100
    const str = `&b${secs}s`
    
    renderCenteredString(str, data.cellsAlignTimer.x, data.cellsAlignTimer.y, data.cellsAlignTimer.scale)
}), () => Config.cellsAlignTimer && !isCooldownOver())

// Check cooldown reduction
register("tick", () => {
    if (!Dungeon.inDungeon || !Config.cellsAlignTimer) return
    alignCooldown = Dungeon.getAbilityCooldown(baseCooldown)
})

register("chat", () => {
    lastAlign = Date.now()
}).setCriteria(/^You aligned [yourself\!|\d other players\!]+$/)