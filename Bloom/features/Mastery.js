import { getScoreboard, registerWhen, removeUnicode } from "../../BloomCore/utils/Utils"
import Config from "../Config"

let scanned = false
let mastery = false
let spawnLocations = []
let current = []
const woolLifetime = 7000 // Time taken in ms from wool spawning to disappearing

register("tick", () => {
    mastery = getScoreboard()?.map(a => removeUnicode(a))?.some(a => a == "Challenge: Mastery") && Config.dojoMastery
    if (mastery) return
    scanned = false
    spawnLocations = []
    current = [] 
})

register("tick", () => {
    if (!mastery || scanned) return
    scanned = true
    spawnLocations = []
    // Scan for the locations where the wool can spawn (Ontop of the oak logs).
    let [px, py, pz] = [parseInt(Player.getX()), parseInt(Player.getY()), parseInt(Player.getZ())]
    setTimeout(() => {
        for (let x = px-20; x < px+20; x++) {
            for (let y = py-5; y < py+5; y++) {
                for (let z = pz-20; z < pz+20; z++) {
                    let block = World.getBlockAt(x, y, z)
                    let id = block?.type?.getID()
                    if (id !== 17) continue
                    let secondaryId = World.getBlockAt(x, y+1, z)?.type?.getID()
                    if (![0, 35].includes(secondaryId)) continue
                    spawnLocations.push([x, y+1, z])
                }
            }
        }
        // If there are less than 26 spawn locations (Means chunks haven't all loaded) then scan again.
        if (spawnLocations.length !== 26) scanned = false
    }, 1000);
})

register("step", () => {
    if (!mastery) return
    // Check all of the spots where wool can spawn
    for (let i of spawnLocations) {
        let [x, y, z] = i
        if (current.some(a => a[0] == x && a[1] == y && a[2] == z)) continue
        let block = World.getBlockAt(x, y, z)
        if (block.type.getID() == 35) current.push([x, y, z, Date.now()])
    }
    // Check to see whether any of the places where wool previously existed have turned into air or it has been longer than 7 seconds
    for (let i = 0; i < current.length; i++) {
        let [x, y, z, ts] = current[i]
        if (Date.now() - ts > woolLifetime || !World.getBlockAt(x, y, z)?.type?.getID()) current.splice(i, 1)
    }
    current = current.sort((a, b) => a[3] - b[3])
})

registerWhen(register("renderWorld", () => {
    current.map((a, i) => {
        let [x, y, z, ts] = a
        let timeLeft = Math.floor((woolLifetime - (Date.now() - ts))/100)/10
        let color = Renderer.YELLOW
        if (timeLeft < 1) color = Renderer.GREEN
        Tessellator.drawString(`#${i+1}`, x, y+3, z, color, true, 0.08, false)
        Tessellator.drawString(timeLeft, x, y+2, z, color, true, 0.1, false)
    })
}), () => mastery)