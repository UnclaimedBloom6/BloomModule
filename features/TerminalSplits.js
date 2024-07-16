import { onChatPacket } from "../../BloomCore/utils/Events"
import Config from "../Config"

let phase = 1
let lastCompleted = [0, 7] // [completed, total]
let gateBlown = false
let phaseStarted = null
let times = []

const newPhase = () => {
    let secs = Math.floor((Date.now() - phaseStarted)/10)/100
    times.push(secs)
    phaseStarted = Date.now()
    phase++
    gateBlown = false
    lastCompleted = [0, 7]
}

onChatPacket((completed, total) => {
    completed = parseInt(completed)
    total = parseInt(total)
    if (completed < lastCompleted[0] || (completed == total && gateBlown)) return newPhase()
    lastCompleted = [completed, total]
}).setCriteria(/.+ [activated|completed]+ a .+! \((\d)\/(\d)\)/)

onChatPacket(() => {
    if (lastCompleted[0] == lastCompleted[1]) newPhase()
    else gateBlown = true
}).setCriteria("The gate has been destroyed!")

onChatPacket(() => {
    if (!Config.terminalSplits) return
    newPhase()
    let msg = times.reduce((a,b,i) => a+`&2${i+1}: &a${b} &8| `, "&dTerminals: ")+`&6Total: ${Math.floor(times.reduce((a, b) => a+b, 0)*100)/100}`
    new TextComponent(msg).setClick("run_command", `/ct copy ${msg.removeFormatting()}`).chat()
}).setCriteria("The Core entrance is opening!")

onChatPacket(() => {
    phaseStarted = Date.now()
}).setCriteria("[BOSS] Goldor: Who dares trespass into my domain?")

register("worldLoad", () => {
    phase = 1
    lastCompleted = [0, 7]
    gateBlown = false
    phaseStarted = null
    times = []
})