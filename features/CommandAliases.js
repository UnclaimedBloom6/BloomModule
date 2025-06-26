import PogObject from "../../PogData";

// {"/alias": { command: "/some long command", clientSide: true}}
const aliasObj = new PogObject("Bloom", {}, "data/commandAliases.json")

// You can't unregister command triggers so we have to use this instead.
const commandChecker = register("messageSent", (message, event) => {
    if (!message.startsWith("/")) {
        return
    }

    const parts = message.split(" ")

    if (parts.length < 1) {
        return
    }

    // Remove the starting "/"
    const command = parts[0].slice(1)

    if (!(command in aliasObj)) {
        return
    }

    cancel(event)

    const longVersion = aliasObj[command].command
    const isCommand = longVersion.startsWith("/")
    const extra = ` ${parts.slice(1).join(" ")}`.trim()

    if (isCommand) {
        ChatLib.command(`${longVersion.slice(1)}${extra}`, aliasObj[command].clientSide)
    }
    else {
        ChatLib.say(`${longVersion}${extra}`)
    }
}).unregister()

const addAlias = (alias, command) => {
    if (alias == command) {
        ChatLib.chat(`Circular command! "${alias}" -> "${command}".`)
        return false
    }

    commandChecker.register()

    return true
}

Object.entries(aliasObj).forEach(([alias, command]) => {
    addAlias(alias, command)
})

register("command", (subcommand, ...args) => {
    switch (subcommand) {
        case "add":
            if (!args || args.length < 2) {
                ChatLib.chat(`/alias add <alias> <...command>`)
                ChatLib.chat(`Note: Start command with a "/" if you want it to be an actual command. Otherwise it will just say the message in chat.`)
                ChatLib.chat(`Eg "gmc" -> "gamemode creative" will say "gamemode creative" in chat when /gmc is ran. To make it run a command, have it mapped to "/gamemode creative" instead.`)
                return
            }

            let [alias, ...commandParts] = args
            let command = commandParts.join(" ")

            if (alias in aliasObj) {
                ChatLib.chat(`&cAlias already exists! ("${alias}" -> "${aliasObj[alias].command}")`)
                return
            }

            if (!addAlias(alias, command)) {
                return
            }

            aliasObj[alias] = {
                command,
                clientSide: true
            }

            aliasObj.save()

            ChatLib.chat(`&aAdded alias "${alias}" -> "${command}"`)

            return
        
        case "remove":
            if (args.length < 1) {
                ChatLib.chat(`/alias remove <alias>`)
                return
            }
            
            if (!(args[0] in aliasObj)) {
                ChatLib.chat(`&cThat subcommand does not exist!`)
                ChatLib.chat(`&cRun /alias list to view all of your command aliases.`)
                return
            }

            ChatLib.chat(`&aDeleted "${args[0]}" -> "${aliasObj[args[0]].command}"`)

            delete aliasObj[args[0]]
            aliasObj.save()

            if (Object.keys(aliasObj).length == 0) {
                commandChecker.unregister()
            }

            return
        
        case "list":
            ChatLib.chat(`&aCommand Aliases (${Object.keys(aliasObj).length}):`)
            Object.entries(aliasObj).forEach(([alias, { command, clientSide }]) => {
                const suffix = clientSide ? "&a(CLIENT)" : "&c(SERVER)"

                ChatLib.chat(`&b${alias} &a-> &b${command} ${suffix}`)
            })

            return
        
        case "client":
            if (args.length < 1) {
                ChatLib.chat(`/alias client <alias> - Toggles an alias between being client-side or server-side.`)
                return
            }

            if (!(args[0] in aliasObj)) {
                ChatLib.chat(`Alias does not exist!`)
                return
            }

            aliasObj[args[0]].clientSide = !aliasObj[args[0]].clientSide
            aliasObj.save()

            ChatLib.chat(`Client side for ${args[0]} is now ${aliasObj[args[0]].clientSide}`)
            return
        
        default:
            ChatLib.chat(`/alias <add|remove|list|client>`)
            return

    }
}).setTabCompletions(args => {
    const subcommands = ["add", "remove", "list", "client"]

    if (args.length == 1) {
        return subcommands.filter(a => a.startsWith(args[0].toLowerCase()))
    }

    
    if (args[0] == "remove" || args[0] == "client") {
        const existingAliases = Object.keys(aliasObj)

        return existingAliases.filter(a => a.startsWith(args[1].toLowerCase()))
    }

    return []
}).setName("alias")