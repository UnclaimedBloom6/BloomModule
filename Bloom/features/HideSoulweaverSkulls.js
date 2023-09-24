import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand, getEntitySkullTexture } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const t = "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMmYyNGVkNjg3NTMwNGZhNGExZjBjNzg1YjJjYjZhNmE3MjU2M2U5ZjNlMjRlYTU1ZTE4MTc4NDUyMTE5YWE2NiJ9fX0="

// Would've used packets but it was too aids
register("tick", () => {
    if (!Config.hideSoulweaverSkulls || !Dungeon.inDungeon) return
    const stands = World.getAllEntitiesOfType(EntityArmorStand)
    stands.forEach(stand => {
        const skull = getEntitySkullTexture(stand)
        if (skull !== t) return

        stand.getEntity().func_70106_y()
    })
})