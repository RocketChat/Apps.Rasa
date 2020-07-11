import { IHttp, IHttpRequest, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { AppSetting } from '../config/Settings';
import { Headers } from '../enum/Http';
import { IRasaMessage, IRasaQuickReplies, IRasaQuickReply } from '../enum/Rasa';
import { createHttpRequest } from './Http';
import { getAppSettingValue } from './Setting';

export const sendMessage = async (read: IRead, http: IHttp, sender: string, message: string): Promise<Array<IRasaMessage> | null> => {
    const rasaServerUrl = await getAppSettingValue(read, AppSetting.RasaServerUrl);
    if (!rasaServerUrl) { throw new Error('Error! Rasa server url setting empty'); }
    const callbackEnabled: boolean = await getAppSettingValue(read, AppSetting.RasaEnableCallbacks);

    const httpRequestContent: IHttpRequest = createHttpRequest(
        { 'Content-Type': Headers.CONTENT_TYPE_JSON },
        { sender, message },
    );

    const rasaWebhookUrl = callbackEnabled ? `${rasaServerUrl}/webhooks/callback/webhook` : `${rasaServerUrl}/webhooks/rest/webhook`;
    const response = await http.post(rasaWebhookUrl, httpRequestContent);
    if (response.statusCode !== 200) { throw Error(`Error occurred while interacting with Rasa Rest API. Details: ${response.content}`); }

    if (!callbackEnabled) {
        const parsedMessage = parseRasaResponse(response.data);
        return parsedMessage;
    }
    return null;
};

export const parseRasaResponse = (response: any): Array<IRasaMessage> => {
    if (!response) { throw new Error('Error Parsing Rasa\'s Response. Data is undefined'); }

    const messages: Array<IRasaMessage> = [];

    response.forEach((message) => {
        messages.push(parseSingleRasaMessage(message));
    });

    return messages;
};

export const parseSingleRasaMessage = (message: any): IRasaMessage => {
    const { recipient_id, text, buttons } = message;
    if (buttons) {
        const quickReplyMessage: IRasaQuickReplies = {
            text,
            quickReplies: buttons,
        };
        return {
            message: quickReplyMessage,
            sessionId: recipient_id,
        };
    } else {
        return {
            message: text,
            sessionId: recipient_id,
        };
    }
};
