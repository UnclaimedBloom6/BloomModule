// import { getCurrentRoom, getRoomCorner } from "../../BloomCore/utils/Utils"


// const target = [-25, 74, -25]
// let solved = false

// register("tick", () => {
//     let room = getCurrentRoom()
//     if (solved || !room || room.name !== "Creeper Beams") return
//     solved = true
//     let [x0, z0] = getRoomCorner()
//     let lanterns = []
//     for (let x = x0; x < x0+32; x++) {
//         for (let y = 68; y < 85; y++) {
//             for (let z = z0; z < z0+32; z++) {
//                 let block = World.getBlockAt(x, y, z)
//                 if (block.type.getID() !== 169) continue
//                 lanterns.push([x, y, z])
//             }
//         }
//     }
//     ChatLib.chat(lanterns.map(a => a.join(",")).join("\n"))
// })