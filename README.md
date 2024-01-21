# BloomModule

If you find a bug, want to share suggestions etc then join my Discord server: https://discord.gg/pykzREcAuZ

## Installation

#### NOTE: ChatTriggers 2.2.0 or higher must be installed.
Run the command "/ct import Bloom" in-game.
Run "/bl" to open the config gui. If this does not work upon first installing, make sure that your ChatTriggers version is set to v2.2.0 or higher, and then run "/ct load" to refresh your modules and try to run "/bl" again.
If the module still fails to load, join my Discord server and send me a message containing the content of your js console ("/ct console js").

# Features

## General / QoL
<details>
	<summary>Chat Editor</summary>
	- Replace parts of some messages - eg "ez" bypass, '/=' -> ≠.
</details>
<details>
	<summary>Hide Lightning</summary>
	- Prevents lightning from being rendered at all. Especially useless with the thunderlord enchantment which can make it difficult to see.
</details>
<details>
	<summary>Block Usemess/Spammy Messages</summary>
	-  Blocks messages which serve no real purpose other than to flood chat. The list of messages in this filter is quite long, but you can view them all in an array in Bloom/features/BlockUselessMessages.js
</details>
<details>
	<summary>Bridge Chat</summary>
	- A formatter for bridge chat. This only works with certain bridge systems, so you might need to change the regex if the feature does not work for you.
</details>
<details>
	<summary>Auto Transfer</summary>
	- Please do not use this. Automatically transfers the party back.
</details>
<details>
	<summary>Auto rejoin reparty</summary>
	- Only accepts the last disbanded party, will expire after 10 seconds.
</details>
<details>
	<summary>Auto Reparty</summary>
	- Automatically reparty after a dungeon has ended. No longer useful as there is no need for repartying, but it is staying here just in case.
</details>
<details>
	<summary>Speed Display Overlay</summary>
	- Takes your current speed from the tab list and displays it on your screen as a scalable, movable HUD element. The speed will go up to 600.
</details>
<details>
	<summary>Gyro Range</summary>
	- Renders a circle showing the area where mobs will be pulled in when holding a Gyrokinetic Wand.
</details>
<details>
	<summary>Stacks Display</summary>
	- Shows how many stacks you have on your crimson/terror armor.
</details>
<details>
	<summary>Toggle Sprint</summary>
	- When holding the forward key, will automatically enable sprinting.
    - Customizable and togglable sprint text overlay
</details>
<details>
	<summary>Cake Numbers</summary>
	- Shows new year cake year in your cake bag
</details>
<details>
	<summary>No Death Animation</summary>
	- Removes the death animation of killed mobs. They now disappear immediately after dying.
</details>
<details>
	<summary>Hide 0 Health Nametags</summary>
	- Hides nametags of mobs with 0 health. Pairs well with No Death Animation to remove all traces of a mob once they are dead.
</details>
<details>
	<summary>Hide Gray Numbers</summary>
	- Hides gray damage numbers when mobs take damage.
</details>
<details>
	<summary>Hide Enchants Damage</summary>
	- Similarly to hide gray numbers, will hide the different colored damage numbers from enchants like fire aspect, venomous etc.
</details>
<details>
	<summary>Etherwarp Overlay</summary>
	- Highly customizable, accurate etherwarp location prediction. Can be synced with the server to guarantee a correct prediction, but won't look as smooth.
</details>
<details>
	<summary>Hide third person crosshair</summary>
	- Hides the crosshair when in third person mode.
</details>
<details>
	<summary>Item Price Lore</summary>
	- Shows the lowest BIN or bazaar instabuy/instasell in the lore of every item.
</details>
<details>
	<summary>Item Value Lore</summary>
	- Shows the estimated value of every item in its lore. Will take into account upgrades like enchants, gemstones, recombs etc.
</details>

## Dungeons

<details>
	<summary>Dungeon warp cooldown</summary>
	- Show how long to go before your dungeon cooldown is over and you can warp again.
</details>
<details>
	<summary>Crystal Timer</summary>
	- Show how long it took you to grab the crystal in Floor 7 Phase 1.
</details>
<details>
	<summary>Custom End Info</summary>
	- Change how the information at the end of a dungeon is displayed, including showing your secrets found.
    Extra information including catacombs and class experience and bits can be found by hovering over the message.
</details>
<details>
	<summary>Run Overview Overlay</summary>
	- Wither doors, Blood Open time (Supports 0 second br), Boss Entry.
</details>
<details>
	<summary>Run Splits Overlay</summary>
	- Keeps track of how long certain parts of the boss took.
</details>
<details>
	<summary>Spirit Leap Names</summary>
	- Shows player's full names under their heads in the spirit leap and ghost leap gui
    - Names are slanted to make room for the entire username.
</details>
<details>
	<summary>Blaze Timer</summary>
	- Keeps track of how long it took you to complete the Blaze puzzle in dungeons. By default this will keep track of the time between the first blaze being killed and the last blaze being killed, but hovering over the message will show you the time from first entering the room to killing the last blaze instead.
</details>
<details>
	<summary>Player Logging</summary>
	- Logs information about your dungeon runs:
         - The Floor
         - Run Time
         - Run Score
         - When the run was completed
         - Who you played with
         - Secrets found by everyone in the party
         - Deaths (During clear and in boss)

        This information can be viewed later using the /plogs command. The /plogs command can take in a range of arguments to narrow the runs which are shown:

        /plogs on it's own will show every run you ever logged along with which floors those runs were on, which players you played with the most and some information about how each class performed.

        However using filters, you can filter only S+ runs, only runs with certain people, runs within the past week, months etc. For example: /plogs p:UnclaimedBloom6,Hosted t:30d s:>300 f:f7 would show runs logged with UnclaimedBloom6 and Hosted on F7 the past 30 days with a score of 300 or more.

        Arguments List:
         * p:player1,player2, ... - Filter based on players in the party, separated by a comma and no space.

         * t:<time> - Filter based on how long ago the run was. Eg t:30d for 30 days, t:1d8h for 1 day, 8 hours etc.

         * ps:<party_size> - Filter based on the party size. Eg ps:2 for duo runs, ps:>1 for parties with more than 1 player etc.

         * s:<score> - Filter based off score. Eg s:>300 would show runs with a score of 300 or more, s:<300 would show runs with less than 300 score. s:317 would show runs with exactly 317 score.

         * f:<floor> - Filter runs based off floor. Eg f:f5 would show only F5 runs, f:f7 only F7 etc.
</details>
<details>
	<summary>RNG Meter Display</summary>
	- A HUD element showing the progress of your RNG meter after each dungeon run. Can be configured to warn you when you are close to reaching 100%.
</details>
<details>
	<summary>Terminal Splits</summary>
	- Shows a summary of how long the terminals took and how long each individual section took.
</details>
<details>
	<summary>Terminal Tracker</summary>
	- Shows how many terminals, devices and levers each person in your team did.
</details>
<details>
	<summary>Terminal Timer</summary>
	- Times how long you spent in each terminal and keeps track of your best times for each one.
</details>
<details>
	<summary>Hide Soulweaver Skulls</summary>
	- Hides the annoying skulls which float around you when using Soulweaver Gloves
</details>
<details>
	<summary>Show Secret Clicks</summary>
	- Draws an outline around every lever, chest and essence you click in Dungeons.
</details>
<details>
	<summary>Dungeon Chest Profit</summary>
	- Shows a breakdown of how much every chest at the end of the dungeon is worth, and how much profit you will make if you open it.
</details>

## Solvers

<details>
	<summary>Livid Solver</summary>
	- Reliable livid solver which uses the wool color in the ceiling of the boss room to find the correct livid. Can be configured to hide the incorrect livids.
</details>
<details>
	<summary>Blaze Solver</summary>
	- Blaze solver in dungeons which hides the vanilla blazes and draws a colored box the size of their hitbox in their place.
</details>
<details>
	<summary>Quiz Solver</summary>
	- Solver for quiz which uses [Skytils](https://github.com/Skytils/SkytilsMod) API for the quiz answers.
</details>
<details>
	<summary>Teleport Maze Solver</summary>
	- Reliable teleport maze solver which draws a green box around the most likely teleport pad and red boxes around the ones which cannot lead to the end.
</details>
<details>
	<summary>Simon Says Solver</summary>
	- Solver for the first device in terminals. Can be configured to prevent misclicks (Can be overridden by sneaking).
</details>
<details>
	<summary>Three Weirdos Solver</summary>
	- Draws a green box around the correct chest in the Three Weirdos puzzle and a red box around the wrong ones.
</details>

## GUI

<details>
	<summary>Party List Overlay</summary>
	- Overlay of all party members and shows who's leader.
</details>
<details>
	<summary>Crystal Hollows Map</summary>
	- Shows where in the crystal hollows you are.
</details>
<details>
	<summary>Cells Align Timer</summary>
	- Keeps track of how long there is to go before you can use Cells Align again (Including mage cooldown)
</details>
<details>
	<summary>Container Value</summary>
	- When inside of a container, will show how much each item is worth as well as a total value estimate of everything inside combined.
</details>

## Party Finder

<details>
	<summary>Auto Kick</summary>
	- Options to Automatically kick players who join via party finder.
    - Set minimum secrets requirement.
    - Kick specific classes.
</details>
<details>
	<summary>Better Party Finder Message</summary>
	- Reformats the party finder message to make it take up less room and buttons to kick, ignore and /pv the player.
</details>
<details>
	<summary>Auto /ds</summary>
	- Automatically shows the dungeon stats of players who join via party finder
</details>
<details>
	<summary>Auto /ds Party</summary>
	- Automatically run the '/ds p' command which shows the stats of the entire party when you join via party finder.
</details>

### Main Commands

<details>
	<summary>/bl - Open the config GUI</summary>
	- /bl setkey \<api key> - Set your API key (Required for a lot of features).
</details>
<details>
	<summary>/ds [player]</summary>
	- Shows a player's Dungeon stats including cata level, class levels, class average, secrets found, completions and S and S+ PBs.
</details>
<details>
	<summary>/mem [player]</summary>
	- Shows a player's guild member stats including Weekly guild experience and how long they've been in the guild alongside extra information about the guild itself.
</details>
<details>
	<summary>//skills [player]</summary>
	- Shows a player's skills, skill progress and skill average.
</details>
<details>
	<summary>//kuudra [player]</summary>
	- Shows the kuudra stats for a player including their individual kuudra tier completions and their total kuudra collection.
</details>
<details>
	<summary>//slayer [player]</summary>
	- Shows information about a player's slayer stats including their xp, level and individual boss kills for each tier.
</details>

#### Misc Commands
- /d - Dungeon Hub
- /go - /g online
- //ai - /party settings allinvite
- /f1, /f2, /f3, ... - Joins the given Dungeon floor
- /va \<auctionid> - /viewauction
- /pko - /p kickoffline
- /pd - /p disband
- /pk \<player> - /p kick
- /pt \<player> - /p transfer
- /colors - Show all formatting codes and colors
- /lsb - Warp to lobby then back to Skyblock
- /ld - Warp to lobby, back to Skyblock then to Dungeon Hub
- /ptr - Transfer the party to a random player
- /dontrp \<player> - Don't reparty this player if Auto Reparty is enabled.
- //ping - Show your current ping (Roughly).
- /dontrp \<player> - Auto reparty won't invite this player back
- /heldvalue - Shows a breakdown of the value of the item you are currently holding including Gemstones, enchantments, recombs etc.
