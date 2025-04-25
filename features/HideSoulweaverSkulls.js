import { getSkullTexture } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const soulweaverSkullTexture = "eyJ0aW1lc3RhbXAiOjE1NTk1ODAzNjI1NTMsInByb2ZpbGVJZCI6ImU3NmYwZDlhZjc4MjQyYzM5NDY2ZDY3MjE3MzBmNDUzIiwicHJvZmlsZU5hbWUiOiJLbGxscmFoIiwic2lnbmF0dXJlUmVxdWlyZWQiOnRydWUsInRleHR1cmVzIjp7IlNLSU4iOnsidXJsIjoiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS8yZjI0ZWQ2ODc1MzA0ZmE0YTFmMGM3ODViMmNiNmE2YTcyNTYzZTlmM2UyNGVhNTVlMTgxNzg0NTIxMTlhYTY2In19fQ=="
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

