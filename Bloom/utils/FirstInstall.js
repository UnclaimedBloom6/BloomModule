import { data } from "./Utils";

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

const firstInstallTrigger = register("tick", () => {
    checkFirstInstall()
    firstInstallTrigger.unregister()
})