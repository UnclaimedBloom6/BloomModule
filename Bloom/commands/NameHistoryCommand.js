import { prefix } from "../utils/Utils"
import { getMojangInfo, getNameHistory } from "../../BloomCore/Utils/APIWrappers"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const nameHistoryCommand = register("command", (player) => {
    getMojangInfo(player).then(mojangInfo => {
        if (!mojangInfo) return ChatLib.chat(`${prefix} &cThat is not a real player!`)
        let [username, uuid] = [mojangInfo.name, mojangInfo.id]
        getNameHistory(uuid).then(names => {
            names = names.reverse()
            let hoverStr = "&eName History"
            for (let i = 0; i < names.length; i++) {
                let date
                if (Object.keys(names[i]).includes("changedToAt")) {
                    let changedAt = new Date(names[i].changedToAt)
                    date = `${changedAt.getDate()} ${months[changedAt.getMonth()]} ${changedAt.getFullYear()}`
                }
                else date = "&bCreated"
                hoverStr += `\n&a${names[i].name} &e- &b${date}`
            }
            new Message(`&b${username} &8| `, new TextComponent("&7Name History").setHover("show_text", hoverStr)).chat()
        })
    })
}).setName("nh")