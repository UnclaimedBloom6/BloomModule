import { prefix, data, fn, getMojangInfo } from "../utils/Utils"
import request from "../../requestV2"

const myKey = register("command", () => {
    if (!data.apiKey) return ChatLib.chat(`${prefix} &cError: API Key not set! Set it with &b/bl setkey <key>`)
    new Message(`${prefix} &aGetting API Key stats...`).setChatLineId(75677).chat()
    request(`https://api.hypixel.net/key?key=${data.apiKey}`).then(keyStuff => {
        keyStuff = JSON.parse(keyStuff)
        getMojangInfo(keyStuff.record.owner).then(mojangInfo => {
            mojangInfo = JSON.parse(mojangInfo)
            ChatLib.clearChat(75677)
            ChatLib.chat(`\n&aYour API Key Stats`)
            ChatLib.chat(`&aOwner: &b${mojangInfo.name}`)
            ChatLib.chat(`&aQueries Last Min: &b${keyStuff.record.queriesInPastMin}`)
            ChatLib.chat(`&aTotal Queries: &b${fn(keyStuff.record.totalQueries)}\n`)
        })
    }).catch(error => {
        ChatLib.chat(`${prefix} &cError: ${error}`)
    })
}).setName("mykey")

export { myKey }