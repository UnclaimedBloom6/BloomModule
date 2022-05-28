import { hidePartySpam } from "../../BloomCore/Utils/Utils"
import Config from "../Config"

register("chat", (player, classs, level) => {
    if (!Config.autoDSParty || player !== Player.getName()) return
    new Thread(() => {
        hidePartySpam(750)
        ChatLib.command("pl")
        Thread.sleep(750)
        ChatLib.command("ds p", true)
    }).start()
}).setChatCriteria("Dungeon Finder > ${player} joined the dungeon group! (${classs} Level ${*})")