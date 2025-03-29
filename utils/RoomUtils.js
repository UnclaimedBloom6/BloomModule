import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { chunkLoaded, getObjectXYZ, getRoomCenter, getRoomComponent, rotateCoords} from "../../BloomCore/utils/Utils"

const doorOffsets = [
    [0, -16],
    [16, 0],
    [0, 16],
    [-16, 0]
]

export const convertToRoomCoords = (x, y, z, roomX, roomZ, roomRotation) => {
    return rotateCoords([x - roomX, y, z - roomZ], roomRotation)
}

export const convertToRealCoords = (x, y, z, roomX, roomZ, roomRotation) => {
    let [rx, ry, rz] = rotateCoords([x, y, z], 360 - roomRotation)
    return [rx+roomX, ry, rz+roomZ]
}

register("command", () => {
    if (!currRoom) return ChatLib.chat(`Not in a room!`)

    let la = Player.lookingAt()
    if (!la || !(la instanceof Block)) return ChatLib.chat(`Not looking at a block!`)

    let [x, y, z] = getObjectXYZ(la)
    let [roomX, roomZ, rotation] = currRoom
    let roomCoords = convertToRoomCoords(x, y, z, roomX, roomZ, rotation)
    ChatLib.chat(`Room Coords: ${JSON.stringify(roomCoords)}`)
}).setName("roomcoord")

let lastDungIndex = null
let currRoom = null // [roomX, roomZ, rotation]

export const getCurrRoomInfo = () => currRoom

/**
 * @callback RoomEnterExitFunction
 * @param {Number} roomX - The center X coordinate of the room
 * @param {Number} roomZ - The center Z coordinate of the room
 * @param {Number} rotation - The rotation of the room
 */

let roomEnterFunctions = []
/**
 * Runs a function when you enter a room section with only one direction occupied by a block (Usually a dead end 1x1)
 * Does not work for rooms which don't meet that criteria.
 * @param {RoomEnterExitFunction} func - The function to be ran
*/
export const onRoomEnter = (func) => roomEnterFunctions.push(func)
let roomExitFunctions = []
/**
 * Runs a function when you exit a room section with only one direction occupied by a block (Usually a dead end 1x1)
 * Does not work for rooms which don't meet that criteria.
 * @param {RoomEnterExitFunction} func - The function to be ran
 */
export const onRoomExit = (func) => roomExitFunctions.push(func)

const triggerFunctions = (arr, ...args) => arr.forEach(eventFunc => eventFunc(...args))

const roomExited = () => {
    if (!currRoom) return
    triggerFunctions(roomExitFunctions, ...currRoom)
    currRoom = null
}

register("tick", () => {
    if (!Dungeon.inDungeon) return roomExited()

    let [componentX, componentZ] = getRoomComponent()
    const index = componentX*6 + componentZ
    if (index == lastDungIndex) return

    lastDungIndex = index

    let rotation = null
    let [x, z] = getRoomCenter()
    
    if (!chunkLoaded(x, 0, z)) return
    
    for (let i = 0; i < doorOffsets.length; i++) {
        let [dx, dz] = doorOffsets[i]
        let block = World.getBlockAt(x+dx, 68, z+dz)
        let blockID = block.type.getID()
        if (!blockID) continue
        if (blockID !== 0 && rotation !== null) return roomExited()

        rotation = i*90
    }
    if (rotation == null) return roomExited()

    currRoom = [x, z, rotation]

    triggerFunctions(roomEnterFunctions, ...currRoom)
})
