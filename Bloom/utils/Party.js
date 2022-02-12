import { stripRank, hidePartyStuff } from "./Utils"

class Party {
	constructor() {
		this.members = {}
		this.leader = null
		this.excludePlayers = [] // Auto reparty won't reinvite these players
		this.memberJoined = [
			/(.+) &r&ejoined the party.&r/,
			/(.+) &r&einvited &r.+ &r&eto the party! They have &r&c60 &r&eseconds to accept.&r/,
			/&eYou have joined &r(.+)'s &r&eparty!&r/,
			/&dDungeon Finder &r&f> &r(.+) &r&ejoined the dungeon group! \(&r&b.+&r&e\)&r/
		]
		this.memberLeft = [
			/(.+) &r&ehas been removed from the party.&r/,
			/(.+) &r&ehas left the party.&r/,
			/(.+) &r&ewas removed from your party because they disconnected&r/
		]
		this.partyDisbanded = [
			/.+ &r&ehas disbanded the party!&r/,
			/&cThe party was disbanded because all invites expired and the party was empty&r/,
			/&eYou left the party.&r/,
			/&6Party Members \(\d+\)&r/,
            /You are not currently in a party\./
		]
		this.leaderMessages = [
			/&eParty Leader: &r(.+) &r&a●&r/,
			/&eYou have joined &r(.+)'s &r&eparty!&r/,
            /&eThe party was transferred to &r(.+) &r&eby &r.+&r/
		]

        register("chat", (event) => {
            let formatted = ChatLib.getChatMessage(event, true)
            this.memberJoined.forEach(regex => {
                let match = formatted.match(regex)
                if (match) {
                    this.addMember(match[1])
                }
            })
            this.memberLeft.forEach(regex => {
                let match = formatted.match(regex)
                if (match) {
                    this.removeMember(match[1])
                }
            })
            this.leaderMessages.forEach(regex => {
                let match = formatted.match(regex)
                if (match) {
                    this.makeLeader(match[1])
                }
            })
            this.partyDisbanded.forEach(regex => {
                if (formatted.match(regex)) {
                    this.disbandParty()
                }
            })

            // Joined a party
            if (/&eYou'll be partying with: .+/.test(formatted)) {
                let players = formatted.match(/&eYou'll be partying with: (.+)/)[1].split("&e, ")
                for (i in players) {
                    this.addMember(players[i])
                }
            }
            // Party List shown in chat
            if (/^&eParty .+: (.+)/.test(formatted)) {
                let match = formatted.match(/^&eParty .+: &r(.+)/)
                let players = match[1].split(new RegExp("&r&a ● &r|&r&c ● &r| &r&a●&r| &r&c●&r"))
                for (i in players) {
                    if (players[i].replace(new RegExp(" ", "g"), "") !== "") { this.addMember(players[i]) }
                }
            }
            // You make a party in party finder
            if (/&dDungeon Finder &r&f> &r&aYou have successfully started a new dungeon queue!&r/.test(formatted)) {
                hidePartyStuff(1000)
                ChatLib.command("pl")
            }

            // Creating a party
            if (Object.keys(this.members).length == 1) {
                let match = formatted.match(/(.+) &r&einvited &r.+ &r&eto the party! They have &r&c60 &r&eseconds to accept.&r/)
                if (match) {
                    this.makeLeader(match[1])
                }
            }

            // Joining a party
            if (/&eYou have joined &r.+'s &r&eparty!&r/.test(formatted)) {
                new Thread(() => {
                    Thread.sleep(50)
                    hidePartyStuff(750)
                    ChatLib.command("pl")
                }).start()
            }

            // Party leader left
            let match = formatted.match(/&eThe party was transferred to &r(.+) &r&ebecause &r(.+) &r&eleft&r/)
            if (match) {
                if (stripRank(ChatLib.removeFormatting(match[2])) == Player.getName()) { this.disbandParty() }
                else {
                    this.makeLeader(match[1])
                    this.removeMember(match[2])
                }
            }
        })
	}

	addMember(player) {
		// Can use member's formatted name with rank
		this.members[stripRank(ChatLib.removeFormatting(player))] = player
	}

	removeMember(player) {
		delete this.members[stripRank(ChatLib.removeFormatting(player))]
	}

	makeLeader(player) {
		this.leader = stripRank(ChatLib.removeFormatting(player))
	}

	disbandParty() {
		this.members = {}
		this.leader = null
		this.excludePlayers = []
	}
}
export default new Party()