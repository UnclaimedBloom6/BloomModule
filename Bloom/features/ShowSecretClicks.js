
import { renderBlockHitbox } from "../../BloomCore/RenderUtils";
import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { C08PacketPlayerBlockPlacement, MCBlockPos } from "../../BloomCore/utils/Utils";
import Config from "../Config";

const highlights = new Map() // [blockStr: {block: ctBlock, locked: false}]

const validBlocks = new Set([
    "minecraft:chest",
    "minecraft:lever",
    "minecraft:skull",
    "minecraft:trapped_chest",
])

const validSkullIDs = new Set([
    "26bb1a8d-7c66-31c6-82d5-a9c04c94fb02", // Wither Essence
    "edb0155f-379c-395a-9c7d-1b6005987ac8"  // Redstone Key
])

const highlightBlock = (block) => {
    const blockStr = block.toString()
    highlights.set(blockStr, {
        block: block,
        locked: false
    })
    Client.scheduleTask(20, () => highlights.delete(blockStr))
}

const isValidSkull = (x, y, z) => {
    const tileEntity = World.getWorld().func_175625_s(new MCBlockPos(x, y, z))

    if (!tileEntity || !tileEntity.func_152108_a()) return false

    const skullID = tileEntity.func_152108_a().getId().toString()
    
    return validSkullIDs.has(skullID)
}

// Just in case
register("worldUnload", () => highlights.clear())

register("packetSent", (packet) => {
    if (!Config.showSecretClicks || !Dungeon.inDungeon) return
    const pos = packet.func_179724_a()
    const bp = new BlockPos(pos)
    
    const x = bp.x
    const y = bp.y
    const z = bp.z
    
    const block = World.getBlockAt(x, y, z)
    const blockName = block.type.getRegistryName()
    
    if (!validBlocks.has(blockName) || highlights.has(block.toString())) return
    if (blockName == "minecraft:skull" && !isValidSkull(x, y, z)) return

    highlightBlock(block)
}).setFilteredClass(C08PacketPlayerBlockPlacement)

const renderBlockHighlight = (block, r, g, b) => {
    renderBlockHitbox(block, r, g, b, 1, true, 2, false)
    renderBlockHitbox(block, r, g, b, 0.2, true, 2, true)
}

register("renderWorld", () => {

    const r = Config.showSecretClicksColor.getRed() / 255
    const g = Config.showSecretClicksColor.getGreen() / 255
    const b = Config.showSecretClicksColor.getBlue() / 255
    
    for (let value of highlights.values()) {
        let { block, locked } = value
        if (locked) renderBlockHighlight(block, 1, 0, 0)
        else renderBlockHighlight(block, r, g, b)
    }
})

register("chat", () => {
    if (!highlights.size) return

    // Set the chest to be locked
    for (let obj of highlights.values()) {
        if (obj.block.type.getRegistryName() !== "minecraft:chest") continue
        obj.locked = true
        return
    }
}).setCriteria(/^That chest is locked!$/)

