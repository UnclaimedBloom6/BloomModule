import Skyblock from "../../BloomCore/Skyblock"
import { getHead } from "../../BloomCore/utils/APIWrappers"
import { getPlayerCoords, registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"

// Corners of the crystal hollows
const corner1 = [201, 201]
const corner2 = [824, 824]

// const nuc1 = [463, 460]
// const nuc2 = [564, 565]

const mapImage = new Image("chMap.png", "../assets/chMap.png")
const defaultIcon = new Image("greenMarker.png", "../../BloomCore/assets/blueMarker.png")
let head = null
getHead(Player.getName(), true).then(h => head = h)
registerWhen(register("renderOverlay", () => {
    if (Skyblock.area !== "Crystal Hollows" || (!Config.chMap && !Config.chMapMoveGui.isOpen())) return
    let w = h = 150 * data.chMap.scale
    let x = data.chMap.x
    let y = data.chMap.y
    Renderer.retainTransforms(true)
    Renderer.translate(x, y)
    Renderer.drawImage(mapImage, 0, 0, w, h)
    let headToDraw = head ? head : defaultIcon
    let [headW, headH] = headToDraw == head ? [10, 10] : [7, 10]
    let headSize = [headW*data.chMap.headScale, headH*data.chMap.headScale]
    let [px, py, pz] = getPlayerCoords()
    Renderer.translate(MathLib.map(px, corner1[0], corner2[0], 0, w), MathLib.map(pz, corner1[1], corner2[1], 0, h))
    Renderer.rotate(Player.getYaw()+180)
    Renderer.translate(-headSize[0]/2, -headSize[1]/2)
    Renderer.drawImage(headToDraw, 0, 0, headSize[0], headSize[1])
    Renderer.retainTransforms(false)
}), () => Skyblock.area == "Crystal Hollows" && (Config.chMap || Config.chMapMoveGui.isOpen()))

register("dragged", (dx, dy, mx, my, btn) => {
    if (!Config.chMapMoveGui.isOpen()) return
    data.chMap.x = mx
    data.chMap.y = my
    data.save()
})

register("scrolled", (mx, my, dir) => {
    if (!Config.chMapMoveGui.isOpen()) return
    if (Client.isShiftDown()) {
        if (dir == 1) data.chMap.headScale += 0.05
        else data.chMap.headScale -= 0.05
    }
    else {
        if (dir == 1) data.chMap.scale += 0.05
        else data.chMap.scale -= 0.05
    }
    data.save()
})