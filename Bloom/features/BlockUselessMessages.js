import Config from "../Config"
class BlockUselessMessages {
    constructor() {
        const uselessMsgs = [
            /Your .+ hit .+ for [\d,.]+ damage\./,
            /There are blocks in the way!/,
            /You do not have enough mana to do this!/,
            /\[NPC\] Mort: .+/,
            /\+\d+ Kill Combo.+/,
            /Thunderstorm is ready to use! Press DROP to activate it!/,
            /.+ healed you for .+ health!/,
            /You earned .+ GEXP from playing .+!/,
            /.+ unlocked .+ Essence x\d+!/,
            /This ability is on cooldown for 1s\./,
            /You do not have the key for this door!/,
            /The Stormy .+ struck you for .+ damage!/,
            /Please wait a few seconds between refreshing!/
        ]
        register("chat", (message, event) => {
            if (!Config.blockUselessMessages) return
            uselessMsgs.forEach(msg => {
                if (message.removeFormatting().match(msg)) {
                    cancel(event)
                }
            })
        }).setCriteria("${message}")
    }
}
export default new BlockUselessMessages()