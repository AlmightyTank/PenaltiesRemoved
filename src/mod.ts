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

class PenaltiesRemoved implements IPostDBLoadMod {
    private modConfig;
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
            if (this.modConfig.ModifyWeaponAttachments && itemHelper.isOfBaseclass(itemId, weaponModId)) {
                if (item._props.Ergonomics < 0) {
                    item._props.Ergonomics = 0;
                }
            } else if (this.modConfig.ModifyEquipment && itemHelper.isOfBaseclasses(itemId, [armoredEquipmentId, vestId, backpackId])) {
                item._props.speedPenaltyPercent = 0;
                item._props.mousePenalty = 0;
                item._props.weaponErgonomicPenalty = 0;
            }
        }
    }
}

module.exports = { mod: new PenaltiesRemoved() };
