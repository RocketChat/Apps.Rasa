import { IHttp, IHttpRequest, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { AppSetting } from '../config/Settings';
import { Headers } from '../enum/Http';
import { IRasaMessage, IRasaQuickReplies, IRasaQuickReply } from '../enum/Rasa';
import { createHttpRequest } from './Http';
import { getAppSettingValue } from './Setting';

export const sendMessage = async (read: IRead, http: IHttp, sender: string, message: string): Promise<IRasaMessage> => {
    const rasaServerUrl = await getAppSettingValue(read, AppSetting.RasaServerUrl);
    if (!rasaServerUrl) { throw new Error('Error! Rasa server url setting empty'); }

    const httpRequestContent: IHttpRequest = createHttpRequest(
        { 'Content-Type': Headers.CONTENT_TYPE_JSON },
        { sender, message },
    );

    const rasaWebhookUrl = `${rasaServerUrl}/webhooks/rest/webhook`;
    const response = await http.post(rasaWebhookUrl, httpRequestContent);
    if (response.statusCode !== 200) { throw Error(`Error occured while interacting with Rasa Rest API. Details: ${response.content}`); }

    const parsedMessage = parseRasaResponse(response.data);
    return parsedMessage;
};

export const parseRasaResponse = (response: any): IRasaMessage => {
    if (!response) { throw new Error('Error Parsing Rasa\'s Response. Data is undefined'); }

    const messages: Array<string | IRasaQuickReplies> = [];

    response.forEach((message) => {
        const { text, buttons } = message;
        if (buttons) {
            const quickReply: IRasaQuickReplies = {
                text,
                quickReplies: buttons,
            };
            messages.push(quickReply);
        } else {
            messages.push(text);
        }
    });

    return {
        messages,
    };
};
