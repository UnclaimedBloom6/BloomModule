import { stripRank } from "../../BloomCore/Utils/Utils"
import Config from "../Config"

let lastDisbandedPlayer
let lastDisbandTime

register("chat", player => {
    player = stripRank(player)
    lastDisbandedPlayer = player
    lastDisbandTime = new Date().getTime()
}).setCriteria("${player} has disbanded the party!")

register("chat", player => {
    player = stripRank(player.replace(/.+>newLine<-/, ""))
    if (!Config.autoRejoinReparty || new Date().getTime() - lastDisbandTime > 10000 || player !== lastDisbandedPlayer) return
    new Thread(() => {
        Thread.sleep(Config.autoRejoinRepartyDelay)
        ChatLib.command(`p accept ${lastDisbandedPlayer}`)
        lastDisbandedPlayer = undefined
        lastDisbandTime = undefined
    }).start()
}).setCriteria("${player} has invited you to join ${*} party!${*}")