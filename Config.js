import { Color, padText } from "../BloomCore/utils/Utils";
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
    @SliderProperty,
    @NumberProperty,
} from '../Vigilance/index';

@Vigilant("Bloom", "Bloom", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Dungeons", "Solvers", "Terminals", "Gui", "Party Finder", "Dungeon Chest Profit"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Config {
    constructor() {
        this.initialize(this)

        const lines = [
            "",
            "&b/bl setkey <api key> &r- Set your API key.",
            "",
            "&b/ds <player> &r- Dungeon Stats.",
            "&b/mem <player> &r- Guild Stats.",
            "&b//skills <player> &r- Show a player's skills.",
            "&b//slayer <player> &r- Show a player's slayer stats.",
            "&b//kuudra <player> &r- Shows kuudra stats for a player.",
            "",
            "&b//rp [...exclude] &r- Reparty (Add names to exclude players).",
            "&b//ping &r- Calculates your ping.",
            "&b/ptr &r- Transfer party to random player.",
            "&b/colors &r- Show all of the formatting codes.",
            "&b/dc <player1> <player2> &r- Show the cata XP difference between two players.",
            "&b//pb <floor_number> &r- Show the S+ PB's of the whole party on a floor.",
            "",
            "&b//ai &r- Runs /p settings allinvite",
            ""
        ]
        const maxLength = Math.max(...lines.map(a => Renderer.getStringWidth(a)))

        this.setCategoryDescription("General", 
            `
            &6&l&nBloom

            ${lines.map(a => a !== "" ? padText(a + "&0", ".", maxLength) : a).join("\n")}

            &6UnclaimedBloom6 is very cool and cool
            `
        )

    }

    stackTrackerGui = new Gui()
    cooldownMoveGui = new Gui()
    toggleSprintMove = new Gui()
    chMapMoveGui = new Gui()
    rngMeterMoveGui = new Gui()
    cellsAlignMoveGui = new Gui()

    // ---------------------------------------------------------------
    // General

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
        description: "Automatically reparty after the dungeon boss has been defeated if you are the party leader.\n&eNOTE: If another mod hides boss messages this will not work.",
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

    // Auto Transfer
    @SwitchProperty({
        name: "Auto Transfer",
        description: "Automatically transfers the party to someone else",
        category: "General",
        subcategory: "Party"
    })
    autoTransfer = false;

    @SwitchProperty({
        name: "Gyro Radius",
        description: "Renders a circle where the gyro will suck in mods.",
        category: "General",
        subcategory: "Gyro"
    })
    gyroCircle = false;

    @SwitchProperty({
        name: "Toggle Sprint",
        description: "Automatically Sprint",
        category: "General",
        subcategory: "Toggle Sprint"
    })
    toggleSprint = false;

    @SwitchProperty({
        name: "Toggle Sprint Overlay",
        description: "Renders text on your screen when toggle sprint is enabled.",
        category: "General",
        subcategory: "Toggle Sprint"
    })
    toggleSprintOverlay = false;

    @ButtonProperty({
        name: "Move Toggle Sprint",
        description: "Move",
        category: "General",
        subcategory: "Toggle Sprint"
    })
    MoveToggleSprint() {
         this.toggleSprintMove.open()
    };

    @TextProperty({
        name: "Sprinting Enabled Text",
        category: "The text to be showed when toggle sprint is enabled",
        category: "General",
        subcategory: "Toggle Sprint",
        placeholder: "Sprinting Enabled"
    })
    toggleSprintText = "";

    @SwitchProperty({
        name: "No Death Animation",
        description: "Removes the death animation when an entity is killed.",
        category: "General",
        subcategory: "Death Animation"
    })
    noDeathAnimation = false;

    @SwitchProperty({
        name: "Hide Gray Numbers",
        description: "Hides the gray damage numbers.",
        category: "General",
        subcategory: "Damage Numbers"
    })
    hideGrayDamageNumbers = false;

    @SwitchProperty({
        name: "Hide Enchants Damage",
        description: "Hides the other damage numbers from enchants like fire aspect, thunderlord, venomous etc.",
        category: "General",
        subcategory: "Damage Numbers"
    })
    hideEnchantDamageNumbers = false;

    @SwitchProperty({
        name: "Hide 0 Health Nametags",
        description: "Hides armor stands which have 0 health. Eg '[Lv100] Noob 0/100k ❤' would get hidden.",
        category: "General",
        subcategory: "0 Health Nametags"
    })
    hide0HealthNametags = false;

    @SwitchProperty({
        name: "Etherwarp Overlay",
        description: `When holding an AOTE or AOTV, will highlight the block you can etherwarp to.`,
        category: "General",
        subcategory: "Etherwarp"
    })
    etherwarpOverlay = false;
    
    @SwitchProperty({
        name: "Only Show When Sneaking",
        description: "Will only show the etherwarp overlay when you are sneaking.",
        category: "General",
        subcategory: "Etherwarp"
    })
    etherwarpOverlayOnlySneak = true;
    
    @SwitchProperty({
        name: "Sync With Server",
        description: `Makes the etherwarp prediction always be accurate, but will look less smooth.`,
        category: "General",
        subcategory: "Etherwarp"
    })
    etherwarpSyncWithServer = false;

    @SwitchProperty({
        name: "Show Fail Location",
        description: `If the etherwarp will fail, shows the block causing the teleport to fail.`,
        category: "General",
        subcategory: "Etherwarp"
    })
    etherwarpShowFailLocation = false;

    @SelectorProperty({
        name: "Highlight Type",
        description: "How to highlight the block for the etherwarp overlay.",
        category: "General",
        subcategory: "Etherwarp",
        options: [
            "Edges",
            "Edges (Phase)",
            "Filled",
            "Filled (Phase)",
            "Both",
            "Both (Phase)"
        ]
    })
    etherwarpHighlightType = 5;

    @ColorProperty({
        name: "Overlay Color",
        description: "The color of the overlay when a valid etherwarp spot is found.",
        category: "General",
        subcategory: "Etherwarp"
    })
    etherwarpOverlayColor = new Color(0, 1, 0, 0.2);

    @ColorProperty({
        name: "Invalid Teleport Color",
        description: "The color of the overlay when the teleport is not possible. (Requires 'Show Fail Location' to be enabled)",
        category: "General",
        subcategory: "Etherwarp"
    })
    etherwarpOverlayFailColor = new Color(1, 0, 0, 0.2);

    @SwitchProperty({
        name: "Hide Crosshair in Third Person",
        description: "Hides your crosshair when in third person view.",
        category: "General",
        subcategory: "Third Person"
    })
    hideThirdPersonCrosshair = false;

    @SwitchProperty({
        name: "Item Price Lore",
        description: "Shows the lowest BIN or bazaar buy and sell prices in every item's lore.",
        category: "General",
        subcategory: "Price Info"
    })
    itemPriceLore = false;

    @SwitchProperty({
        name: "Item Value Lore",
        description: "Shows the item's value in the bottom of the item's lore. This is different from the price info as it takes into account upgrades (Recombs, scrolls, enchants, stars etc).",
        category: "General",
        subcategory: "Price Info"
    })
    itemValueLore = false;

    @SwitchProperty({
        name: "Hide Falling Blocks",
        description: "Prevents falling blocks from being rendered.",
        category: "General",
        subcategory: "Falling Blocks"
    })
    hideFallingBlocks = false;




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
        ChatLib.command("bloommoverunoverview", true)
    };

    @SwitchProperty({
        name: "Run Splits",
        description: "Shows the Run Splits for the current run on screen. Will also keep track of your fastest splits and show how far away you are from them eg (+2.4s).\n&aIf your run splits have been corrupted, do /resetsplits <floor> to reset them.",
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
        ChatLib.command("bloommoverunsplits", true)
    };

    @SwitchProperty({
        name: "Dungeon Warp Cooldown",
        description: "Show how much longer until you can warp into a new Dungeon.",
        category: "Dungeons",
        subcategory: "Cooldown"
    })
    dungeonCooldown = false;

    @ButtonProperty({
        name: "Move",
        description: "Move the warp cooldown text",
        category: "Dungeons",
        subcategory: "Cooldown",
        placeholder: "Move"
    })
    MoveCooldownGui() {
        ChatLib.command("opendungeoncooldowngui", true)
    };

    @SwitchProperty({
        name: "Crystal Timer",
        description: "Says how long it took for you to get the crystal after entering the floor 7 boss.",
        category: "Dungeons",
        subcategory: "Crystal"
    })
    crystalTimer = false;

    @SwitchProperty({
        name: "Spirit Leap Names",
        description: "Show player's usernames underneath their heads in the spirit leap and ghost teleport gui (Like SBE's but shows the full name).",
        category: "Dungeons",
        subcategory: "Spirit Leap"
    })
    spiritLeapNames = false;

    @SwitchProperty({
        name: "Blaze Timer",
        description: "Shows how long it took you to complete blaze puzzle.\nNormal time begins when the first blaze is killed, true time (hover over message) begins when the blazes have spawned.",
        category: "Dungeons",
        subcategory: "Blaze"
    })
    blazeTimer = false;
    
    @SwitchProperty({
        name: "Player Logging",
        description: `
        &aLogs information about your dungeon runs:
         - The Floor
         - Run Time
         - Run Score
         - When the run was completed
         - Who you played with
         - Secrets found by everyone in the party
         - Deaths (During clear and in boss)

        &aThis information can be viewed later using the /plogs command.
        &aThe /plogs command can take in a range of arguments to narrow
        &athe runs which are shown:

        /plogs on it's own will show every run you ever logged along
        with which floors those runs were on, which players you played
        with the most and some information about how each class
        performed.

        However using filters, you can filter only S+ runs, only runs with
        certain people, runs within the past week, months etc.
        For example: &b/plogs &cp:UnclaimedBloom6,Hosted &et:30d &as:>300 &bf:f7 &r
        would show runs logged with &cUnclaimedBloom6 and Hosted &ron &bF7
        the past &e30 days &rwith a &ascore of 300 or more&r.

        &a&nArguments List:
         * &bp:player1,player2, ... &r- Filter based on players in the party,
            separated by a comma and no space.

         * &bt:<time> &r- Filter based on how long ago the run was. Eg &6t:30d
            &rfor &e30 days&r, &6t:1d8h &rfor &e1 day, 8 hours &retc.

         * &bps:<party_size> &r- Filter based on the party size. Eg &6ps:2
            &rfor duo runs, &6ps:>1 &rfor parties with more than 1 player etc.

         * &bs:<score> &r- Filter based off score. Eg &6s:>300 &rwould show
            runs with a score of 300 or more, &6s:<300 &rwould show runs with
            less than 300 score. &6s:317 &rwould show runs with
            exactly 317 score.

         * &bf:<floor> &r- Filter runs based off floor. Eg &6f:f5 &rwould show only
            F5 runs, &6f:f7 &ronly F7 etc.

        &c&nAn API key must also be set.&r &cTo set it, run &b/api new
        &cor &b/bcore setkey <API_KEY>&c.
        `,
        category: "Dungeons",
        subcategory: "Player Logs"
    })
    playerLogging = false;

    @SwitchProperty({
        name: "Disable Mort Messages",
        description: "Disables mort message. Enabling this will not conflict with this or any other CT modules, unlike Skytils or SBA.",
        category: "Dungeons",
        subcategory: "Mort"
    })
    disableMortMessages = false;
    
    @SwitchProperty({
        name: "&dRNG Meter",
        description: "Tracks your current RNG meter progress and displays it on the screen during a Dungeon.",
        category: "Dungeons",
        subcategory: "RNG Meter"
    })
    rngMeter = false;

    @SwitchProperty({
        name: "&dPost-Run Only",
        description: "Only render the RNG Meter after the dungeon run has ended.",
        category: "Dungeons",
        subcategory: "RNG Meter"
    })
    rngMeterPostRun = true;

    @SwitchProperty({
        name: "&dBackground",
        description: "Render a transparent black background behind the gui to make it stand out.",
        category: "Dungeons",
        subcategory: "RNG Meter"
    })
    rngMeterBackground = true;
    
    @SwitchProperty({
        name: "&dWarn when close",
        description: "Warns you when the RNG meter is almost filled.",
        category: "Dungeons",
        subcategory: "RNG Meter"
    })
    rngMeterWarnClose = true;

    @SliderProperty({
        name: "&dRemaining Score Alert",
        description: "How much score remaining until the module alerts you that your rngmeter is close to being filled.",
        category: "Dungeons",
        subcategory: "RNG Meter",
        min: 0,
        max: 2000
    })
    rngMeterRemainingAlert = 1200;

    @ButtonProperty({
        name: "&dMove RNG Meter Gui",
        description: "Move the RNG meter gui.",
        category: "Dungeons",
        subcategory: "RNG Meter"
    })
    MoveRNGMeterGui() {
        this.rngMeterMoveGui.open()
    }

    @SwitchProperty({
        name: "Terminal Splits",
        description: "Prints in chat how long each section of the terminal phase took.",
        category: "Dungeons",
        subcategory: "Terminals"
    })
    terminalSplits = false;

    @SwitchProperty({
        name: "Terminal Tracker",
        description: "Keeps track of how many terminals, devices and levers each player did.",
        category: "Dungeons",
        subcategory: "Terminals"
    })
    terminalTracker = false;

    @SwitchProperty({
        name: "Terminal Timer",
        description: `
        Tells you how long it took you to complete a terminal. Will also track PBs for each terminal.
        &cNOTE: This will depend greatly on ping. It times from when the gui is opened, to when the terminal completed message appears in chat (Term closed).
        `,
        category: "Dungeons",
        subcategory: "Terminals"
    })
    terminalTimer = false;
    
    @SwitchProperty({
        name: "Hide Soulweaver Skulls",
        description: `Hides the skulls which are spawned by the Soulweaver Gloves in Dungeons.\nNote: Will only hide newly spawned skulls. If you turn this on when skulls are already spawned, those will not be removed.`,
        category: "Dungeons",
        subcategory: "Soulweaver Gloves"
    })
    hideSoulweaverSkulls = false;

    @SwitchProperty({
        name: "Show Secret Clicks",
        description: `Tells you when you click on a secret by rendering a box around where the secret is.`,
        category: "Dungeons",
        subcategory: "QoL"
    })
    showSecretClicks = false;

    @ColorProperty({
        name: "Secret Click Color",
        description: "Change the highlight color of the secret when you click it.",
        category: "Dungeons",
        subcategory: "QoL"
    })
    showSecretClicksColor = Color.GREEN;

    @SwitchProperty({
        name: "Hide Blessing Messages",
        description: "Hides the chat messages which are sent when blessings are picked up in Dungeons.",
        category: "Dungeons",
        subcategory: "QoL"
    })
    hideBlessingMessages = false;

    @SwitchProperty({
        name: "Auto Requeue",
        description: "Automatically joins a new dungeon. Will turn itself off for one run if \"!dt\" is sent in party chat. Can manually be toggled for one run with \"//dt\".",
        category: "Dungeons",
        subcategory: "QoL"
    })
    autoRequeue = false;

    @SwitchProperty({
        name: "&aTerminal Solvers",
        description: "The main toggle to enable and disable terminal solvers.",
        category: "Terminals",
        subcategory: "Terminal Solvers"
    })
    terminalSolvers = false;

    @SwitchProperty({
        name: "Numbers Solver",
        description: "Solver for the numbers terminal",
        category: "Terminals",
        subcategory: "Terminal Solvers"
    })
    numbersTerminalSolver = true;

    @SwitchProperty({
        name: "Colors Solver",
        description: "Solver for the colors terminal",
        category: "Terminals",
        subcategory: "Terminal Solvers"
    })
    colorsTerminalSolver = true;

    @SwitchProperty({
        name: "Starts With Solver",
        description: "Solver for the 'What starts with __' terminal",
        category: "Terminals",
        subcategory: "Terminal Solvers"
    })
    startsWithTerminalSolver = true;

    @SwitchProperty({
        name: "Rubix Terminal Solver",
        description: "Solver for the 'Change all to same color' terminal",
        category: "Terminals",
        subcategory: "Terminal Solvers"
    })
    rubixTerminalSolver = true;

    @SwitchProperty({
        name: "Hide Wrong Items",
        description: "Hides the wrong items when in the 'Whats starts with' or colors terminal.",
        category: "Terminals"
    })
    hideWrongTerminalItems = false;

    @SwitchProperty({
        name: "Hide Terminal Tooltips",
        description: "Stops item tooltips from being rendered whilst in a terminal.",
        category: "Terminals"
    })
    hideTerminalTooltips = false;

    @SwitchProperty({
        name: "Don't Pickup Items",
        description: "Prevents you from picking up items in terminals.",
        category: "Terminals"
    })
    terminalPreventItemPickup = false;

    @SwitchProperty({
        name: "Block Wrong Clicks",
        description: "Prevents you from clicking the wrong item in terminals.",
        category: "Terminals"
    })
    terminalBlockWrongClicks = false;

    @SwitchProperty({
        name: "Auto Architect's First Draft",
        description: "Automatically runs /gfs architect's first draft 1 when you fail a puzzle in dungeons.",
        category: "Dungeons",
        subcategory: "QoL",
    })
    autoArchitectDraft = false;

    @SwitchProperty({
        name: "Only Self",
        description: "Only grab an architect's first draft when you fail a puzzle, not someone else.    ",
        category: "Dungeons",
        subcategory: "QoL",
    })
    autoArchitectDraftSelf = true;

    @SwitchProperty({
        name: "Water Board Timer",
        description: "Tracks how long it takes you to do the Water Board puzzle. Will print how long it took to get the chest since entering the puzzle, since the first lever pull and finally from room enter.",
        category: "Dungeons",
        subcategory: "Puzzle Timers",
    })
    waterBoardTimers = false;

    @SwitchProperty({
        name: "Blood Camp Timer",
        description: "Displays when the Watcher mobs should be killed to guarentee a better blood camp",
        category: "Dungeons",
        subcategory: "QoL",
    })
    watcherClear = false;


    // ---------------------------------------------------------------
    // Solvers

    @SwitchProperty({
        name: "Mastery",
        description: "Show the amount of time left before the wool blocks disappear in the Dojo Mastery minigame. Text color changes from red -> yellow -> green depending on the wool color (Green wool = red text).",
        category: "Solvers",
        subcategory: "Dojo"
    })
    dojoMastery = false

    @SwitchProperty({
        name: "Livid Solver",
        description: "Draws a box around the correct Livid in Floor 5.",
        category: "Solvers",
        subcategory: "Livid"
    })
    lividSolver = false

    @SwitchProperty({
        name: "Hide Wrong Livids",
        description: "Stops incorrect livids from rendering in the floor 5 boss fight. Requires livid solver to be enabled.",
        category: "Solvers",
        subcategory: "Livid"
    })
    hideWrongLivids = false

    @SwitchProperty({
        name: "Blaze Solver",
        description: "Blaze Solver!",
        category: "Solvers",
        subcategory: "Blaze Solver"
    })
    blazeSolver = false;

    @SwitchProperty({
        name: "Line to Next Blaze",
        description: "Draws a line to the next blaze to shoot for the blaze solver.",
        category: "Solvers",
        subcategory: "Blaze Solver"
    })
    blazeSolverNextLine = false;

    @SliderProperty({
        name: "Blaze Lines",
        description: "The maximum number of lines to render on the blaze puzzle",
        category: "Solvers",
        subcategory: "Blaze Solver",
        min: 0,
        max: 10
    })
    blazeSolverLines = 2;

    @SwitchProperty({
        name: "Trivia Solver",
        description: "Quiz puzzle",
        category: "Solvers",
        subcategory: "Trivia"
    })
    triviaSolver = false;

    @SwitchProperty({
        name: "Teleport Maze Solver",
        description: "tp maze solver!\n&cRed &rshows the pads you've already been to, &aGreen &rshows the final teleport pad.",
        category: "Solvers",
        subcategory: "Teleport Maze"
    })
    tpMazeSolver = false;

    // Simon Says

    @SwitchProperty({
        name: "Simon Says Solver",
        description: "Simon says for terminals!",
        category: "Solvers",
        subcategory: "Simon Says"
    })
    simonSolver = false;

    @SelectorProperty({
        name: "Simon Says Style",
        description: "How the simon says solver renders the solution.",
        category: "Solvers",
        subcategory: "Simon Says",
        options: [
            "Flat",
            "Box"
        ]
    })
    simonSolverStyle = 1;

    @SwitchProperty({
        name: "Cancel Incorrect Clicks",
        description: "Cancels wrong clicks! wow !!\n&eSneaking will stop blocking clicks.",
        category: "Solvers",
        subcategory: "Simon Says"
    })
    simonCancelClicks = true;

    @SwitchProperty({
        name: "Three Weirdos Solver",
        description: "Highlights the correct chest in the Three Weirdos dungeon room.",
        category: "Solvers",
        subcategory: "Three Weirdos"
    })
    weirdosSolver = false;

    @SwitchProperty({
        name: "Arrow Align Solver",
        description: "Solves the arrow align device in the third terminal section on F7.",
        category: "Solvers",
        subcategory: "Arrow Align"
    })
    arrowAlignSolver = false;

    @SwitchProperty({
        name: "Block Arrow Align Clicks",
        description: "Blocks incorrect clicks on the arrow align device. Can be overridden by sneaking.",
        category: "Solvers",
        subcategory: "Arrow Align"
    })
    arrowAlignSolverBlockClicks = false;
    
    @SwitchProperty({
        name: "Invert Sneak",
        description: "If block wrong clicks is enabled, then instead of blocking clicks when standing, block clicks when sneaking only.",
        category: "Solvers",
        subcategory: "Arrow Align"
    })
    alignSolverInvertSneak = false;

    // ---------------------------------------------------------------
    // Gui

    @SwitchProperty({
        name: "Speed Display",
        description: "Display your current speed on your screen.",
        category: "Gui",
        subcategory: "Speed Display"
    })
    speedDisplay = false;
    
    @ButtonProperty({
        name: "Move",
        description: "Move the speed display",
        category: "Gui",
        subcategory: "Speed Display",
        placeholder: "Move"
    })
    MoveSpeedDisplay() {
        ChatLib.command(`bloomeditspeedoverlay`, true)
    };

    @SwitchProperty({
        name: "Stack Tracker",
        description: "Renders the number of stacks you currently have on armor pieces like Crimson, Terror etc.",
        category: "Gui",
        subcategory: "Stack Tracker"
    })
    stackTracker = false;
    
    @ButtonProperty({
        name: "Move",
        description: "Move Stack Tracker",
        category: "Gui",
        subcategory: "Stack Tracker",
        placeholder: "Move"
    })
    MoveStackTracker() {
        this.stackTrackerGui.open()
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
        ChatLib.command(`bloommovepartyoverlay`, true)
    };
    
    @SwitchProperty({
        name: "Cake Numbers",
        description: "Show which year a new year cake is without having to hover over it.",
        category: "Gui",
        subcategory: "New Year Cakes"
    })
    cakeNumbers = false;

    @SwitchProperty({
        name: "Crystal Hollows Map",
        description: "Shows where all of the main areas of the Crystal Hollows are as well as your own head.",
        category: "Gui",
        subcategory: "Crystal Hollows"
    })
    chMap = false;
    
    @ButtonProperty({
        name: "Move CH Map",
        description: "Move the crystal hollows map and change its size.",
        category: "Gui",
        subcategory: "Crystal Hollows",
        placeholder: "Move"
    })
    MoveCHMap() {
        this.chMapMoveGui.open()
    };


    @SwitchProperty({
        name: "Cells Align Timer",
        description: `
        Displays a timer on your screen showing the remaining time before you can use cells align again.
        If you are a mage, the mage cooldown reduction will be accounted for.
        `,
        category: "Gui",
        subcategory: "Cells Align"
    })
    cellsAlignTimer = false;
    
    @ButtonProperty({
        name: "Move Align",
        description: "Move and scale the cells align display.",
        category: "Gui",
        subcategory: "Cells Align",
        placeholder: "Move"
    })
    MoveCellsAlign() {
        this.cellsAlignMoveGui.open()
    };

    @SwitchProperty({
        name: "Container Value",
        description: `Shows the total value of every item in certain containers (Like backpacks, ender chest, wardrobe and chests), as well as each item's value.`,
        category: "Gui",
        subcategory: "Container Value"
    })
    containerValue = false;

    @SwitchProperty({
        name: "Book Craft Value",
        description: `Instead of showing the price of the book at it's current tier, show the value of the book if it were combined into its max tier. Eg Ultimate Wise 1 would be worth Ultimate Wise 5 / 16. Price is calculated as sell offer.`,
        category: "Gui",
        subcategory: "Container Value"
    })
    containerValueCraftBooks = false;

    @SwitchProperty({
        name: "Item Value Overlay",
        description: "Shows a detailed list of an items's value on the left side of the screen when hovered over.",
        category: "Gui",
        subcategory: "Item Value"
    })
    itemValueOverlay = false;

    @ButtonProperty({
        name: "Edit Location",
        description: "Change the location (and scale) of the item value overlay",
        category: "Gui",
        subcategory: "Item Value"
    })
    ItemValueOverlayEdit() {
        ChatLib.command(`edititemvalueoverlay`, true)
    }

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

    @SwitchProperty({
        name: "Kick Everyone",
        description: "Automatically kicks anyone who joins the party.",
        category: "Party Finder",
        subcategory: "Auto Kicker"
    })
    autoKickEveryone = false;

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

    @SwitchProperty({
        name: "Advanced /ds and //kuudra",
        description: "/ds and //kuudra will show extra player statistics",
        category: "Party Finder",
        subcategory: "Stats"
    })
    advancedDS = false;
    
    // ---------------------------------------------------------------
    // Chest Profit
    
    @SwitchProperty({
        name: "Dungeon Chest Profit",
        description: "Shows the items and profit for each chest in dungeons, sorted in order from most to least profit.\n&aThe major RNG drops will always appear first if they are present.",
        category: "Dungeon Chest Profit",
        subcategory: ""
    })
    dungeonChestProfit = false;
    
    @SwitchProperty({
        name: "Show Background",
        description: "Render a black background behind the text.",
        category: "Dungeon Chest Profit",
        subcategory: "Customizing"
    })
    dungeonChestProfitBackground = true;
    
    @ButtonProperty({
        name: "Edit Location",
        description: "Change the location (and scale) of the dungeon loot.",
        category: "Dungeon Chest Profit",
        subcategory: "Customizing"
    })
    DungeonChestEdit() {
        ChatLib.command(`editdungeonlootlocation`, true)
    }


    
}
export default new Config()