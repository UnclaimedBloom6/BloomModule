/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import Config from "./Config"

import Dungeon from "./utils/Dungeon"
import Party from "./utils/Party"

import { skillsCommand } from "./commands/SkillsCommand"
import { dontRp } from "./commands/DontRP"
import { myKey } from "./commands/MyKey"
import { dsCommand } from "./commands/DsCommand"
import { memberCommand } from "./commands/MemberCommand"
import { scammerCommand } from "./commands/ScammerCheckCommand"
import { repartyCommand } from "./commands/RepartyCommand"
import { pingCommand } from "./commands/PingCommand"
import { bloomCommand } from "./commands/BloomCommand"

import "./features/AutoDSParty"
import "./features/AutoKicker"
import "./features/AutoReparty"
import "./features/AutoTransfer"
import "./features/BetterPartyFinderJoin"
import "./features/BlockUselessMessages"
import "./features/BridgeChat"
import "./features/ChatEditor"
import "./features/CrystalTimer"
import "./features/CustomEndInfo"
import "./features/DungeonCooldownTimer"
import "./features/HideLightning"
import "./commands/MiscCommands"
import "./features/PartyOverlay"
import "./features/RejoinReparty"
import "./features/RunOverview"
import "./features/RunSplits"
import "./features/SpeedDisplay"
import "./features/TerminalSolver"
import "./features/ZeroPingTerms"
import "./utils/UpdateChecker"
import "./utils/FirstInstall"



// import "./features/PhaseSplits"