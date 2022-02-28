// ----------------------

// let phase = 1
// let lastProgress = [0, 7]
// register("chat", (message, event) => {
//     const nextPhase = () => {
//         phase++
//         ChatLib.chat(`&c&lPHASE ${phase}`)
//     }
//     if (message == "The gate has been destroyed!") {
//         ChatLib.chat(`&a&lGATE DROPPED P${phase}`)
//         if (lastProgress[0] !== lastProgress[1]) return
//         nextPhase()
//     }
//     let match = message.match(/(.+) [activated|completed]+ a (.+)! \((\d)\/(\d)\)/)
//     if (!match) return

//     let pt1 = parseInt(match[3])
//     let pt2 = parseInt(match[4])

//     if (lastProgress[1] !== pt2 && lastProgress[0] !== lastProgress[1]) nextPhase()

//     lastProgress = [pt1, pt2]
// }).setCriteria("${message}")

// register("worldLoad", () => {
//     phase = 1
//     lastProgress = [0, 7]
// })

// ----------------------

// register("command", () => {
//     new Thread(() => {
//         for (let i of testMessages) {
//             ChatLib.command(`ct simulate ${i}`, true)
//             Thread.sleep(100)
//         }
//     }).start()
// }).setName("phase")

// UnclaimedBloom6 activated a terminal! (1/7)
// UnclaimedBloom6 completed a device! (3/7)
// ChickenPielol activated a lever! (6/7)