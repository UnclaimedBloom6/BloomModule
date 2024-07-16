
import { randint } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { prefix } from "../utils/Utils"

const messages = [
    "Nice one!",
    "Good job!",
    "Try again!",
    "Here you go.",
    "It's okay, we all make mistakes.",
    "Whoopsie daisy!",
    "Uh oh spaghettio",
    "Awesome!",
    "Absolute noob"
]

const architect = (player) => {
    if (!Config.autoArchitectDraft || (player !== Player.getName() && Config.autoArchitectDraftSelf)) return

    // Some delay since you can't use the command in combat
    Client.scheduleTask(30, () => {
        const chosenMessage = messages[randint(0, messages.length - 1)]

        ChatLib.chat(`${prefix} &a${chosenMessage}`)
        ChatLib.command("gfs architect's first draft 1")
    })
}

// Normal Puzzles
register("chat", architect).setCriteria(/^PUZZLE FAIL! (\w{1,16}) .+$/)

// Quiz
register("chat", architect).setCriteria(/^\[STATUE\] Oruo the Omniscient: (\w{1,16}) chose the wrong answer! I shall never forget this moment of misrememberance\.$/)