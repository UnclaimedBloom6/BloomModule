import { onChatPacket } from "../../BloomCore/utils/Events"
import Config from "../Config"
import { registerTriggers } from "../utils/Utils"

const uselessMsgs = [
    /Your .+ hit .+ for [\d,.]+ damage\./,
    /There are blocks in the way!/,
    /You do not have enough mana to do this!/,
    /\+\d+ Kill Combo.+/,
    /Thunderstorm is ready to use! Press DROP to activate it!/,
    /.+ healed you for .+ health!/,
    /You earned .+ GEXP from playing .+!/,
    /.+ unlocked .+ Essence!/,
    /.+ unlocked .+ Essence x\d+!/,
    /This ability is on cooldown for 1s\./,
    /You do not have the key for this door!/,
    /The Stormy .+ struck you for .+ damage!/,
    /Please wait a few seconds between refreshing!/,
    /You cannot move the silverfish in that direction!/,
    /You cannot hit the silverfish while it's moving!/,
    /Your Kill Combo has expired! You reached a .+ Kill Combo!/,
    /Your active Potion Effects have been paused and stored. They will be restored when you leave Dungeons! You are not allowed to use existing Potion Effects while in Dungeons\./,
    /.+ has obtained Blood Key!/,
    /The Flamethrower hit you for .+ damage!/,
    /.+ found a Wither Essence! Everyone gains an extra essence!/,
    /Ragnarok is ready to use! Press DROP to activate it!/,
    /This creature is immune to this kind of magic!/
]

const triggers = []

uselessMsgs.forEach(msg => {
    triggers.push(register("chat", event => {
        if (!Config.blockUselessMessages) return
        cancel(event)
    }).setCriteria(msg).unregister())
})

registerTriggers(triggers, Config.blockUselessMessages)

Config.registerListener("Block Useless Messages", state => {
    registerTriggers(triggers, state)
})