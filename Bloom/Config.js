import {
    @ButtonProperty,
    @CheckboxProperty,
    Color,
    @ColorProperty,
    @PercentSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @Vigilant,
    @SliderProperty
} from '../Vigilance/index';

@Vigilant("Bloom", "Bloom", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Dungeons", "Gui", "Party Finder"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Config {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", 
            "&6&l&nBloom\n\n" +
            "&7/bl setkey <api key> &8- Set your API key.\n" +
            "\n" +
            "&7/ds <player> &8- Dungeon Stats.\n" +
            "&7/mem <player> &8- Guild Stats.\n" +
            "&7/check <player> &8- Check if scammer.\n" +
            "&7/skills <player> &8- Show a player's skills.\n" +
            "&7/mykey &8- Show stats about your API key.\n" +
            "\n" +
            "&7//rp [...exclude] &8- Reparty (Add names to not reparty those players).\n" +
            "&7/ping &8- Show your ping.\n" +
            "&7/ptr &8- Transfer party to random player.\n" +
            "&7/lsb &8- Warp to lobby then back to Skyblock.\n" +
            "&7/ld &8- Warp to lobby, Skyblock then Dungeon Hub.\n" +
            "&7/colors &8-Show all of the formatting codes.\n" +
            "\n\n" +
            "&6UnclaimedBloom6 is very cool and cool"
        )
    }

    speedMoveGui = new Gui()
    partyOverlayMoveGui = new Gui()
    runSplitsMoveGui = new Gui()
    cooldownMoveGui = new Gui()
    runOverviewMoveGui = new Gui()

    // ---------------------------------------------------------------
    // General

    @SwitchProperty({
        name: "Update Checker",
        description: "Checks for updates when logging on.",
        category: "General",
        subcategory: "Updates"
    })
    updateChecker = true

    @SwitchProperty({
        name: "Hide Lightning",
        description: "Stops lightning from being rendered.",
        category: "General",
        subcategory: "Lightning"
    })
    hideLightning = false

    @SwitchProperty({
        name: "Rejoin Reparty",
        description: "Automatically accept the party invitation after the leader has recently disbanded the party (Last 10 seconds, only accepts the same person who disbanded).",
        category: "General",
        subcategory: "Reparty"
    })
    autoRejoinReparty = false;

    @SliderProperty({
        name: "Delay",
        description: "Delay before accepting the party invite.",
        category: "General",
        subcategory: "Reparty",
        min: 0,
        max: 1000
    })
    autoRejoinRepartyDelay = 500;

    // Chat Replacer
    @SwitchProperty({
        name: "Chat Editor",
        description: "Replace some words in chat like 'ez' bypass, '=/' into not equals etc",
        category: "General",
        subcategory: "Chat Replacer"
    })
    chatEditor = false;

    // Reparty
    @SwitchProperty({
        name: "Auto Reparty",
        description: "Automatically reparty after the dungeon boss has been defeated if you are the party leader.",
        category: "General",
        subcategory: "Reparty"
    })
    autoReparty = false;

    // Useless Messages
    @SwitchProperty({
        name: "Block Useless Messages",
        description: "Blocks useless or spammy messages from being received in chat.",
        category: "General",
        subcategory: "Messages"
    })
    blockUselessMessages = false;

    // Bridge Chat
    @SwitchProperty({
        name: "FC Bridge Chat",
        description: "Makes FC bridge chat look nicer. Automatically gets bridge bot's username.\n\n&2Guild > &6Noob674 &2[Discord]&f: You're mom xd xdlmao",
        category: "General",
        subcategory: "Messages"
    })
    bridgeChat = false;

    // Auto Transfer
    @SwitchProperty({
        name: "Auto Transfer",
        description: "Automatically transfers the party to someone else",
        category: "General",
        subcategory: "Party"
    })
    autoTransfer = false;

    // ------------------------------------------
    // Dungeons

    // Run Overview
    @SwitchProperty({
        name: "Custom End Info",
        description: "Shows nicer looking stats in chat after the run has ended including secrets.",
        category: "Dungeons",
        subcategory: "Dungeon End Stats"
    })
    customEndInfo = false;

    @SwitchProperty({
        name: "Run Overview",
        description: "Shows the run overview for the current run on the screen.",
        category: "Dungeons",
        subcategory: "Run Overview"
    })
    runOverview = false;

    @ButtonProperty({
        name: "Move",
        description: "Move the run overview overlay",
        category: "Dungeons",
        subcategory: "Run Overview",
        placeholder: "Move"
    })
    MoveOverviewGui() {
        this.runOverviewMoveGui.open()
    };

    @SwitchProperty({
        name: "Run Splits",
        description: "Shows the Run Splits for the current run on the screen.",
        category: "Dungeons",
        subcategory: "Run Splits"
    })
    runSplits = false;

    @ButtonProperty({
        name: "Move",
        description: "Move the run splits overlay",
        category: "Dungeons",
        subcategory: "Run Splits",
        placeholder: "Move"
    })
    MoveRunSplitsGui() {
        this.runSplitsMoveGui.open()
    };

    @SwitchProperty({
        name: "Dungeon Warp Cooldown",
        description: "Show how much longer until you can warp into a new Dungeon.",
        category: "Dungeons",
        subcategory: "Cooldown"
    })
    dungeonCooldown = false

    @ButtonProperty({
        name: "Move",
        description: "Move the warp cooldown text",
        category: "Dungeons",
        subcategory: "Cooldown",
        placeholder: "Move"
    })
    MoveSplitsGui() {
        this.cooldownMoveGui.open()
    };

    @SwitchProperty({
        name: "Crystal Timer",
        description: "Says how long it took for you to get the crystal after entering the floor 7 boss.",
        category: "Dungeons",
        subcategory: "Crystal"
    })
    crystalTimer = false;

    // ---------------------------------------------------------------
    // Solvers

    @SwitchProperty({
        name: "Zero Ping Terminals",
        description: "Removes the delay caused by ping when clicking on terminals, making it feel like you have zero ping.\n\n" +
        "&8- Originally created by Alon1396 in the AlonAddons module\n\n" +
        "&cWARNING: Currently, the chances of getting banned for this is virtually 0, however if Hypixel's anticheat updates to try and prevent exploiting terminals then this could cause false bans. Use at own risk.",
        category: "Solvers",
        subcategory: "Terminals"
    })
    zeroPingTerminals = true

    @SwitchProperty({
        name: "Terminal Solvers",
        description: "Enable terminal solvers",
        category: "Solvers",
        subcategory: "Terminals"
    })
    terminalSolvers = false

    @SwitchProperty({
        name: "Maze Helper",
        description: "Shows the next maze pane that should be clicked when using Zero Ping Terminals.",
        category: "Solvers",
        subcategory: "Terminals"
    })
    mazeHelper = true

    // ---------------------------------------------------------------
    // Gui

    @SwitchProperty({
        name: "Speed Display",
        description: "Display your current speed on your screen. Goes above 500 unlike SBA's.",
        category: "Gui",
        subcategory: "Speed Display"
    })
    speedDisplay = false;
    
    @ButtonProperty({
        name: "Move",
        description: "Move the speed display",
        category: "Gui",
        subcategory: "Speed Display"
    })
    MoveSpeedDisplay() {
        this.speedMoveGui.open()
    };

    @SwitchProperty({
        name: "Party List Overlay",
        description: "Show the party list on-screen",
        category: "Gui",
        subcategory: "Party"
    })
    partyOverlay = false;

    @ButtonProperty({
        name: "Move",
        description: "Move the party overlay",
        category: "Gui",
        subcategory: "Party",
        placeholder: "Move"
    })
    MovePartyOverlay() {
        this.partyOverlayMoveGui.open()
    };

    // ---------------------------------------------------------------
    // Auto Kicker

    @SwitchProperty({
        name: "Better Party Finder Message",
        description: "Changes the party finder player joined messages to take up only one line and adds buttons to kick, ignore and /pv the player.",
        category: "Party Finder",
        subcategory: "Buttons"
    })
    betterPFMessage = false;

    @SwitchProperty({
        name: "Auto Kick",
        description: "Automatically kicks players who join if they don't meet certain requirements",
        category: "Party Finder",
        subcategory: "Auto Kicker"
    })
    autoKicker = false;

    @TextProperty({
        name: "Minimum Secrets",
        description: "Minimum amount of secrets for a player not to be kicked from the party",
        category: "Party Finder",
        subcategory: "Auto Kicker",
        placeholder: "Secrets"
    })
    akSecretMin = "3000";

    @SwitchProperty({
        name: "Recent Kick",
        description: "Automatically kick players who have been kicked recently",
        category: "Party Finder",
        subcategory: "Auto Kicker"
    })
    akRecentKick = false;

    @SwitchProperty({
        name: "Kick Classes",
        description: "Automatically kick players who join with specified classes.",
        category: "Party Finder",
        subcategory: "Auto Kicker"
    })
    akKickClasses = false;

    @TextProperty({
        name: "Classes To Kick",
        description: "Automatically kick players who join with these classes ('Class, Class, Class...')",
        category: "Party Finder",
        subcategory: "Auto Kicker"
    })
    akClasses = "Tank, Healer"

    @SwitchProperty({
        name: "Auto /ds",
        description: "Automatically runs /ds on every player who joins via party finder.",
        category: "Party Finder",
        subcategory: "Stats"
    })
    autoDS = false;

    @SwitchProperty({
        name: "Auto /ds Party",
        description: "Automatically runs /ds on every player currently in the party when you join it.",
        category: "Party Finder",
        subcategory: "Stats"
    })
    autoDSParty = false;
}
export default new Config()