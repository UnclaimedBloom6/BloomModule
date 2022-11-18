// import Dungeon from "../../BloomCore/dungeons/Dungeon";
// import { BlockPoss, EntityItemFrame, getCurrentRoom, getEntityXYZ, getMapColors, getObjectXYZ } from "../../BloomCore/utils/Utils";
// import RenderLib from "../../RenderLib";
// import { prefix } from "../utils/Utils";
// import Config from "../Config"

// let board = null
// let nextMove = null
// let inTTT = false
// let gameFinished = false

// const dirs = {
//     0: [0, 1],
//     90: [-1, 0],
//     180: [0, -1],
//     270: [1, 0]
// }

// class Position {
//     /**
//      * 
//      * @param {Block} block 
//      */
//     constructor(block) {
//         this.block = block
//         this.player = null
//         this.frame = null
//     }
//     setFrame(frame) {
//         // ChatLib.chat("Setting new frame")
//         if (!frame) return
//         let item = frame.getEntity().func_82335_i()
//         if (!item) return
//         let mapItem = new Item(item)
//         let colors = getMapColors(mapItem)
//         if (!colors) return
//         this.frame = frame
//         let red = colors.indexOf(114)
//         if (red == -1) return
//         if (red == 2700) {
//             this.player = "X"
//             nextMove = board.getNextStep()
//         }
//         else this.player = "O"
//     }
// }

// class Board {
//     /**
//      * 
//      * @param {Position[]} positions - Blocc
//      */
//     constructor(positions) {
//         this.positions = positions
//     }
//     getSimpleBoard() {
//         return this.positions.reduce((a, b) => {
//             if (!a) return [...a, null]
//             return [...a, b.player]
//         }, [])
//     }
//     printBoard() {
//         let b = this.getSimpleBoard()
//         ChatLib.chat(Array(3).fill().map((_, i) => b.slice(i*3, i*3+3).map(a => !a ? "-" : a).join(" ")).join("\n"))
//     }
//     getPosAt(ind) {
//         return getObjectXYZ(this.positions[ind])
//     }
//     getWinner(x) {
//         return Array(8).fill().map((_,i)=>"012345678036147258048246".slice(i*3,i*3+3).split("").reduce((a,b)=>!!b?[...a,x[parseInt(b)]]:a,[]).filter(a=>!!a)).map(a=>a.length==3?[...new Set(a)]:0).reduce((a,b)=>!!b&&b.length==1?b[0]:a,null)
//     }
//     getNextStep() {
//         // this.printBoard()
//         let simpleBoard = this.getSimpleBoard()
//         let win = this.getWinner(simpleBoard)
//         if (win || (!win && simpleBoard.every(a => !!a))) {
//             gameFinished = true
//             board = null
//             nextMove = null
//             return
//         }
//         let possibleMoves = simpleBoard.map((v, i) => v ? null : i).filter(a => a !== null)
//         let [m, p] = ["O", "X"].map(v => possibleMoves.reduce((a, b) => {
//             let newBoard = [...simpleBoard]
//             newBoard[b] = v
//             let winner = this.getWinner(newBoard)
//             if (!winner) return [...a, 0]
//             if (winner == v && v == "O") return [...a, 10]
//             return [...a, -10]
//         }, []))
    
//         let totalMoves = simpleBoard.reduce((a, b) => !!b ? a+1 : a, 0)
    
//         if (totalMoves == 1) {
//             if (!simpleBoard[4]) return 4
//             if (simpleBoard[4] == "X") return 0
//         }
//         else {
//             if (m.includes(10)) return possibleMoves[m.indexOf(10)]
//             if (p.includes(-10)) return possibleMoves[p.indexOf(-10)]
//             return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
//         }
//     }
// }

// register("tick", () => {
//     if (!inTTT || !board || !Config.tttSolver) return
//     let frames = World.getAllEntitiesOfType(EntityItemFrame)
//     for (let i = 0; i < frames.length; i++) {
//         let [x, y, z] = getObjectXYZ(frames[i]).map(a => Math.floor(a))
//         let pos = board.positions.findIndex(a => a.block.getX() == x && a.block.getY() == y && a.block.getZ() == z)
//         if (pos == -1 || board.positions[pos].frame) continue
//         board.positions[pos].setFrame(frames[i])
//     }
// })

// // register("command", () => {
// //     if (!board) return ChatLib.chat("NO BOARD")
// //     board.printBoard()
// // }).setName("board")

// register("tick", () => {
//     if (!Dungeon.inDungeon || !Config.tttSolver) return inTTT = false
//     let room = getCurrentRoom()
//     inTTT = room && room.name == "Tic Tac Toe"
//     if (!inTTT || gameFinished || board) return

//     let itemFrames = World.getAllEntitiesOfType(EntityItemFrame)
//     if (!itemFrames.length) return

//     let frame = itemFrames[0]
//     let yaw = frame.getYaw()
//     if (yaw < 0) yaw += 360
//     let [ix, iy, iz] = getEntityXYZ(frame).map(a => Math.floor(a))
//     let bps = BlockPoss.func_177980_a(new BlockPoss(ix-2, 72, iz-2), new BlockPoss(ix+2, 70, iz+2))
//     let blocks = []
//     bps.forEach(v => blocks.push(v))
//     let ironBlocks = blocks.reduce((a, b) => {
//         let [x, y, z] = getObjectXYZ(new BlockPos(b))
//         let isIron = World.getBlockAt(x, y, z).type.getID() == 42
//         if (isIron) return [...a, [x, y, z]]
//         return a
//     }, [])

//     let minX = Math.min(...ironBlocks.map(a => a[0]))
//     let minY = Math.min(...ironBlocks.map(a => a[1]))
//     let minZ = Math.min(...ironBlocks.map(a => a[2]))
//     let maxX = Math.max(...ironBlocks.map(a => a[0]))
//     let maxY = Math.max(...ironBlocks.map(a => a[1]))
//     let maxZ = Math.max(...ironBlocks.map(a => a[2]))

//     let positions = []

//     let [ox, oz] = dirs[yaw]
//     for (let y = maxY; y >= minY; y--) {
//         for (let x = maxX; x >= minX; x--) {
//             for (let z = maxZ; z >= minZ; z--) {
//                 positions.push(new Position(World.getBlockAt(x+ox, y, z+oz)))
//             }
//         }
//     }

//     board = new Board(positions)
// })

// export const getNextMove = () => [-1, null].includes(nextMove) || !board ? null : getObjectXYZ(board.positions[nextMove].block)
// export const isInTTT = () => inTTT

// register("tick", () => {
//     if (!inTTT || !nextMove || !Config.tttSolver) return
//     let next = getNextMove()
//     if (World.getBlockAt(...next).type.getID() == 77) return
//     nextMove = null
// })

// register("renderWorld", () => {
//     if (!Config.tttSolver || !inTTT || !board || nextMove == -1 || nextMove == null) return
//     let thing = board.positions[nextMove]
//     if (!thing) return 
//     let [x, y, z] = getObjectXYZ(thing.block)
//     RenderLib.drawEspBox(x+0.5, y, z+0.5, 1, 1, 0, 1, 0, 1, true)
// })

// register("worldUnload", () => {
//     board = null
//     inTTT = false
//     nextMove = null
//     gameFinished = false
// })