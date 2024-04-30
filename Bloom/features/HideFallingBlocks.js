import Config from "../Config"

const EntityFallingBlock = Java.type("net.minecraft.entity.item.EntityFallingBlock")

register("renderEntity", (entity, pos, pt, event) => {
    if (!Config.hideFallingBlocks) return
    cancel(event)
}).setFilteredClass(EntityFallingBlock)