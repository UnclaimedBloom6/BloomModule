import ScalableGui from "../../BloomCore/utils/ScalableGui"
import { appendToFile, registerWhen, round } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"

const editGui = new ScalableGui(data, data.dungeonWarpCooldown).setCommand("opendungeoncooldowngui")

const getSecondsLeft = () => (30 - (Date.now() - data.dungeonWarpCooldown.lastWarp ?? 0) / 1000).toFixed(2)

// https://regex101.com/r/rkJbvn/1
register("chat", () => {
    data.dungeonWarpCooldown.lastWarp = Date.now()
    data.save()
}).setCriteria(/^-*>newLine<-(?:\[[^\]]+\] )(\w+) entered M?M? ?The Catacombs, Floor (\w+)!->newLine<-*$/)

registerWhen(register("renderOverlay", () => {
    if (!Config.dungeonCooldown || !data.dungeonWarpCooldown.lastWarp) return

    const remaining = getSecondsLeft()
    if (remaining < 0) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    const str = `&6Warp Cooldown: &a${remaining}s`
    Renderer.drawString(str, 0, 0)
    Renderer.finishDraw()
}), () => Config.dungeonCooldown)

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawString("&6Warp Cooldown: &a10s", 0, 0)
    Renderer.finishDraw()
})
