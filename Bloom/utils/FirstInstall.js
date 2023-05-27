import { data, prefix } from "./Utils";

const zeroPingGithub = "https://github.com/UnclaimedBloom6/ZeroPingTerminals"

const checkFirstInstall = () => {
    if (!data.firstTime) return
    data.firstTime = false
    data.save()

    const msgs = [
        "&b&lBloom",
        "",
        "&aTo get started, run the &b/bl &acommand."
    ]
    ChatLib.chat(`&b&m${ChatLib.getChatBreak(" ")}`)
    msgs.forEach(a => ChatLib.chat(ChatLib.getCenteredText(a)))
    ChatLib.chat(`&b&m${ChatLib.getChatBreak(" ")}`)
}

const checkZeroPing = () => {
    if (data.notifiedZeroPing) return
    data.notifiedZeroPing = true
    data.save()
    new Message(
        `\n`,
        `${prefix} &aNOTE: Zero Ping Terminals has been moved to it's own module.\n`,
        `&eYou can get Zero Ping Terminals here:\n`,
        new TextComponent(`&aClick Here to go to the Github page!`).setClick("open_url", zeroPingGithub).setHover("show_text", `&dClick to go to &a${zeroPingGithub}`),
        `\n`
    ).chat()
}

register("tick", () => {
    checkFirstInstall()
    checkZeroPing()
})