"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_1 = require("C:/snapshot/project/node_modules/jsonc");
const path_1 = __importDefault(require("path"));
const BaseClasses_1 = require("C:/snapshot/project/obj/models/enums/BaseClasses");
// #endregion
class PenaltiesRemoved {
    modConfig;
    logger;
    postDBLoad(container) {
        const fileSystem = container.resolve("FileSystemSync");
        const databaseServer = container.resolve("DatabaseServer");
        const itemHelper = container.resolve("ItemHelper");
        this.logger = container.resolve("WinstonLogger");
        this.modConfig = jsonc_1.jsonc.parse(fileSystem.read(path_1.default.resolve(__dirname, "../config/config.jsonc")));
        const items = databaseServer.getTables().templates.items;
        for (const itemId in items) {
            const item = items[itemId];
            if (this.modConfig.Weapons.Enabled && itemHelper.isOfBaseclass(itemId, BaseClasses_1.BaseClasses.MOD)) {
                if (this.modConfig.Weapons.RemoveErgoPenalty && item._props.Ergonomics < 0) {
                    item._props.Ergonomics = 0;
                }
                if (this.modConfig.Weapons.RemoveRecoilPenalty && item._props.Recoil > 0) {
                    item._props.Recoil = 0;
                }
                if (this.modConfig.Weapons.RemoveAccuracyPenalty && item._props.Accuracy < 0) {
                    item._props.Accuracy = 0;
                }
                if (this.modConfig.Weapons.RemoveMuzzleOverheatingPenalty && item._props.HeatFactor > 1.0) {
                    item._props.HeatFactor = 1.0;
                }
                if (this.modConfig.Weapons.RemoveDurabilityBurnPenalty && item._props.DurabilityBurnModificator > 1.0) {
                    item._props.DurabilityBurnModificator = 1.0;
                }
            }
            else if (this.modConfig.Ammo.Enabled && itemHelper.isOfBaseclass(itemId, BaseClasses_1.BaseClasses.AMMO)) {
                if (this.modConfig.Ammo.MisfireMultiplier && item._props.MisfireChance != 0) {
                    item._props.MisfireChance *= this.modConfig.Ammo.MisfireMultiplier;
                }
                if (this.modConfig.Ammo.RemoveAmmoAccuracyPenalty && item._props.ammoAccr < 0) {
                    item._props.ammoAccr = 0;
                }
                if (this.modConfig.Ammo.RemoveAmmoRecoilPenalty && item._props.ammoRec > 0) {
                    item._props.ammoRec = 0;
                }
                if (this.modConfig.Ammo.RemoveDurabilityBurnPenalty && item._props.DurabilityBurnModificator > 1.0) {
                    item._props.DurabilityBurnModificator = 1.0;
                }
                if (this.modConfig.Ammo.RemoveMuzzleOverheatingPenalty && item._props.HeatFactor > 1.0) {
                    item._props.HeatFactor = 1.0;
                }
            }
            else if (this.modConfig.Equipment.Enabled) {
                if (itemHelper.isOfBaseclass(itemId, BaseClasses_1.BaseClasses.HEADPHONES)) {
                    if (this.modConfig.Equipment.AudioDistortionModifier != 1.0) {
                        item._props.Distortion *= this.modConfig.Equipment.AudioDistortionModifier;
                    }
                    if (this.modConfig.Equipment.AmbientNoiseOffsetAmount != 0) {
                        item._props.AmbientVolume += this.modConfig.Equipment.AmbientNoiseOffsetAmount;
                    }
                }
                if (itemHelper.isOfBaseclasses(itemId, [BaseClasses_1.BaseClasses.ARMORED_EQUIPMENT, BaseClasses_1.BaseClasses.VEST, BaseClasses_1.BaseClasses.BACKPACK])) {
                    if (this.modConfig.Equipment.RemoveErgoPenalty) {
                        item._props.weaponErgonomicPenalty = 0;
                    }
                    if (this.modConfig.Equipment.RemoveTurnPenalty) {
                        item._props.mousePenalty = 0;
                    }
                    if (this.modConfig.Equipment.RemoveMovePenalty) {
                        item._props.speedPenaltyPercent = 0;
                    }
                    if (this.modConfig.Equipment.RemoveHearingPenalty) {
                        item._props.DeafStrength = "None";
                    }
                }
            }
        }
    }
}
module.exports = { mod: new PenaltiesRemoved() };
//# sourceMappingURL=mod.js.map