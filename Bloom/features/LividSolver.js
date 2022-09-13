import Dungeon from "../../BloomCore/dungeons/Dungeon"
import RenderLib from "../../RenderLib"
import Config from "../Config"

const EntityOtherPlayerMP = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP")

const livids = {
    5: "Smile",
    10: "Purple",
    11: "Scream",
    14: "Hockey",
    4: "Arcade",
    0: "Vendetta",
    7: "Doctor",
    2: "Crossed",
   13: "Frog"
}

let livid = null
register("tick", () => {
    if (!Dungeon.inDungeon || !Config.lividSolver || Dungeon.floorNumber !== 5) return
    let wool = World.getBlockAt(5, 108, 43) // wool on ceiling
    if (!wool || wool.type.getID() !== 35) return
    let meta = wool.getMetadata()
    if (!Object.keys(livids).includes(String(meta))) return
    let e = World.getAllEntitiesOfType(EntityOtherPlayerMP).find(a => a.getName() == `${livids[meta]} Livid`)
    if (!e) livid = null
    livid = e
})

register("renderWorld", () => {
    if (!Dungeon.inDungeon || !livid || !Config.lividSolver) return
    RenderLib.drawEspBox(livid.getX(), livid.getY(), livid.getZ(), livid.getWidth(), livid.getHeight(), 0, 1, 0, 1, false)
})

register("worldLoad", () => livid = null)