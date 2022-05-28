# BloomModule

'bLoOoM hOw dO i gEt tHaT tHiNG yOu jUsT sHoWeD!!1??!?!'
Here you go you fk noob

### For versions without Zero Ping Terminals, run "/ct import Bloom" in-game.

## Installation

### NOTE: ChatTriggers must be installed.

1. Download the github files. Code (Green button) -> Download Zip
2. Extract the folder (Right click -> Extract Here) and navigate through the extracted folder until you see these files. <img src="https://i.imgur.com/VPbb284.png">
3. Open a new file explorer (Or do /ct files in-game) and navigate to your ChatTriggers 'modules' folder (.minecraft/config/ChatTriggers/modules)
4. Copy and paste (or drag) the "Bloom" folder from the folder you downloaded earlier. If you already have an earlier version of the module installed, the old files should be automatically replaced and your old configs will be saved.
5. Run the command "/ct load" in-game.
6. The command to open the config GUI is "/bl"

### Features

#### General / QoL
- Chat Editor
  - Replace parts of some messages - eg "ez" bypass, '/=' -> ≠.
<img src="https://i.imgur.com/gmVN9ry.png" width=50%>

- Hide Lightning

- Block Usemess/Spammy Messages

- FPF Bridge Chat
<img src="https://i.imgur.com/vPqNutW.png" width=50%>

- Auto Transfer
  - Please do not use this.
<img src="https://i.imgur.com/FwRvHgV.png">

- Auto rejoin reparty
  - Only accepts the last disbanded party, will expire after 10 seconds.

- Auto Reparty
  - Automatically reparty after a dungeon has ended.

- Speed Display Overlay
  - Same as SBA's except it goes past 500.
  <img src="https://i.imgur.com/M8d5uPq.png" width=10%>

- Gyro Range
  - Renders a circle showing the area where mobs will be pulled in.
  <img src="https://i.imgur.com/P25BL6W.png" width=60%>

- Mastery Helper
  - Shows how long left until the wool block disappears in the Mastery Dojo minigame
  - Shows which wool will despawn next

- Stacks Display
  - Shows how many stacks you have on your crimson/terror armor.
  <div class="row">
    <img src="https://i.imgur.com/zTUzmBc.png" width=14%>
    <img src="https://i.imgur.com/RIXAxzY.png">
  </div>

- Toggle Sprint
  - Just makes you automatically sprint lol
  - Customizable and togglable sprint text overlay
  <img src="https://i.imgur.com/5IJ8TCc.png" width=30%>

- Cake Numbers
  - Shows new year cake year in your cake bag
  <img src="https://i.imgur.com/6fmIhh6.png" width=40%>

#### Dungeons
- Zero Ping Terminals
  - Allows clicking on terminals with no cooldown, giving the effect of having 0 ping.
  - WARNING: This may become bannable in the future. The probability of being banned for this currently is low, however there is still some risk.
  - A video showcasing this feature can be watched [Here](https://youtu.be/uGcyKpzsc8M)

- Dungeon warp cooldown
  - Show how long to go before your dungeon cooldown is over and you can warp again.

- Crystal Timer
  - Show how long it took you to grab the crystal in Floor 7 Phase 1.
<img src="https://i.imgur.com/v0jbALN.png" width=50%>

- Custom End Info
  - Change how the information at the end of a dungeon is displayed, including showing your secrets found.
<img src="https://i.imgur.com/CKtJP8f.png">

- Run Overview Overlay
  - Wither doors, Blood Open time (Supports 0 second br), Boss Entry.
<img src="https://i.imgur.com/5CFX0cl.png" width=30%>

- Run Splits Overlay
<img src="https://i.imgur.com/fNeofeu.png" width=30%>

- Spirit Leap Names
  - Shows player's full names under their heads in the spirit leap and ghost leap gui
  - Names are slanted to show the entire username - not cut off like SBE for example.

#### GUI
- Party List Overlay
  - Overlay of all party members and shows who's leader.
  <img src="https://i.imgur.com/RRbmjeX.png" width=30%>


#### Party Finder
- Auto Kick
  - Options to Automatically kick players who join via party finder.
  - Set minimum secrets requirement.
  - Kick specific classes.

- Better Party Finder Message
  - Reformats the party finder message to make it take up less room and buttons to kick, ignore and /pv the player.

- Auto /ds
  - Automatically shows the dungeon stats of players who join via party finder

- Auto /ds Party
  - Automatically run the '/ds p' command which shows the stats of the entire party when you join via party finder.


### Main Commands
- /bl - Open the config GUI

- /bl setkey \<api key> - Set your API key (Required for a lot of features).

- /ds \<player>
  - Shows a player's Dungeon stats including cata level, class levels, class average, secrets found, completions and S and S+ PBs.
<img src="https://i.imgur.com/FzoeREA.png">

- /mem \<player>
  - Shows a player's guild member stats including Weekly guild experience and how long they've been in the guild alongside extra information about the guild itself.
<img src="https://i.imgur.com/91XK3P6.png">

- /skills \<player>
  - Shows a player's skills, skill progress and skill average.

- /check \<player>
  - Check if a player is a scammer (In the SBZ database).

- /mykey
  - Shows stats about your API key including total uses, queries the past minute and the owner.
<img src="https://i.imgur.com/uyckpCS.png">

- /nh \<player>
  - Name History command

#### Misc Commands
- /d - Dungeon Hub
- /go - /g online
- /ai - /party settings allinvite
- /f1 - m7 - /joindungeon \<floor>
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
- /ping - Show your current ping (Roughly).
- /dontrp \<player> - Auto reparty won't invite this player back