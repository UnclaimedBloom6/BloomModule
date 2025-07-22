import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { onChatPacket } from "../../BloomCore/utils/Events";
import ScalableGui from "../../BloomCore/utils/ScalableGui";
import { onServerTick } from "../../BloomCore/utils/ServerTime";
import PogObject from "../../PogData";
import Config from "../Config";
import splitInfo from "../data/floorSplits";
import { data, prefix } from "../utils/Utils";

// floorSplits.js:
// If a master mode floor is not present, the splits for the normal floor version will be used and still saved as Master Mode
// If a split segment does not contain a starting key, it will use the end of the previous split for starting
// If a split does not have an end key, the split will end when the run ends.

const editGui = new ScalableGui(data, data.betterSplits).setCommand("bloommoverunsplits")

const bestSplits = new PogObject("Bloom", {}, "data/bestSplits.json") // {"FLOOR": [seg1ms, seg2ms, seg3ms, ...]}

// https://regex101.com/r/RbZslx/1
const RUN_END_CRITERIA = /^\s*☠ Defeated (.+) in 0?([\dhms ]+?)\s*(\(NEW RECORD!\))?$/
let currRunSplits = null // {Boss Kill: { start: TIMESTAMP, end: null }, ...}

const triggers = []
let currentFloor = null
let ticksPassed = 0

// Unregister everything, reset variables
const cleanUp = () => {
    while (triggers.length) {
        triggers.pop().unregister()
    }

    currRunSplits = null
    currentFloor = null
    ticksPassed++
    ticker.unregister()
}

register("worldUnload", cleanUp)

// Time is formatted in the form m:ss
const formatTime = (ticks, msDigits=2) => {
    const timeMs = ticks * 50
    const ms = `${timeMs % 1000}`
    const msStr = "0".repeat(3 - ms.length) + ms
    const sec = Math.floor(timeMs / 1000)

    return `${sec}.${msStr.slice(0, msDigits)}`
}

const saveBestSplit = (floor, segmentName, timeMs) => {
    const unformatted = segmentName.removeFormatting()

    // Create if needed
    if (!(floor in bestSplits)) bestSplits[floor] = {}
    if (!(unformatted in bestSplits[floor])) bestSplits[floor][unformatted] = null

    // Update and save the new PB for this segment
    bestSplits[floor][unformatted] = timeMs
    bestSplits.save()
}

const getBestSplit = (floor, segmentName) => {
    const unformatted = segmentName.removeFormatting()

    if (!(floor in bestSplits) || !(unformatted in bestSplits[floor])) return null

    return bestSplits[floor][unformatted]
}

// Load the splits for the given floor, start listening for chat messages
const registerSplits = (floor) => {
    let floorKey = floor

    if (!(floorKey in splitInfo)) {
        floorKey = "F" + floorKey.slice(1)
        if (!(floorKey in splitInfo)) {
            // ChatLib.chat(`Could not find split for ${floor}`)
            return
        }
    }

    currentFloor = floor
    const splitData = splitInfo[floorKey]
    currRunSplits = {}
    ticker.register()

    for (let i = 0; i < splitData.length; i++) {
        let segment = splitData[i]

        currRunSplits[segment.name] = {
            start: null, // Ticks
            end: null, // Ticks
            startTime: null, // Date/ms
            endTime: null, // Date/ms
            diffFromBest: null, // Distance from best, negative number = faster, positive = slower
        }
        
        let currSplit = currRunSplits[segment.name]
        let currSplitIndex = i

        // The start criteria will fall back to the end criteria of the previous split if not set
        let startCriteria = segment.start ?? null
        // The end criteria will just use the run end message if not set
        let endCriteria = segment.end ?? RUN_END_CRITERIA

        let startTrigger = null
        if (startCriteria) {
            startTrigger = onChatPacket(() => {
                currSplit.start = ticksPassed
                startTrigger.unregister()
            }).setCriteria(startCriteria)
        }

        // Chat packet used so other mods cannot fuck with the splits not being detected
        let endTrigger = onChatPacket(() => {
            // Segments cannot end if they have not started
            if (!currSplit.start) return

            currSplit.end = ticksPassed
            currSplit.endTime = Date.now()
            let { start, end } = currSplit
            
            const tickDelta = end - start

            const deltaMs = tickDelta * 50
            const oldBest = getBestSplit(floor, segment.name)

            const timeDiff = oldBest == null ? -deltaMs : oldBest - deltaMs
            currSplit.diffFromBest = Math.floor(timeDiff / 50)

            if (oldBest == null || deltaMs < oldBest) {
                saveBestSplit(floor, segment.name, tickDelta * 50)
                ChatLib.chat(`${prefix} &dNew segment PB for ${floor.startsWith("M") ? "&c" : "&a"}&l${floor} ${segment.name}: ${formatTime(tickDelta)}`)
            }

            endTrigger.unregister()

            // Fucking cancer way of doing this
            if (currSplitIndex < splitInfo[floorKey].length-1 && !splitInfo[floorKey][currSplitIndex+1].start) {
                let nextSeg = splitInfo[floorKey][currSplitIndex+1].name
                currRunSplits[nextSeg].start = ticksPassed
                currRunSplits[nextSeg].startTime = Date.now()
            }
        }).setCriteria(endCriteria)

        if (startTrigger) {
            triggers.push(startTrigger)
        }
        triggers.push(endTrigger)
    }

    triggers.push(register("renderOverlay", () => {
        if (!Dungeon.bossEntry && !editGui.isOpen()) return
        renderGui()
    }))
}

// Renderer hell
const renderGui = () => {
    const splitTitle = `${currentFloor.startsWith("M") ? "&c" : "&a"}&l${currentFloor} &aSegments`

    const splitTimes = {} // "splitName": "timeElapsedStr"

    Object.entries(currRunSplits).forEach(([name, info]) => {
        let { start, end } = info
        let timeStr = "&e--.--"

        if (!end) {
            end = ticksPassed
        }

        if (start) {
            let delta = end - start
            timeStr = `&e${formatTime(delta)}`
        }

        splitTimes[name] = timeStr
    })

    // Left padded, so can just join them all
    const segmentNameCol = Object.keys(splitTimes).join("\n")
    const CENTER_PADDING = 15 // At least 15 pixels between the segment name and time

    const maxNameLength = Math.max(...Object.keys(splitTimes).map(a => Renderer.getStringWidth(a)))
    const maxTimeLength = Math.max(...Object.values(splitTimes).map(a => Renderer.getStringWidth(a)))

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    // Draw the title
    Renderer.drawString(splitTitle, (maxNameLength + CENTER_PADDING + maxTimeLength) / 2 - Renderer.getStringWidth(splitTitle)/2, 0)

    // The segment names
    Renderer.drawString(segmentNameCol, 0, 10)

    
    // The segment times
    const timeStartX = maxNameLength + CENTER_PADDING
    Object.values(splitTimes).forEach((time, i) => {
        const textWidthOffset = maxTimeLength - Renderer.getStringWidth(time)
        Renderer.drawString(time, timeStartX + textWidthOffset, (i+1)*10)
    })

    // The time lost or gained
    const timeDiffStartX = timeStartX + maxTimeLength
    const timeDiffPadding = 5
    Object.entries(currRunSplits).forEach(([segment, info], i) => {
        const { start, end, diffFromBest } = info

        if (diffFromBest == null) {
            return
        }

        const delta = end - start
        const prefix = diffFromBest > 0 ? "-" : "+"
        const color = diffFromBest > 0 ? "&6" : diffFromBest < delta * 0.1 ? "&c" : "&e" // Gold if PB, green if not, yellow if >10% from best
        const toDraw = `${color}(${prefix}${formatTime(Math.abs(diffFromBest), 2)})`

        Renderer.drawString(toDraw, timeDiffStartX + timeDiffPadding, (i+1)*10)
    })

    Renderer.retainTransforms(false)
    Renderer.finishDraw()

}

register("tick", () => {
    if ((!Config.runSplits || !Dungeon.floor) && !editGui.isOpen()) {
        cleanUp()
        return
    }
    if (triggers.length) return

    registerSplits(Dungeon.floor)
})

let fakeSplits = false
editGui.onOpen(() => {
    if (currRunSplits) return
    registerSplits("M7")
    fakeSplits = true
})

editGui.onClose(() => {
    if (!fakeSplits) return
    fakeSplits = false

    cleanUp()
})

register("command", (floor) => {
    if (!floor) {
        ChatLib.chat(`&c/resetsplits <floor>`)
        return
    }

    floor = floor.toUpperCase()

    if (!(floor in bestSplits)) {
        ChatLib.chat(`&cNo splits saved for ${floor}!`)
        return
    }

    delete bestSplits[floor]
    bestSplits.save()

    ChatLib.chat(`&aDeleted split PBs for ${floor}!`)
}).setName("resetsplits")

const ticker = onServerTick(() => {
    ticksPassed++
}).unregister()