import { data } from "../utils/Utils"
import Config from "../Config"
import MyPlayer from "../../BloomCore/MyPlayer"
import Skyblock from "../../BloomCore/Skyblock"
import { registerWhen } from "../../BloomCore/utils/Utils"


let speedStr = null

register("tick", () => {
    if (!Config.speedDisplay || !Skyblock.inSkyblock) return speedStr = null
    speedStr = `&f✦${MyPlayer.speed}`
})

registerWhen(register("renderOverlay", () => {
    if (!speedStr) return
    Renderer.translate(data.speedDisplay.x, data.speedDisplay.y)
    Renderer.scale(data.speedDisplay.scale ?? 1)
    Renderer.drawStringWithShadow(speedStr, 0, 0)
}), () => speedStr)

register("dragged", (dx, dy, x, y) => {
    if (!Config.speedMoveGui.isOpen()) return
    data.speedDisplay.x = x
    data.speedDisplay.y = y
    data.save()
})

register("scrolled", (mx, my, dir) => {
    if (!Config.speedMoveGui.isOpen()) return
    if (dir == 1) data.speedDisplay.scale += 0.02
    else data.speedDisplay.scale -= 0.02
    data.save()
})