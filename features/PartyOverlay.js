import { data } from "../utils/Utils"
import ScalableGui from "../../BloomCore/utils/ScalableGui"
import PartyV2 from "../../BloomCore/PartyV2"
import Config from "../Config"

const exampleData = [
    {
        name: "UnclaimedBloom6",
        formattedRank: "&c[ADMIN]",
        online: true
    },
    {
        name: "Noob",
        formattedRank: "&7",
        online: false
    },
]

const moveGui = new ScalableGui(data, data.party).setCommand("bloommovepartyoverlay")

const render = (members) => {
    Renderer.drawStringWithShadow(
        `&cParty: (&6${PartyV2.size}&c)`,
        moveGui.getX() * moveGui.getScale(),
        moveGui.getY() * moveGui.getScale(),
    )

    for (let i = 0; i < members.length; i++) {
        let { name, formattedName, online } = members[i]

        let final = ""
        if (PartyV2.leader == name) final += "&6♔ &r"
        final += formattedName
        final += ` ${online ? "&a" : "&c"}●`

        Renderer.drawStringWithShadow(
            final,
            moveGui.getX() * moveGui.getScale(),
            (moveGui.getY() + (i+1) * 10) * moveGui.getScale(),
        )
    }
}

const renderTrigger = register("renderOverlay", () => {
    const members = Object.values(PartyV2.members)

    if (members.length) {
        render(members)
    }
    else {
        render(exampleData)
    }
}).unregister()

PartyV2.onPartyJoined(() => {
    if (Config.partyOverlay) {
        renderTrigger.register()
    }
})

PartyV2.onPartyDisband(() => {
    renderTrigger.unregister()
})

Config.registerListener("Party List Overlay", (state) => {
    if (state && PartyV2.size > 0) {
        renderTrigger.register()
    }
    else if (!state) {
        renderTrigger.unregister()
    }
})