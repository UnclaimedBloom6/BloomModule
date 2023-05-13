import { getDistance3D, getPlayerCoords } from "../../BloomCore/utils/Utils"
import RenderLib from "../../RenderLib"
import Config from "../Config"

// let t = ["111,120,92","111,121,95","111,122,93","111,123,92","111,123,95"]

let buttons = false
let blocks = new Set()
let awaitingClick = false
const start = [111, 120, 92]
register("tick", () => {
    if (!Config.simonSolver) return
    let [x0, y0, z0] = start
    let btn = World.getBlockAt(x0-1, y0, z0).type.getID() == 77
    if (btn && !buttons) buttons = true
    if (!btn && buttons) {
        buttons = false
        blocks.clear()
    }
    for (let dy = 0; dy <= 3; dy++) {
        for (let dz = 0; dz <= 3; dz++) {
            let [x, y, z] = [x0, y0 + dy, z0 + dz]
            let block = World.getBlockAt(x, y, z)
            let str = [x, y, z].join(",")
            if (block.type.getID() !== 169) continue
            blocks.add(str)
        }
    }
})


const BUTTONWIDTH = 0.4
const BUTTONHEIGHT = 0.26
register("renderWorld", () => {
    if (!Config.simonSolver || !blocks.size) return
    const b = [...blocks]
    for (let i = 0; i < b.length; i++) {
        let [x, y, z] = b[i].split(",").map(a => parseInt(a))
        let color = [0, 1, 0]
        if (i == 1) color = [1, 1, 0]
        else if (i > 1) color = [1, 0, 0]

        if (Config.simonSolverStyle == 0) RenderLib.drawInnerEspBox(x+0.29, y+0.2, z+0.5, 0.6, 0.6, ...color, 0.7, false)
        else RenderLib.drawInnerEspBox(x+0.05, y+0.5-BUTTONHEIGHT/2+0.001, z+0.5, BUTTONWIDTH, BUTTONHEIGHT, ...color, 0.7, false)
        
    }
})

register("playerInteract", (action, pos, event) => {
    if (!Config.simonSolver || action.toString() !== "RIGHT_CLICK_BLOCK") return
    if (awaitingClick) return awaitingClick = false
    let [x, y, z] = [pos.getX(), pos.getY(), pos.getZ()]
    // SS Start Button
    if (x == 110 && y == 121 && z == 91) {
        blocks.clear()
        return
    }
    let isButton = World.getBlockAt(x, y, z).type.getID() == 77
    let str = [x+1, y, z].join(",")
    if (!isButton || getDistance3D(...getPlayerCoords(), 108, 120, 94) > 3) return
    if (str !== [...blocks][0]) {
        // ChatLib.chat(`Cancelling ${x},${y},${z}`)
        if (Config.simonCancelClicks) return cancel(event)
    } 
    blocks.delete(str)
})

register("worldUnload", () => {
    awaitingClick = false
})