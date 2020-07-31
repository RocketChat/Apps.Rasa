import { IHttp, IHttpRequest, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { AppSetting } from '../config/Settings';
import { Headers } from '../enum/Http';
import { Logs } from '../enum/Logs';
import { IRasaMessage, IRasaQuickReplies, IRasaQuickReply } from '../enum/Rasa';
import { createHttpRequest } from './Http';
import { getAppSettingValue } from './Setting';

export const sendMessage = async (read: IRead, http: IHttp, sender: string, message: string): Promise<Array<IRasaMessage> | null> => {
    const rasaServerUrl = await getAppSettingValue(read, AppSetting.RasaServerUrl);
    if (!rasaServerUrl) { throw new Error(Logs.INVALID_RASA_SERVER_URL_SETTING); }
    const callbackEnabled: boolean = await getAppSettingValue(read, AppSetting.RasaEnableCallbacks);

    const httpRequestContent: IHttpRequest = createHttpRequest(
        { 'Content-Type': Headers.CONTENT_TYPE_JSON },
        { sender, message },
    );

    const rasaWebhookUrl = callbackEnabled ? `${rasaServerUrl}/webhooks/callback/webhook` : `${rasaServerUrl}/webhooks/rest/webhook`;
    const response = await http.post(rasaWebhookUrl, httpRequestContent);
    if (response.statusCode !== 200) { throw Error(`${ Logs.RASA_REST_API_COMMUNICATION_ERROR } ${ response.content }`); }

    if (!callbackEnabled) {
        const parsedMessage = parseRasaResponse(response.data);
        return parsedMessage;
    }
    return null;
};

export const parseRasaResponse = (response: any): Array<IRasaMessage> => {
    if (!response) { throw new Error(Logs.INVALID_RESPONSE_FROM_RASA_CONTENT_UNDEFINED); }

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
