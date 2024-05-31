import { EntityItemFrame, MouseEvent, getDistanceToCoord, getEntityXYZ, registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"

// The rotations of each item frame, or 9 if there is no item frame or
// the item frame does not contain an arrow
const solutions = [
    [7,7,7,7,9,1,9,9,9,9,1,3,3,3,3,9,9,9,9,1,9,7,7,7,1],
    [9,9,9,9,9,1,9,1,9,1,1,9,1,9,1,1,9,1,9,1,9,9,9,9,9],
    [5,3,3,3,9,5,9,9,9,9,7,7,9,9,9,1,9,9,9,9,1,3,3,3,9],
    [9,9,9,9,9,9,1,9,1,9,7,1,7,1,3,1,9,1,9,1,9,9,9,9,9],
    [9,9,7,7,5,9,7,1,9,5,9,9,9,9,9,9,7,5,9,1,9,9,7,7,1],
    [7,7,9,9,9,1,9,9,9,9,1,3,3,3,3,9,9,9,9,1,9,9,9,7,1],
    [5,3,3,3,3,5,9,9,9,1,7,7,9,9,1,9,9,9,9,1,9,7,7,7,1],
    [7,7,9,9,9,1,9,9,9,9,1,3,9,7,5,9,9,9,9,5,9,9,9,3,3],
    [9,9,9,9,9,1,3,3,3,3,9,9,9,9,1,7,7,7,7,1,9,9,9,9,9]
]

const deviceStandLocation = [0, 120, 77]
const deviceCorner = [-2, 120, 75] // Bottom right corner of the device

const recentClicks = new Map() // The index: time of the last item frame clicked. Won't update these for a period after being clicked
const remainingClicks = new Map() // Index: Remaining Clicks, to reduce the processing needed during the render event
let currentFrames = null
let solution = null // Need to keep this here for weird edge case when clicking fast with block wrong clicks

const getCoordFromIndex = (index) => {
    const x = deviceCorner[0]
    const y = deviceCorner[1] + index % 5
    const z = deviceCorner[2] + Math.floor(index / 5)
    return [x, y, z]
}

// Will always return a 25 length array of ints
const getCurrentFrameRotations = () => {
    const itemFrames = World.getAllEntitiesOfType(EntityItemFrame)
    const posMap = new Map()

    // Process the existing item frames and save the positions and rotations
    for (let frame of itemFrames) {
        let pos = getEntityXYZ(frame).map(Math.floor)
        let posStr = pos.join()

        let mcItem = frame.getEntity().func_82335_i() // getDisplayedItem()
        if (!mcItem) continue

        let ctItem = new Item(mcItem)
        if (ctItem.getRegistryName() !== "minecraft:arrow") continue

        let rotation = frame.getEntity().func_82333_j() // getRotation()

        posMap.set(posStr, rotation)
    }

    // Construct the 25-length array of the board
    let [x, y0, z0] = deviceCorner
    let arr = []
    for (let dz = 0; dz < 5; dz++) {
        for (let dy = 0; dy < 5; dy++) {
            let index = dy + dz * 5

            // If this item frame has been clicked recently, then use the last value known before the click
            // makes the device feel nicer with high ping
            if (currentFrames && recentClicks.has(index) && Date.now() - recentClicks.get(index) < 1000) {
                arr.push(currentFrames[index])
                continue
            }

            let y = y0 + dy
            let z = z0 + dz
            let posStr = `${x},${y},${z}`

            // Valid arrow item frame, set this frame's index to it's current rotation
            if (posMap.has(posStr)) {
                arr.push(posMap.get(posStr))
                continue
            }
            
            // Not an arrow item frame
            arr.push(9)
        }
    }
    
    return arr
}

const getClicksForRotation = (start, end) => (8 - start + end) % 8

register("command", () => {
    const curr = getCurrentFrameRotations()
    ChatLib.command(`ct copy ${JSON.stringify(curr)}`, true)
    ChatLib.chat(`Copied the current device!\n${JSON.stringify(curr)}`)
}).setName("savedev")


register("tick", () => {
    // Too far away from device
    if (!Config.arrowAlignSolver || getDistanceToCoord(...deviceStandLocation) > 10) {
        currentFrames = null
        remainingClicks.clear()
        solution = null
        return
    }
    
    remainingClicks.clear()
    currentFrames = getCurrentFrameRotations()

    // Find the solution
    solutions.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
            // Checking for empty frames
            // If two empty frames don't match up, then we know that this isn't the correct solution
            if ((arr[i] == 9 || currentFrames[i] == 9) && arr[i] !== currentFrames[i]) return
        }
        
        solution = arr

        // And now calculate the clicks required for each frame
        for (let i = 0; i < arr.length; i++) {
            let curr = currentFrames[i]
            let needed = arr[i]
            let clicksNeeded = getClicksForRotation(curr, needed)

            // Don't need to worry about frames with no more clicks left
            if (clicksNeeded == 0) continue

            remainingClicks.set(i, clicksNeeded)
        }
    })
})

// Need to use a MouseEvent instead of an EntityInteractionEvent because for whatever reason
// cancelling the entity interaction won't work
registerWhen(register(MouseEvent, (event) => {
    const btn = event.button
    const btnState = event.buttonstate

    // Only want right clicks
    if (btn !== 1 || !btnState) return

    const la = Player.lookingAt()
    if (!la || !(la instanceof Entity) || !(la.getEntity() instanceof EntityItemFrame)) return

    // To make it easier to work with
    let [x, y, z] = getEntityXYZ(la).map(Math.floor)
    
    // Get the frame's board index
    let dy = y - deviceCorner[1]
    let dz = z - deviceCorner[2]
    let index = dy + dz * 5
    
    // Item frame which was not an arrow one was clicked, so ignore it
    if (x !== deviceCorner[0] || currentFrames[index] == 9 || index < 0 || index > 24) return

    // This item frame is already in the correct position
    if (!remainingClicks.has(index)) {
        if (Config.arrowAlignSolverBlockClicks && Player.isSneaking() == Config.alignSolverInvertSneak) {
            cancel(event)
            return
        }
    }
    
    recentClicks.set(index, Date.now())
    currentFrames[index] = (currentFrames[index] + 1) % 8

    const remaining = getClicksForRotation(currentFrames[index], solution[index])
    if (remaining == 0) remainingClicks.delete(index)

}), () => Config.arrowAlignSolver && currentFrames && solution)

registerWhen(register("renderWorld", () => {
    for (let e of remainingClicks.entries()) {
        let [index, clicks] = e
        let [x, y, z] = getCoordFromIndex(index)
        Tessellator.drawString(clicks.toString(), x, y+0.6, z+0.5, Renderer.WHITE, false, 0.03, false)
    }
}), () => remainingClicks.size !== 0)
