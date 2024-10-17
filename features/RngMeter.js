
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { fn, registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data, prefix } from "../utils/Utils"

const rngMeterValues = JSON.parse(FileLib.read("Bloom", "data/RNGMeterValues.json"))


// Check if data exists for a floor and fills in missing data if it isn't.
const checkFloorDataExists = (floor) => {
    if (data.rngMeter.data[floor]) return
    data.rngMeter.data[floor] = {
        score: 0,
        needed: 0,
        item: null
    }
    data.save()
}

const addScore = (floor, score) => {
    checkFloorDataExists(floor)
    data.rngMeter.data[floor].score += score
    data.save()
}

const setScore = (floor, score) => {
    checkFloorDataExists(floor)
    data.rngMeter.data[floor].score = score
    data.save()
}

const getMeterData = (floor) => {
    checkFloorDataExists(floor)
    return data.rngMeter.data[floor]
}

// Sets the item for the floor. Item must be formatted using §. The goal score is set automatically if the item is in the RNGMeterValues.json file.
const setItem = (floor, item) => {
    checkFloorDataExists(floor)
    data.rngMeter.data[floor].item = item
    if (!item) data.rngMeter.data[floor].needed = 0
    else if (floor in rngMeterValues && item in rngMeterValues[floor]) data.rngMeter.data[floor].needed = rngMeterValues[floor][item]
    data.save()
}

// Generates a progress bar with the green area showing the percentage of the way to the rng meter item.
const getMeterBar = (floorData) => {
    let score = floorData.score
    let end = floorData.needed
    let bars = 15
    let percentage = score/end
    if (percentage > 1) percentage = 1
    let progress = Math.floor(bars*percentage)
    return `&d${fn(score)} &a&m&l${" ".repeat(progress)}&7&m&l${" ".repeat(bars-progress)}&r &d${fn(end)}`
}

// Gets the RNG meter gui string to be rendered based on the floor
const getRngMeterStr = (floor) => {
    let floorColor = floor.startsWith("M") ? "&c" : "&a"
    let str = `&dRNG Meter &8- ${floorColor}${floor}&r`
    let floorData = data.rngMeter.data[floor]
    if (!floorData) str += "\n&cNo RNG Meter Data!"
    else if (floorData.score && !floorData.needed) str += `\n&7Stored Score: &d${fn(floorData.score)}`
    else {
        let percentage = Math.floor(floorData.score / floorData.needed * 10000) / 100
        str += ` &8- &d${percentage}%\n`
        str += `&7Item: ${floorData.item}\n`
        str += getMeterBar(floorData)
    }
    return str
}

const renderMeterGui = (floor) => {
    let str = getRngMeterStr(floor)
    let split = str.split("\n")
    let maxWidth = Math.max(...split.map(a => Renderer.getStringWidth(a)))
    Renderer.retainTransforms(true)
    Renderer.translate(data.rngMeter.x, data.rngMeter.y)
    Renderer.scale(data.rngMeter.scale)
    if (Config.rngMeterBackground) Renderer.drawRect(Renderer.color(0, 0, 0, 175), -2, -2, maxWidth+4, split.length*9 + 4)
    Renderer.drawString(str, 0, 0)
    Renderer.retainTransforms(false)
}

registerWhen(register("renderOverlay", () => {
    if (Config.rngMeterMoveGui.isOpen()) return renderMeterGui("F5")
    if (!Config.rngMeter || !Dungeon.floor) return
    if (!Dungeon.runEnded && Config.rngMeterPostRun) return
    renderMeterGui(Dungeon.floor)
}), () => Config.rngMeterMoveGui.isOpen() || (Config.rngMeter && Dungeon.floor))

register("dragged", (dx, dy, x, y, btn) => {
    if (!Config.rngMeterMoveGui.isOpen()) return
    data.rngMeter.x = x
    data.rngMeter.y = y
    data.save()
})

register("scrolled", (mx, my, dir) => {
    if (!Config.rngMeterMoveGui.isOpen()) return
    if (dir == 1) data.rngMeter.scale += 0.02
    else data.rngMeter.scale -= 0.02
    data.save()
})

let scanned = false
register("guiClosed", () => scanned = false)
register("tick", () => {
    const inv = Player.getContainer()
    if (scanned || !inv || inv.getName() !== "Catacombs RNG Meter") return
    const items = inv.getItems()
    if (items.length < 35) return
    scanned = true
    items.slice(19, 35).forEach(item => {
        if (!item || item.getID() !== 397 || item.getName().removeFormatting() !== "RNG Meter") return
        let floor = null
        let drop = null
        let current = 0
        let lore = item.getLore()

        for (let line of lore) {
            let match = line.removeFormatting().match(/^Catacombs \((\w{1,2})\)$/)
            if (!match) continue
            floor = match[1]
            break
        }

        if (!data.rngMeter.data[floor]) data.rngMeter.data[floor] = {}

        let selected = lore.findIndex(a => a.removeFormatting() == "Selected Drop")
        if (selected !== -1 && selected+1 < lore.length) drop = lore[selected+1].slice(4)

        for (let line of lore) {
            let l = line.removeFormatting().trim()
            let match = l.match(/^([\w,]+)\/([\w\.,]+)$/)
            if (!match) continue
            let [_, curr, final] = match
            if (final.endsWith("k")) final = parseInt(final.slice(0, final.length-1)) * 1000
            curr = parseInt(curr.replace(/,/g, ""))
            current = curr
            needed = final
        }

        for (let line of lore) {
            let match = line.removeFormatting().match(/^Stored Dungeon Score: ([\d,]+)$/)
            if (!match) continue
            current = parseInt(match[1].replace(/,/g, ""))
            break
        }
        
        if (!floor) return

        setScore(floor, current)
        setItem(floor, drop)
    })
    data.save()
})

register("chat", (floor) => {
    setItem(floor, null)
}).setCriteria(/You reset your selected drop for your Catacombs \((\w{1,2})\) RNG Meter!/)

register("chat", (floor, item) => {
    setItem(floor, item.replace(/&/g, "§"))
}).setCriteria(/&r&aYou set your &r&dCatacombs \((\w{1,2})\) RNG Meter &r&ato drop &r(.+)&r&a!&r/)


let added = false // Don't add the score a second time when clicking "EXTRA STATS"
register("worldUnload", () => added = false)
register("chat", (score, rank) => {
    if (added) return
    score = parseInt(score)
    if (!["S", "S+"].includes(rank)) return

    if (rank == "S") score = Math.floor(score * 0.7)
    let floor = Dungeon.floor
    if (!floor) return

    const floorData = data.rngMeter.data[floor]
    if (!floorData) return

    // Check if the meter score has been reached
    // For some reason reaching the required score makes the item drop on the next run
    if (floorData.score >= floorData.needed && floorData.item) {
        data.rngMeter.data[floor].score -= data.rngMeter.data[floor].needed
        setItem(floor, null)
    }


    addScore(floor, score)
    added = true

    // Close alert
    let remaining = floorData.needed - floorData.score
    if (!Config.rngMeterWarnClose || remaining > Config.rngMeterRemainingAlert || remaining <= 0) return
    
    Client.showTitle(`&aRNGMeter`, `&6${fn(remaining)} &aScore Away`, 5, 50, 5)
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            World.playSound("random.successful_hit", 1, 0)
            ChatLib.chat(`${prefix} &aRNGMeter &6${fn(remaining)} &aScore Away!`)
        }, i*250);
    }
}).setCriteria(/^ *Team Score: (\d+) \(([\w\+]{1,2})\)$/)


// RNG Meter item was obtained, so reset the meter score.
register("chat", (item) => {
    // Change the formatting so it matches the RNGMeterValues.json item names (& -> § and no §r)
    const reformatted = item.replace(/&r/g, "").replace(/&/g, "§")
    if (!Dungeon.floor) return

    const floorData = getMeterData(Dungeon.floor)
    if (floorData.item !== reformatted) return

    // Reset the RNG Meter and add the score from the last run
    const percentage = (floorData.score / floorData.needed * 100).toFixed(2)
    ChatLib.chat(`${prefix} &aRNG Meter item reset! (&6${fn(floorData.score)} &bScore, &6${percentage}&b%&a)`)
    // setItem(Dungeon.floor, null)
    setScore(Dungeon.floor, 0)

}).setCriteria(/^&d&lRNG METER! &r&aReselected the (.+?) &afor .+ &e&lCLICK HERE &r&ato select a new drop!&r$/)

// Used to get the RNGMeterValues.json data

// let lootData = {}
// register("tick", () => {
//     const inv = Player.getContainer()
//     if (!inv) return
//     let m = inv.getName().match(/^(?:\(\d\/\d\) )*Catacombs \((\w{1,2})\) RNG Meter$/)
//     if (!m) return
//     let floor = m[1]
//     inv.getItems().slice(9, 44).forEach(i => {
//         if (!i || i.getID() == 160) return
//         let name = i.getName()
//         let lore = i.getLore()
//         for (let line of lore) {
//             let match = line.removeFormatting().match(/Dungeon Score: [\d,]+\/([\d,]+)/)
//             if (!match) continue
//             let val = parseInt(match[1].replace(/,/g, ""))
//             if (!lootData[floor]) lootData[floor] = {}
//             lootData[floor][name] = val
//             break
//         }

//     })
// })

// register("command", () => {
//     ChatLib.command(`ct copy ${JSON.stringify(lootData, null, 4)}`, true)
// }).setName("copydata")
