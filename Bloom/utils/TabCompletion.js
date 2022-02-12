import Party from "./Party";
import { addCustomCompletion } from "CustomTabCompletions"

const addPartyCompletion = (command) => {
    let cmd = command
    addCustomCompletion(cmd, (args) => {
        return Object.keys(Party.members)
            .filter((n) =>
                n.toLowerCase().startsWith(args.length ? args[0].toLowerCase() : "")
            ).sort();
    });
}

const addAllPlayersCompletion = (command) => {
    let cmd = command
    addCustomCompletion(cmd, (args) => {
        return Object.keys(Party.members)
        .concat(World.getAllPlayers().map(player => { return player.getName() }))
            .filter((n) =>
                n.toLowerCase().startsWith(args.length ? args[0].toLowerCase() : "")
            ).sort();
    });
}



export { addPartyCompletion, addAllPlayersCompletion }