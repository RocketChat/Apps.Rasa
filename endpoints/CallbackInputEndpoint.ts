import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { Headers } from '../enum/Http';
import { IRasaMessage } from '../enum/Rasa';
import { createHttpResponse } from '../lib/Http';
import { createRasaMessage } from '../lib/Message';
import { parseSingleRasaMessage } from '../lib/Rasa';

export class CallbackInputEndpoint extends ApiEndpoint {
    public path = 'callback';

    public async post(request: IApiRequest,
                      endpoint: IApiEndpointInfo,
                      read: IRead,
                      modify: IModify,
                      http: IHttp,
                      persis: IPersistence): Promise<IApiResponse> {
        this.app.getLogger().info('Endpoint received an request');

        try {
            await this.processRequest(read, modify, persis, request.content);
            return createHttpResponse(HttpStatusCode.OK, { 'Content-Type': Headers.CONTENT_TYPE_JSON }, { result: 'Success' });
        } catch (error) {
            this.app.getLogger().error('Error occurred while processing the request. Details:- ', error);
            return createHttpResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, { 'Content-Type': Headers.CONTENT_TYPE_JSON }, { error: error.message });
        }
    }

    private async processRequest(read: IRead, modify: IModify, persis: IPersistence, endpointContent: any) {
        const message: IRasaMessage  = parseSingleRasaMessage(endpointContent);

        await createRasaMessage(message.sessionId, read, modify, message);
    }
}
