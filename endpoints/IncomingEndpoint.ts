import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { ILivechatRoom } from '@rocket.chat/apps-engine/definition/livechat';
import { EndpointActionNames, IActionsEndpointContent } from '../enum/Endpoints';
import { Headers } from '../enum/Http';
import { createHttpResponse } from '../lib/Http';
import { closeChat, performHandover } from '../lib/Room';

export class IncomingEndpoint extends ApiEndpoint {
    public path = 'incoming';

    public async post(request: IApiRequest,
                      endpoint: IApiEndpointInfo,
                      read: IRead,
                      modify: IModify,
                      http: IHttp,
                      persis: IPersistence): Promise<IApiResponse> {
        this.app.getLogger().info('Endpoint recieved an request');

        try {
            await this.processRequest(read, modify, persis, request.content);
            return createHttpResponse(HttpStatusCode.OK, { 'Content-Type': Headers.CONTENT_TYPE_JSON }, { result: 'Success' });
        } catch (error) {
            this.app.getLogger().error('Error occurred while processing the request. Details:- ', error);
            return createHttpResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, { 'Content-Type': Headers.CONTENT_TYPE_JSON }, { error: error.message });
        }
    }

    private async processRequest(read: IRead, modify: IModify, persis: IPersistence, endpointContent: IActionsEndpointContent) {

        const { action, sessionId } = endpointContent;
        if (!sessionId) {
            throw new Error('Error!! Session Id not present in payload');
        }
        switch (action) {
            case EndpointActionNames.CLOSE_CHAT:
                await closeChat(modify, read, sessionId);
                break;
            case EndpointActionNames.HANDOVER:
                const { actionData: { targetDepartment = '' } = {} } = endpointContent;
                const room = await read.getRoomReader().getById(sessionId) as ILivechatRoom;
                if (!room) { throw new Error('Error! Session Id not valid'); }
                const { visitor: { token: visitorToken } } = room;
                await performHandover(modify, read, sessionId, visitorToken, targetDepartment);
                break;
            default:
                throw new Error('Error!! Invalid Action type');
        }
    }
}
