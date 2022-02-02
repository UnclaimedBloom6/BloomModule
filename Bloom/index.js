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

import AutoDSParty from "./features/AutoDSParty"
import AutoKicker from "./features/AutoKicker"
import AutoReparty from "./features/AutoReparty"
import AutoTransfer from "./features/AutoTransfer"
import BetterPartyFinderJoin from "./features/BetterPartyFinderJoin"
import BlockUselessMessages from "./features/BlockUselessMessages"
import BridgeChat from "./features/BridgeChat"
import ChatEditor from "./features/ChatEditor"
import CrystalTimer from "./features/CrystalTimer"
import CustomEndInfo from "./features/CustomEndInfo"
import DungeonCooldownTimer from "./features/DungeonCooldownTimer"
import HideLightning from "./features/HideLightning"
import MiscCommands from "./commands/MiscCommands"
import PartyOverlay from "./features/PartyOverlay"
import RejoinReparty from "./features/RejoinReparty"
import RunOverview from "./features/RunOverview"
import RunSplits from "./features/RunSplits"
import SpeedDisplay from "./features/SpeedDisplay"
import ThreeWeirdosSolver from "./features/ThreeWeirdosSolver"
import { data, prefix } from "./utils/Utils"

import request from "../requestV2"

