import { getMojangInfo, getRecentProfile } from "../../BloomCore/utils/APIWrappers"
import Party from "../../BloomCore/Party"
import { prefix } from "../utils/Utils"
import { bcData, convertToPBTime } from "../../BloomCore/utils/Utils"

export const pbCommand = register("command", (floor) => {
    if (!floor) return ChatLib.chat(`${prefix} &c//pb <floor> - Gets the pbs of everyone in your party for a floor. Use /ds p for more stats.`)
    if (!Object.keys(Party.members).length) return ChatLib.chat(`${prefix} &cParty Empty!`)
    floor = floor.replace(/[^\d]/g, "").trim()
    if (parseInt(floor) > 7) return ChatLib.chat(`${prefix} &cInvalid Floor!`)
    for (let player of Object.keys(Party.members)) {
        let p = player
        getMojangInfo(p).then(mojangInfo => {
            let uuid = mojangInfo.id
            getRecentProfile(uuid, null, bcData.apiKey).then(profile => {
                let dung = profile.members[uuid].dungeons
                const getTimes = (type) => ["catacombs", "master_catacombs"].map(a => convertToPBTime(dung.dungeon_types[a]?.[type]?.[floor])).join(" &8- &c").replace(/\?/g, "-")
                let sPlus = getTimes("fastest_time_s_plus")
                ChatLib.chat(`${Party.members[p]} &8| &eFloor ${floor} &8| &bS+ &8- &a${sPlus}`)
            })
        })
    }
}).setName("/pb")