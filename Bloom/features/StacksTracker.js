import { registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"

let stackIcons = [5968, 8273]
let stacks = 0
let stackChar = "ᝐ"
register("actionBar", (e) => {
    let msg = ChatLib.getChatMessage(e).removeFormatting()
    for (let i = msg.length-1; i > 2; i--) {
        let charCode = msg.charCodeAt(i)
        if (!stackIcons.includes(charCode)) continue
        stackChar = String.fromCharCode(charCode)
        stacks = parseInt(msg.slice(i-2, i).trim())
        return
    }
    stacks = 0
    stackChar = "ᝐ"
})

registerWhen(register("renderOverlay", () => {
    if ((!Config.stackTracker || !stacks) && !Config.stackTrackerGui.isOpen()) return
    Renderer.translate(data.stackTracker.x, data.stackTracker.y)
    Renderer.scale(1.25)
    Renderer.drawString(`&6${stacks}${stackChar}`, 0, 0)
}), () => (Config.stackTracker && stacks) || Config.stackTrackerGui.isOpen())

register("dragged", (dx, dy, mx, my, btn) => {
    if (!Config.stackTrackerGui.isOpen()) return
    data.stackTracker.x = mx
    data.stackTracker.y = my
    data.save()
})