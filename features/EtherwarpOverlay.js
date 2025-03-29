import { renderBoxOutlineFromCorners, renderFilledBoxFromCorners } from "../../BloomCore/RenderUtils";
import { getLastSentCoord, getLastSentLook, holdingAOTV, validEtherwarpFeetBlocks } from "../../BloomCore/utils/Utils";
import Vector3 from "../../BloomCore/utils/Vector3";
import Config from "../Config";

const SNEAK_EYE_HEIGHT = 1.54
const PADDING = 0.005 // To make the rendering not glitchy on block faces

// Much more optimized version of BloomCore's bloated etherwarp raytracing
const simEtherwarp = (x0, y0, z0, x1, y1, z1) => {
    // Initialize Shit
    let x = Math.floor(x0)
    let y = Math.floor(y0)
    let z = Math.floor(z0)

    let endX = Math.floor(x1)
    let endY = Math.floor(y1)
    let endZ = Math.floor(z1)

    const dirX = x1 - x0
    const dirY = y1 - y0
    const dirZ = z1 - z0

    const stepX = Math.sign(dirX)
    const stepY = Math.sign(dirY)
    const stepZ = Math.sign(dirZ)

    const thingX = 1 / dirX
    const thingY = 1 / dirY
    const thingZ = 1 / dirZ

    const tDeltaX = Math.min(thingX * stepX, 1)
    const tDeltaY = Math.min(thingY * stepY, 1)
    const tDeltaZ = Math.min(thingZ * stepZ, 1)
    
    let tMaxX = Math.abs((x + Math.max(stepX, 0) - x0) * thingX)
    let tMaxY = Math.abs((y + Math.max(stepY, 0) - y0) * thingY)
    let tMaxZ = Math.abs((z + Math.max(stepZ, 0) - z0) * thingZ)

    let iters = 0
    while (true && iters++ < 1000) {

        // Do block check function stuff
        let currentBlock = World.getBlockAt(x, y, z)
        
        // End Reached
        if (currentBlock.type.getID() !== 0) {
            // Cannot stand ontop
            
            if (validEtherwarpFeetBlocks[currentBlock.type.getID()]) {
                return [false, x, y, z]
            }

            // Block the player's feet will be in after etherwarping
            let footBlock = World.getBlockAt(x, y+1, z)
            if (!validEtherwarpFeetBlocks[footBlock.type.getID()]) {
                return [false, x, y, z]
            }

            // Head block after etherwarp
            let headBlock = World.getBlockAt(x, y+2, z)
            if (!validEtherwarpFeetBlocks[headBlock.type.getID()]) {
                return [false, x, y, z]
            }

            return [true, x, y, z]
        }

        // End Reached without finding a block
        if (x == endX && y == endY && z == endZ) {
            return null
        }

        // Find the next direction to step in
        if (tMaxX < tMaxY) {
            if (tMaxX < tMaxZ) {
                tMaxX += tDeltaX
                x += stepX
            }
            else {
                tMaxZ += tDeltaZ
                z += stepZ
            }
        }
        else {
            if (tMaxY < tMaxZ) {
                tMaxY += tDeltaY
                y += stepY
            }
            else {
                tMaxZ += tDeltaZ
                z += stepZ
            }
        }
    }

    return null
}

const renderEtherBlock = (x, y, z, r, g, b, a) => {
    const chosenType = Config.etherwarpHighlightType

    const minX = x - PADDING
    const minY = y - PADDING
    const minZ = z - PADDING
    const maxX = x + 1 + PADDING
    const maxY = y + 1 + PADDING
    const maxZ = z + 1 + PADDING

    // Very readable
    const phase = chosenType == 3 || chosenType == 5 || chosenType == 1 || chosenType == 5

    // Any of Edges or Both
    if (chosenType == 0 || chosenType == 1 || chosenType == 4 || chosenType == 5) {
        renderBoxOutlineFromCorners(minX, minY, minZ, maxX, maxY, maxZ, r, g, b, 1, 1, phase)
    }

    // Any of Filled or Both
    if (chosenType == 2 || chosenType == 3 || chosenType == 4 || chosenType == 5) {
        renderFilledBoxFromCorners(minX, minY, minZ, maxX, maxY, maxZ, r, g, b, a, phase)
    }
}

const handleEtherBlock = (raytraceResult) => {
    // The raytrace missed everything
    if (!raytraceResult) {
        return
    }

    const [success, x, y, z] = raytraceResult

    // Hit an invalid block
    if (!success) {
        if (!Config.etherwarpShowFailLocation) {
            return
        }

        renderEtherBlock(x, y, z,
            Config.etherwarpOverlayFailColor.getRed() / 255,
            Config.etherwarpOverlayFailColor.getGreen() / 255,
            Config.etherwarpOverlayFailColor.getBlue() / 255,
            Config.etherwarpOverlayFailColor.getAlpha() / 255,
        )

        return
    }

    // Successful etherwarp
    renderEtherBlock(x, y, z,
        Config.etherwarpOverlayColor.getRed() / 255,
        Config.etherwarpOverlayColor.getGreen() / 255,
        Config.etherwarpOverlayColor.getBlue() / 255,
        Config.etherwarpOverlayColor.getAlpha() / 255,
    )
}

const doSyncedEther = () => {
    const lastPos = getLastSentCoord()
    const lastLook = getLastSentLook()

    if (!lastPos || !lastLook) {
        return
    }

    const x0 = lastPos[0]
    const y0 = lastPos[1] + SNEAK_EYE_HEIGHT
    const z0 = lastPos[2]

    const pitch = lastLook[0]
    const yaw = lastLook[1]

    // const lookVec = Vector3.fromPitchYaw(lastLook[0], lastLook[1]).multiply(61)
    const lookVec = Vector3.fromPitchYaw(pitch, yaw).multiply(61)
    const x1 = x0 + lookVec.x
    const y1 = y0 + lookVec.y
    const z1 = z0 + lookVec.z

    handleEtherBlock(simEtherwarp(x0, y0, z0, x1, y1, z1))
}

const doSmoothEther = () => {
    const x0 = Player.getX()
    const y0 = Player.getY() + SNEAK_EYE_HEIGHT
    const z0 = Player.getZ()

    const lookVec = Vector3.fromPitchYaw(Player.getPitch(), Player.getYaw()).multiply(61)

    const x1 = x0 + lookVec.x
    const y1 = y0 + lookVec.y
    const z1 = z0 + lookVec.z

    handleEtherBlock(simEtherwarp(x0, y0, z0, x1, y1, z1))
}

// The etherwarp raytrace will be done each frame
const renderer = register("renderWorld", () => {
    if (Config.etherwarpSyncWithServer) {
        doSyncedEther()
        return
    }

    doSmoothEther()
}).unregister()

// Check to see if the player is holding an AOTV and dynamically register and unregister the render trigger
const checker = register("tick", () => {
    if (!holdingAOTV()) {
        renderer.unregister()
        return
    }

    if (Config.etherwarpOverlayOnlySneak && !Player.isSneaking()) {
        renderer.unregister()
        return
    }

    renderer.register()
}).unregister()


// Dynamically register and unregister everything
if (Config.etherwarpOverlay) {
    checker.register()
}

Config.registerListener("Etherwarp Overlay", (state) => {
    if (state) {
        checker.register()
    }
    else {
        checker.unregister()
        renderer.unregister()
    }
})