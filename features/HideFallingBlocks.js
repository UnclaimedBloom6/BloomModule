import { registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const EntityFallingBlock = Java.type("net.minecraft.entity.item.EntityFallingBlock")

registerWhen(register("renderEntity", (entity, pos, pt, event) => {
    cancel(event)
}).setFilteredClass(EntityFallingBlock), () => Config.hideFallingBlocks)