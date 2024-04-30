import { getSkullTexture } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const soulweaverSkullTexture = "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMmYyNGVkNjg3NTMwNGZhNGExZjBjNzg1YjJjYjZhNmE3MjU2M2U5ZjNlMjRlYTU1ZTE4MTc4NDUyMTE5YWE2NiJ9fX0="
const S04PacketEntityEquipment = Java.type("net.minecraft.network.play.server.S04PacketEntityEquipment")

register("packetReceived", (packet, event) => {
    if (!Config.hideSoulweaverSkulls) return

    const equipmentSlot = packet.func_149388_e()
    const itemStack = packet.func_149390_c()

    if (equipmentSlot !== 4) return
    
    const skullTexture = getSkullTexture(itemStack)
    if (skullTexture !== soulweaverSkullTexture) return
    
    cancel(event)

}).setFilteredClass(S04PacketEntityEquipment)

