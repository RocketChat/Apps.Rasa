import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IParsedRasaResponse } from '../definition/IParsedRasaResponse';
import { getAppSetting, getBotUser, getSessionId } from '../helper';
import { AppSettingId } from '../lib/AppSettings';
import { RasaSDK } from '../lib/RasaSDK';

export class PostMessageSentHandler {
    constructor(private app: IApp,
                private message: IMessage,
                private read: IRead,
                private http: IHttp,
                private persis: IPersistence,
                private modify: IModify) {}

    public async run() {
        const SettingBotUsername: string = await getAppSetting(this.read, AppSettingId.RasaBotUsername);
        if (this.message.sender.username === SettingBotUsername) {
            // this msg was sent by the Bot itself, so no need to respond back
            return;
        } else if (this.message.room.type !== RoomType.LIVE_CHAT) {
            // check whether this is a Livechat message
            return;
        } else if (SettingBotUsername !== getBotUser(this.message).username) {
            // check whether the bot is currently handling the Visitor, if not then return back
            return;
        }

        // send request to Rasa
        if (!this.message.text || (this.message.text && this.message.text.trim().length === 0)) { return; }
        const messageText: string = this.message.text;

        const sessionId = getSessionId(this.message);
        const rasaSDK: RasaSDK = new RasaSDK(this.http, this.read, this.persis, sessionId, messageText);

        const response: IParsedRasaResponse = await rasaSDK.sendMessage();
        for (const message of response.messages) {
            await this.sendMessageToVisitor(message);
        }

    }

    private async sendMessageToVisitor(message: string) {
        const sender: IUser = getBotUser(this.message);

        // build the message for Livechat widget
        const builder = this.modify.getNotifier().getMessageBuilder();
        builder.setRoom(this.message.room).setText(message).setSender(sender);
        await this.modify.getCreator().finish(builder);
    }
}
