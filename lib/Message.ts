import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageAction, IMessageAttachment, MessageActionType, MessageProcessingType } from '@rocket.chat/apps-engine/definition/messages';
import { BlockElementType, IButtonElement, TextObjectType, IActionsBlock, BlockType } from '@rocket.chat/apps-engine/definition/uikit';
import { AppSetting } from '../config/Settings';
import { Logs } from '../enum/Logs';
import { IRasaMessage, IRasaQuickReplies, IRasaQuickReply } from '../enum/Rasa';
import { getAppSettingValue } from './Setting';

export const createRasaMessage = async (rid: string, read: IRead,  modify: IModify, rasaMessage: IRasaMessage): Promise<any> => {
    const { text, quickReplies } = rasaMessage.message as IRasaQuickReplies;

    if (text && quickReplies) {
        // rasaMessage is instanceof IRasaQuickReplies
        const elements: Array<IButtonElement> = quickReplies.map((payload: IRasaQuickReply) => ({
            type: BlockElementType.BUTTON,
            text: {
                type: TextObjectType.PLAINTEXT,
                text: payload.title,
            },
            actionId: payload.title,
        } as IButtonElement));

        const actionsBlock: IActionsBlock = { type: BlockType.ACTIONS, elements };

        await createMessage(rid, read, modify, { text, actionsBlock });
    } else {
        // rasaMessage is instanceof string
        await createMessage(rid, read, modify, { text: rasaMessage.message });
    }
};

export const createMessage = async (rid: string, read: IRead,  modify: IModify, message: any ): Promise<any> => {
    if (!message) {
        return;
    }

    const botUserName = await getAppSettingValue(read, AppSetting.RasaBotUsername);
    if (!botUserName) {
        this.app.getLogger().error(Logs.EMPTY_BOT_USERNAME_SETTING);
        return;
    }

    const sender = await read.getUserReader().getByUsername(botUserName);
    if (!sender) {
        this.app.getLogger().error(Logs.INVALID_BOT_USERNAME_SETTING);
        return;
    }

    const room = await read.getRoomReader().getById(rid);
    if (!room) {
        this.app.getLogger().error(Logs.INVALID_ROOM_ID);
        return;
    }

    const msg = modify.getCreator().startMessage().setRoom(room).setSender(sender);
    const { text, actionsBlock } = message;

    if (text) {
        msg.setText(text);
    }

    if (actionsBlock) {
        const { elements } = actionsBlock as IActionsBlock;
        msg.addBlocks(modify.getCreator().getBlockBuilder().addActionsBlock({ elements }));
    }

    return new Promise(async (resolve) => {
        modify.getCreator().finish(msg)
        .then((result) => resolve(result))
        .catch((error) => console.error(error));
    });
};
