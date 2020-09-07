import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { ILivechatRoom } from '@rocket.chat/apps-engine/definition/livechat';
import { IUIKitResponse, UIKitLivechatBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { UIKitIncomingInteractionContainerType } from '@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionContainer';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { AppSetting } from '../config/Settings';
import { createLivechatMessage, deleteAllActionBlocks } from '../lib/Message';
import { getAppSettingValue } from '../lib/Setting';

export class ExecuteLivechatBlockActionHandler {
    constructor(private readonly app: IApp,
                private context: UIKitLivechatBlockInteractionContext,
                private read: IRead,
                private http: IHttp,
                private persistence: IPersistence,
                private modify: IModify) {}

    public async run(): Promise<IUIKitResponse> {
        try {
            const interactionData = this.context.getInteractionData();

            const { visitor, room, container: { id, type }, value } = interactionData;

            if (type !== UIKitIncomingInteractionContainerType.MESSAGE) {
                return this.context.getInteractionResponder().successResponse();
            }

            const RasaBotUsername: string = await getAppSettingValue(this.read, AppSetting.RasaBotUsername);
            const { servedBy: { username = null } = {}, id: rid } = room as ILivechatRoom;

            if (!username || RasaBotUsername !== username) {
                return this.context.getInteractionResponder().successResponse();
            }

            const appUser = await this.read.getUserReader().getAppUser(this.app.getID()) as IUser;

            await createLivechatMessage(rid, this.read, this.modify, { text: value }, visitor);

            const { value: hideQuickRepliesSetting } = await this.read.getEnvironmentReader().getSettings().getById(AppSetting.RasaHideQuickReplies);
            if (hideQuickRepliesSetting) {
                await deleteAllActionBlocks(this.modify, appUser, id);
            }

            return this.context.getInteractionResponder().successResponse();
        } catch (error) {
            this.app.getLogger().error(error);
            return this.context.getInteractionResponder().errorResponse();
        }
    }
}
