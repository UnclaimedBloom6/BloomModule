
import { renderBlockHitbox } from "../../BloomCore/RenderUtils";
import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { C08PacketPlayerBlockPlacement } from "../../BloomCore/utils/Utils";
import Config from "../Config";

const highlights = new Set() // [ctBlock, message]

const validBlocks = new Map([
    ["minecraft:chest", "Chest"],
    ["minecraft:lever", "Lever"],
    ["minecraft:skull", "Skull"],
    // ["minecraft:stone_button", "Button"],
    // ["minecraft:wooden_button", "Button"],
    ["minecraft:trapped_chest", "Trapped Chest"]
])

const highlightBlock = (block, blockName) => {
    const entry = [block, `Clicked ${blockName}`]

    highlights.add(entry)
    Client.scheduleTask(20, () => highlights.delete(entry))
}

// Just in case
register("worldUnload", () => highlights.clear())

register("packetSent", (packet) => {
    if (!Config.showSecretClicks/* || !Dungeon.inDungeon*/) return
    const pos = packet.func_179724_a()
    const bp = new BlockPos(pos)
    
    const x = bp.x
    const y = bp.y
    const z = bp.z
    
    const block = World.getBlockAt(x, y, z)
    const blockName = block.type.getRegistryName()
    
    if (!validBlocks.has(blockName)) return
    highlightBlock(block, validBlocks.get(blockName))
}).setFilteredClass(C08PacketPlayerBlockPlacement)

register("renderWorld", () => {
    highlights.forEach(entry => {
        const [ctBlock, message] = entry

        renderBlockHitbox(ctBlock, 0, 1, 0, 1, true, 2, false)
        renderBlockHitbox(ctBlock, 0, 1, 0, 0.2, true, 2, true)
    })
})
