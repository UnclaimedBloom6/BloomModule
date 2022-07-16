import { data } from "../utils/Utils"
import Config from "../Config"
import MyPlayer from "../../BloomCore/MyPlayer"
import Skyblock from "../../BloomCore/Skyblock"


register("renderOverlay", () => {
    if (!Config.speedDisplay || !Skyblock.inSkyblock) return
    Renderer.translate(data.speedDisplay.x, data.speedDisplay.y)
    Renderer.scale(1.5)
    Renderer.drawStringWithShadow(`&f✦${MyPlayer.speed}`, 0, 0)
})

register("dragged", (dx, dy, x, y) => {
    if (!Config.speedMoveGui.isOpen()) return
    data.speedDisplay.x = x
    data.speedDisplay.y = y
    data.save()
})