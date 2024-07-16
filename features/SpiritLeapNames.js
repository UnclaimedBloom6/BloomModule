import { getSlotCenter } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const invNames = [
    "Spirit Leap",
    "Teleport to Player"
]

register("guiRender", () => {
    if (!Config.spiritLeapNames) return
    let inv = Player.getOpenedInventory()
    if (!inv || !invNames.includes(inv.getName())) return
    let heads = inv.getItems().map((v, i) => v?.getID() == 397 ? i : null).filter(a => !!a && a <= 27) // Get slot numbers of player heads
    heads.map((slot, i) => {
        let [x, y] = getSlotCenter(slot)
        let name = inv.getStackInSlot(slot).getName()
        Renderer.translate(x-5, y+10, 1000)
        Renderer.rotate(25)
        Renderer.drawString(name, 0, 0)
    })
})