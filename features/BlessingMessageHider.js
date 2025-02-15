import Config from "../Config"
import { registerTriggers } from "../utils/Utils"

const triggers = []

const blessings = [
    /^DUNGEON BUFF! .+ found a Blessing of .+!$/,
    /^     Granted you .+\.$/,
    /^     Grants you .+\.$/,
    /^     Also granted you .+ & .+\.$/,
    /^.+ has obtained Blessing of .+!$/,
    /^DUNGEON BUFF! A Blessing of .+ was found! .+$/,
    /^A Blessing of .+ was picked up!$/
]

blessings.forEach(regex => {
    triggers.push(register("chat", (event) => {
        if (!Config.hideBlessingMessages) return
        cancel(event)
    }).setCriteria(regex).unregister())
})

registerTriggers(triggers, Config.hideBlessingMessages)

Config.registerListener("Hide Blessing Messages", state => {
    registerTriggers(triggers, state)
})