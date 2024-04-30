import { registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"

const sprintKey = new KeyBind(Client.getMinecraft().field_71474_y.field_151444_V)

register("tick", () => {
    if (!Config.toggleSprint) return
    sprintKey.setState(true)
})

register("dragged", (mx, my, x, y) => {
    if (!Config.toggleSprintMove.isOpen()) return
    data.toggleSprint.x = x
    data.toggleSprint.y = y
    data.save()
})

registerWhen(register("renderOverlay", () => {
    if (!Config.toggleSprint || !Config.toggleSprintText || !Config.toggleSprintOverlay) return
    Renderer.drawString(Config.toggleSprintText, data.toggleSprint.x, data.toggleSprint.y)
}), () => Config.toggleSprint && Config.toggleSprintText && Config.toggleSprintOverlay)