import { data } from "./Utils";

register("step", () => {
    if (!data.firstTime) return
    data.firstTime = false
    data.save()
    let msgs = [
        `&a&lThank you for installing Bloom module!\n`,
        `&bIf you came here for zero ping terminals, but used /ct import`,
        `&bthen you will need to go to the GitHub page and download`,
        `&bthat version of the module instead.\n`,
        `&eIf you are still using BloomCommands, you can remove`,
        `&ethat module since this one contains all of those commands.\n`,
        `&aTo get started, use &b/bl&a.`
    ]
    ChatLib.chat(`&b&m${ChatLib.getChatBreak(" ")}`)
    msgs.map(a => ChatLib.chat(ChatLib.getCenteredText(a)))
    ChatLib.chat(`&b&m${ChatLib.getChatBreak(" ")}`)
}).setFps(5)