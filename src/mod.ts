import { DependencyContainer } from "tsyringe";

import { jsonc } from "jsonc";
import path from "path";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { VFS } from "@spt/utils/VFS";
import { ItemHelper } from "@spt/helpers/ItemHelper";

const weaponModId = "5448fe124bdc2da5018b4567";
const armoredEquipmentId = "57bef4c42459772e8d35a53b";
const vestId = "5448e5284bdc2dcb718b4567";
const backpackId = "5448e53e4bdc2d60728b4567";

interface Config {
    Equipment: Equipment;
    Weapons: Weapons;
}

interface Weapons {
    Enabled: boolean;
    RemoveErgoPenalty: boolean;
    RemoveRecoilPenalty: boolean;
    RemoveAccuracyPenalty: boolean;
    RemoveVelocityPenalty: boolean;
    NormalizeMuzzleOverheating: boolean;
    NormalizeDurabilityBurn: boolean;
}

interface Equipment {
    Enabled: boolean;
    RemoveErgoPenalty: boolean;
    RemoveTurnPenalty: boolean;
    RemoveMovePenalty: boolean;
    RemoveHearingPenalty: boolean;
}

class PenaltiesRemoved implements IPostDBLoadMod {
    private modConfig: Config;
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
            if (this.modConfig.Weapons.Enabled && itemHelper.isOfBaseclass(itemId, weaponModId)) {
                if (this.modConfig.Weapons.RemoveErgoPenalty && item._props.Ergonomics < 0) {
                    item._props.Ergonomics = 0;
                }
                if (this.modConfig.Weapons.RemoveRecoilPenalty && item._props.Recoil < 0) {
                    item._props.Recoil = 0;
                }
                if (this.modConfig.Weapons.RemoveAccuracyPenalty && item._props.Accuracy < 0) {
                    item._props.Accuracy = 0;
                }
                if (this.modConfig.Weapons.NormalizeMuzzleOverheating && item._props.HeatFactor != 1.0) {
                    item._props.HeatFactor = 1.0;
                }
                if (this.modConfig.Weapons.NormalizeDurabilityBurn && item._props.DurabilityBurnModificator != 1.0) {
                    item._props.DurabilityBurnModificator = 1.0;
                }
            } else if (this.modConfig.Equipment.Enabled && itemHelper.isOfBaseclasses(itemId, [armoredEquipmentId, vestId, backpackId])) {
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

module.exports = { mod: new PenaltiesRemoved() };
