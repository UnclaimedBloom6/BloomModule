import Config from "../Config";
import request from "requestV2/index"

class BridgeChat {
    constructor() {
        this.bridgeBot = null
        let guildId = "5d8401ef77ce8436b66ac215"
        request({
            url:"https://fragbots.antonio32a.com",
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        }).then(data => {
            data = JSON.parse(data)
            for (let i = 0; i < data.length; i++) {
                if (data[i].guildId == guildId) {
                    this.bridgeBot = data[i].username
                }
            }
            if (!this.bridgeBot) return
            register("chat", (event) => {
                let formatted = ChatLib.getChatMessage(event)
                let unformatted = ChatLib.removeFormatting(formatted)
                let match = unformatted.match(/Guild > (.+): (.+) > (.+)/)
                if (!match) return
                if (match[1].includes(this.bridgeBot)) {
                    cancel(event)
                    return ChatLib.chat(`&2Guild > &6${match[2]} &2[Discord]&f: ${match[3]}`)
                }
            })
        }).catch(error => {
            // ChatLib.chat(error)
        })
    }
}
export default new BridgeChat()