import { getApiKeyInfo, getMojangInfo } from "../../BloomCore/utils/APIWrappers"
import { bcData, fn } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"

export const myKey = register("command", () => {
    if (!bcData.apiKey) return ChatLib.chat(`${prefix} &cError: API Key not set! Set it with &b/bl setkey <key>`)
    ChatLib.chat(`${prefix} &aGetting API Key stats...`)
    getApiKeyInfo(bcData.apiKey).then(keyInfo => {
        getMojangInfo(keyInfo.record.owner).then(mojangInfo => {
            ChatLib.chat(`\n&aYour API Key Stats`)
            ChatLib.chat(`&aOwner: &b${mojangInfo.name}`)
            ChatLib.chat(`&aQueries Last Min: &b${keyInfo.record.queriesInPastMin}`)
            ChatLib.chat(`&aTotal Queries: &b${fn(keyInfo.record.totalQueries)}\n`)
        })
    })
}).setName("mykey")
