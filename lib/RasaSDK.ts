import { IHttp, IHttpRequest, IHttpResponse, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IParsedRasaResponse } from '../definition/IParsedRasaResponse';
import { getAppSetting } from '../helper';
import { AppSettingId } from './AppSettings';

export class RasaSDK {

    constructor(private http: IHttp,
                private read: IRead,
                private persis: IPersistence,
                private sessionId: string,
                private messageText: string) {}

    public async sendMessage(): Promise<IParsedRasaResponse> {
        const rasaServerUrl = await getAppSetting(this.read, AppSettingId.RasaServerUrl);

        const httpRequestContent: IHttpRequest = this.buildRasaHTTPRequest();

        // send request to dialogflow
        const response = await this.http.post(rasaServerUrl, httpRequestContent);
        if (response.statusCode !== 200) { throw Error(`Error occured while interacting with Rasa Rest API. Details: ${response.content}`); }

        const parsedMessage = this.parseRasaResponse(response);
        return parsedMessage;
    }

    private parseRasaResponse(response: IHttpResponse): IParsedRasaResponse {
        if (!response.content) { throw new Error('Error Parsing Dialogflow\'s Response. Content is undefined'); }
        const responseJSON = JSON.parse(response.content);

        const messages: Array<string> = [];

        responseJSON.forEach((element) => {
            messages.push(element.text);
        });

        return {
            messages,
        };
    }

    private buildRasaHTTPRequest(): IHttpRequest {
        return {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                sender: this.sessionId,
                message: this.messageText,
            },
        };
    }
}
