
import { renderBlockHitbox } from "../../BloomCore/RenderUtils";
import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { C08PacketPlayerBlockPlacement, MCBlockPos } from "../../BloomCore/utils/Utils";
import Config from "../Config";

const highlights = new Map() // [blockStr: {block: ctBlock, locked: false}]

const validBlocks = [
    "minecraft:chest",
    "minecraft:lever",
    "minecraft:skull",
    "minecraft:trapped_chest",
]

const validSkullIDs = [
    "e0f3e929-869e-3dca-9504-54c666ee6f23", // Wither Essence
    "fed95410-aba1-39df-9b95-1d4f361eb66e"  // Redstone Key
]

const highlightBlock = (block) => {
    const blockStr = block.toString()
    highlights.set(blockStr, {
        block: block,
        locked: false
    })

    renderTrigger.register()
    
    Client.scheduleTask(20, () => {
        highlights.delete(blockStr)

        if (!highlights.size()) {
            renderTrigger.unregister()
        }
    })
}

const isValidSkull = (x, y, z) => {
    const tileEntity = World.getWorld().func_175625_s(new MCBlockPos(x, y, z))

    if (!tileEntity || !tileEntity.func_152108_a()) return false

    const skullID = tileEntity.func_152108_a().getId().toString()
    
    return validSkullIDs.includes(skullID)
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
    
    if (!validBlocks.includes(blockName) || highlights.has(block.toString())) return
    if (blockName == "minecraft:skull" && !isValidSkull(x, y, z)) return

    highlightBlock(block)
}).setFilteredClass(C08PacketPlayerBlockPlacement)

const renderBlockHighlight = (block, r, g, b) => {
    renderBlockHitbox(block, r, g, b, 1, true, 2, false)
    renderBlockHitbox(block, r, g, b, 0.2, true, 2, true)
}

const renderTrigger = register("renderWorld", () => {
    const r = Config.showSecretClicksColor.getRed() / 255
    const g = Config.showSecretClicksColor.getGreen() / 255
    const b = Config.showSecretClicksColor.getBlue() / 255
    
    for (let value of highlights.values()) {
        let { block, locked } = value
        if (locked) {
            renderBlockHighlight(block, 1, 0, 0)
        }
        else {
            renderBlockHighlight(block, r, g, b)
        }
    }
}).unregister()

register("chat", () => {
    if (!highlights.size) return

    // Set the chest to be locked
    for (let obj of highlights.values()) {
        if (obj.block.type.getRegistryName() !== "minecraft:chest") continue
        obj.locked = true
        return
    }
}).setCriteria(/^That chest is locked!$/)
