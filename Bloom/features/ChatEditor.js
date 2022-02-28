import Config from "../Config"

let replacements = {
    "=/": "≠",
    "ez": "ｅｚ"
}
register("messageSent", (message, event) => {
    if (!Config.chatEditor) return
    if (message.startsWith("/") && !message.startsWith("/pc") && !message.startsWith("/ac") && !message.startsWith("/gc")) return
    let replaced = false
    message = message.split(" ")
    for (let i = 0; i < message.length; i++) {
        if (Object.keys(replacements).includes(message[i])) {
            replaced = true
            message[i] = replacements[message[i]]
        }
    }
    message = message.join(" ")
    if (!replaced) return
    cancel(event)
    ChatLib.say(message)
})