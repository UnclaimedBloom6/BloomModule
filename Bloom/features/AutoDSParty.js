import { hidePartyStuff } from "../Utils/Utils"

class AutoDSParty {
    constructor() {
        register("chat", (player, classs, level) => {
            if (player !== Player.getName()) return
            new Thread(() => {
                hidePartyStuff(750)
                ChatLib.command("pl")
                Thread.sleep(750)
                ChatLib.command("ds p", true)
            }).start()
        }).setChatCriteria("Dungeon Finder > ${player} joined the dungeon group! (${classs} Level ${*})")
    }
}
export default new AutoDSParty()