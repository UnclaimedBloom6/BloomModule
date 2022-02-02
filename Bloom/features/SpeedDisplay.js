import { data, getTabList } from "../utils/Utils"
import Config from "../Config"

class SpeedDisplay {
    constructor() {
        this.speed = 100
        register("tick", () => {
            let lines = getTabList()
            for (let i = 0; i < Object.keys(lines).length; i++) {
                let match = lines[i].match(/ Speed: ✦(\d+)/)
                if (match) {
                    this.speed = parseInt(match[1])
                }
            }
        })

        register("renderOverlay", () => {
            if (!Config.speedDisplay) { return }
            Renderer.translate(data.speedDisplay.x, data.speedDisplay.y)
            Renderer.scale(1.5)
            Renderer.drawStringWithShadow(`&f✦${this.speed}`, 0, 0)
        })

        register("dragged", (dx, dy, x, y) => {
            if (Config.speedMoveGui.isOpen()) {
                data.speedDisplay.x = x
                data.speedDisplay.y = y
                data.save()
            }
        })
    }
}
export default new SpeedDisplay()