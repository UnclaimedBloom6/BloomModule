import { registerWhen } from "../../BloomCore/utils/Utils"
import RenderLib from "../../RenderLib"
import Config from "../Config"

registerWhen(register("renderWorld", () => {
    let la = Player.getPlayer().func_174822_a(25, 0.0)
    let bp = la?.func_178782_a()
    if (!la || !bp) return
    bp = new BlockPos(bp)
    let [x, y, z] = [bp.getX(), bp.getY(), bp.getZ()]
    let blockAt = World.getBlockAt(x, y, z)
    if (!blockAt || !blockAt.type.getID()) return
    RenderLib.drawCyl(x+0.5, y+1, z+0.5, 10, 10, 0.2, 30, 1, 0, 90, 90, 0, 1, 0, 0.5, false, false)
}), () => Config.gyroCircle && Player.getHeldItem()?.getName()?.removeFormatting() == "Gyrokinetic Wand")