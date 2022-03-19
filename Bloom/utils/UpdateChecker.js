import request from "../../requestV2"
import { prefix } from "./Utils"
import Config from "../Config"

let checked = false
register("step", () => {
    if (checked || !Config.updateChecker) return
    checked = true
    request("https://raw.githubusercontent.com/UnclaimedBloom6/BloomModule/main/api.json").then(stuff => {
        stuff = JSON.parse(stuff.replace(new RegExp("    ", "g"), ""))
        // ChatLib.chat(JSON.stringify(stuff, "", 4))
        let metadata = JSON.parse(FileLib.read("Bloom", "metadata.json"))

        if (metadata.version !== stuff.latestVersion) {
            new Message(`&9&m${ChatLib.getChatBreak(" ")}\n`,
            new TextComponent(`${prefix} &aA new version of Bloom is available! (&c${stuff.latestVersion}&a) Click to go to the Github page! `).setClick(
                "open_url",
                "https://github.com/UnclaimedBloom6/BloomModule"
            ).setHover(
                "show_text",
                "&aClick to open\n&7https://github.com/UnclaimedBloom6/BloomModule"
            ),
            new TextComponent(`&7(Changelog)`).setHover(
                "show_text",
                `&6&nChangeLog for ${stuff.latestVersion}:\n &7- ` + stuff.changelog.join("\n &7- ")
            ),
            `\n&9&m${ChatLib.getChatBreak(" ")}`).chat()
        }
    }).catch(error => {
        ChatLib.chat(`${prefix} &cError whilst checking for update: ${error}`)
    })
})