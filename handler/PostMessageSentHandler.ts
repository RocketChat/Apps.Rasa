import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { ILivechatMessage, ILivechatRoom } from '@rocket.chat/apps-engine/definition/livechat';
import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { AppSetting, DefaultMessage } from '../config/Settings';
import { Logs } from '../enum/Logs';
import { IRasaMessage } from '../enum/Rasa';
import { createMessage, createRasaMessage } from '../lib/Message';
import { sendMessage } from '../lib/Rasa';
import { getAppSettingValue } from '../lib/Setting';

export class PostMessageSentHandler {
    constructor(private app: IApp,
                private message: ILivechatMessage,
                private read: IRead,
                private http: IHttp,
                private persis: IPersistence,
                private modify: IModify) {}

    public async run() {

        const { text, editedAt, room, token, sender } = this.message;
        const livechatRoom = room as ILivechatRoom;

        const { id: rid, type, servedBy, isOpen } = livechatRoom;

        const RasaBotUsername: string = await getAppSettingValue(this.read, AppSetting.RasaBotUsername);

        if (!type || type !== RoomType.LIVE_CHAT) {
            return;
        }

        if (!isOpen || !token || editedAt || !text) {
            return;
        }

        if (!servedBy || servedBy.username !== RasaBotUsername) {
            return;
        }

        if (sender.username === RasaBotUsername) {
            return;
        }

        if (!text || (text && text.trim().length === 0)) {
            return;
        }

        let response: Array<IRasaMessage> | null;
        try {
            response = await sendMessage(this.read, this.http, rid, text);
        } catch (error) {
            this.app.getLogger().error(`${ Logs.RASA_REST_API_COMMUNICATION_ERROR } ${error.message}`);

            const serviceUnavailable: string = await getAppSettingValue(this.read, AppSetting.RasaServiceUnavailableMessage);
            await createMessage(rid, this.read, this.modify, {
                text: serviceUnavailable ? serviceUnavailable : DefaultMessage.DEFAULT_DialogflowServiceUnavailableMessage,
            });

            return;
        }

        if (response) {
            for (const message of response) {
                await createRasaMessage(rid, this.read, this.modify, message);
            }
        }
    }
}
