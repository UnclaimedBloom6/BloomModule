import { getObjectXYZ } from "../../BloomCore/utils/Utils"
import { convertToRealCoords, onRoomEnter, onRoomExit } from "../utils/RoomUtils"
import { prefix } from "../utils/Utils"
import Config from "../Config"

const S24PacketBlockAction = Java.type("net.minecraft.network.play.server.S24PacketBlockAction")
const BlockChest = Java.type("net.minecraft.block.BlockChest")

const getTimeTo2dp = (start, end) => ((end - start) / 1000).toFixed(2)

// Also acts as an inWater check as it's null anytime the player is not in water board
let roomInfo = null
let enteredAt = null

// The splits
let leverPulled = null
let chestOpened = null

const checkInWater = (roomX, roomZ, rotation) => {
    let [x, y, z] = convertToRealCoords(1, 76, -8, roomX, roomZ, rotation)
    return World.getBlockAt(x, y, z).type.getRegistryName() == "minecraft:double_plant"
}

onRoomEnter((roomX, roomZ, rotation) => {
    if (!Config.waterBoardTimers || !checkInWater(roomX, roomZ, rotation)) return
    roomInfo = [roomX, roomZ, rotation]

    if (!enteredAt) enteredAt = Date.now()
})

onRoomExit(() => {
    if (!roomInfo) return
    roomInfo = null

    if (!chestOpened || !enteredAt) return
    const timeSpent = getTimeTo2dp(enteredAt, Date.now())
    ChatLib.chat(`${prefix} &aWater Board took &b${timeSpent}s`)
})

register("playerInteract", (action, pos) => {
    if (!roomInfo || action.toString() !== "RIGHT_CLICK_BLOCK" || leverPulled) return
    const pos = getObjectXYZ(pos)
    if (!pos.every((v, i) => v == [0, 60, -10][i])) return
    
    leverPulled = Date.now()
})

register("worldUnload", () => {
    enteredAt = null
    leverPulled = null
    chestOpened = null
})

// Detect chest opened. Chest animation means it'll only trigger when the chest is actually opened, so no cheesing!
register("packetReceived", (packet) => {
    if (!roomInfo || !enteredAt) return

    const pos = new BlockPos(packet.func_179825_a())
    const block = packet.func_148868_c()
    if (!(block instanceof BlockChest)) return

    const [roomX, roomZ, rotation] = roomInfo
    const chestPos = getObjectXYZ(pos)
    const expectedChestPos = convertToRealCoords(0, 56, 7, roomX, roomZ, rotation)
    if (!chestPos.every((v, i) => v == expectedChestPos[i])) return

    // Chest open is a requirement to have the room exit time appear to avoid cheesing low times
    chestOpened = Date.now()
    ChatLib.chat(`${prefix} &aChest open took &b${getTimeTo2dp(enteredAt, chestOpened)}s`)
    
    // Time from first lever pull to chest open
    if (leverPulled) ChatLib.chat(`${prefix} &aFlow time took &b${getTimeTo2dp(leverPulled, chestOpened)}s`)
    
}).setFilteredClass(S24PacketBlockAction)