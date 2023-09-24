import { EntityArmorStand } from "../../BloomCore/utils/Utils";
import Config from "../Config";

const S0FPacketSpawnMob = Java.type("net.minecraft.network.play.server.S0FPacketSpawnMob")

const handleArmorStand = (entityID) => {
    const entity = World.getWorld().func_73045_a(entityID)
    if (!entity || !(entity instanceof EntityArmorStand)) return
    const name = entity.func_95999_t()

    if (!name || !name.match(/^§7[\d,]+$/)) return
    entity.func_70106_y()
}

register("packetReceived", (packet, event) => {
    if (!Config.hideGrayDamageNumbers) return
    Client.scheduleTask(0, () => handleArmorStand(packet.func_149024_d()))
}).setFilteredClass(S0FPacketSpawnMob)