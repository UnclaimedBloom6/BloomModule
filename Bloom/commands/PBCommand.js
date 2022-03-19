import Party from "../utils/Party"
import { getMojangInfo, getRecentProfile, getSbProfiles, prefix, toTime } from "../utils/Utils"

register("command", (floor) => {
    if (!floor) return ChatLib.chat(`${prefix} &c/pb <floor> - Gets the pbs of everyone in your party for a floor. Use /ds p for more stats.`)
    if (!Object.keys(Party.members).length) return ChatLib.chat(`${prefix} &cParty Empty!`)
    floor = floor.replace(/[^\d]/g, "").trim()
    if (parseInt(floor) > 7) return ChatLib.chat(`${prefix} &cInvalid Floor!`)
    for (let player of Object.keys(Party.members)) {
        let p = player
        getMojangInfo(p).then(mojangInfo => {
            mojangInfo = JSON.parse(mojangInfo)
            let uuid = mojangInfo.id
            getSbProfiles(uuid).then(profiles => {
                let profile = getRecentProfile(JSON.parse(profiles), uuid)

                let dung = profile.members[uuid].dungeons
                const getTimes = (type) => ["catacombs", "master_catacombs"].map(a => toTime(dung.dungeon_types[a]?.[type]?.[floor])).join(" &8- &c").replace(/\?/g, "-")
                // let s = getTimes("fastest_time_s")
                let sPlus = getTimes("fastest_time_s_plus")
                ChatLib.chat(`${Party.members[p]} &8| &eFloor ${floor} &8| &bS+ &8- &a${sPlus}`)
            })
        })
    }
}).setName("pb")