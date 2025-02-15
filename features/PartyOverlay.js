import { data } from "../utils/Utils"
import ScalableGui from "../../BloomCore/utils/ScalableGui"
import PartyV2 from "../../BloomCore/PartyV2"

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
        data.party.x * data.party.scale,
        data.party.y * data.party.scale,
    )

    for (let i = 0; i < members.length; i++) {
        let { name, formattedName, online } = members[i]

        let final = ""
        if (PartyV2.leader == name) final += "&6♔ &r"
        final += formattedName
        final += ` ${online ? "&a" : "&c"}●`

        Renderer.drawStringWithShadow(
            final,
            data.party.x * data.party.scale,
            (data.party.y + (i+1) * 10) * data.party.scale,
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

register("tick", () => {
    if (PartyV2.inParty || moveGui.isOpen()) {
        renderTrigger.register()
    }
    else {
        renderTrigger.unregister()
    }
})
