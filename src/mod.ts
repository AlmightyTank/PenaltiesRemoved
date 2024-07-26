import { DependencyContainer } from "tsyringe";

import { jsonc } from "jsonc";
import path from "path";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { VFS } from "@spt/utils/VFS";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";

// #region ModConfig 
interface ModConfig {
    Equipment: Equipment;
    Weapons: Weapons;
}

interface Weapons {
    Enabled: boolean;
    RemoveErgoPenalty: boolean;
    RemoveRecoilPenalty: boolean;
    RemoveAccuracyPenalty: boolean;
    RemoveVelocityPenalty: boolean;
    RemoveMuzzleOverheatingPenalty: boolean;
    RemoveDurabilityBurnPenalty: boolean;
}

interface Equipment {
    Enabled: boolean;
    RemoveErgoPenalty: boolean;
    RemoveTurnPenalty: boolean;
    RemoveMovePenalty: boolean;
    RemoveHearingPenalty: boolean;
    AudioDistortionModifier: number;
    AmbientNoiseOffsetAmount: number;
}
// #endregion

class PenaltiesRemoved implements IPostDBLoadMod {
    private modConfig: ModConfig;
    private logger: ILogger;

    public postDBLoad(container: DependencyContainer): void {
        const vfs = container.resolve<VFS>("VFS");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const itemHelper = container.resolve<ItemHelper>("ItemHelper");

        this.logger = container.resolve<ILogger>("WinstonLogger");
        
        this.modConfig = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));

        const items = databaseServer.getTables().templates.items;

        for (const itemId in items) {
            const item = items[itemId];
            if (this.modConfig.Weapons.Enabled && itemHelper.isOfBaseclass(itemId, BaseClasses.MOD)) {
                if (this.modConfig.Weapons.RemoveErgoPenalty && item._props.Ergonomics < 0) {
                    item._props.Ergonomics = 0;
                }
                if (this.modConfig.Weapons.RemoveRecoilPenalty && item._props.Recoil < 0) {
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
            } else if (this.modConfig.Equipment.Enabled) {
                if (itemHelper.isOfBaseclass(itemId, BaseClasses.HEADPHONES)) {
                    if (this.modConfig.Equipment.AudioDistortionModifier != 1.0) {
                        item._props.Distortion *= this.modConfig.Equipment.AudioDistortionModifier;
                    }
                    if (this.modConfig.Equipment.AmbientNoiseOffsetAmount != 0) {
                        item._props.AmbientVolume += this.modConfig.Equipment.AmbientNoiseOffsetAmount;
                    }
                }
                if (itemHelper.isOfBaseclasses(itemId, [BaseClasses.ARMORED_EQUIPMENT, BaseClasses.VEST, BaseClasses.BACKPACK])) {
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
