import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { ILivechatRoom } from '@rocket.chat/apps-engine/definition/livechat';
import { EndpointActionNames, IActionsEndpointContent } from '../enum/Endpoints';
import { Headers, Response } from '../enum/Http';
import { Logs } from '../enum/Logs';
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
        this.app.getLogger().info(Logs.ENDPOINT_RECEIVED_REQUEST);

        try {
            await this.processRequest(read, modify, persis, request.content);
            return createHttpResponse(HttpStatusCode.OK, { 'Content-Type': Headers.CONTENT_TYPE_JSON }, { result: Response.SUCCESS });
        } catch (error) {
            this.app.getLogger().error(`${ Logs.ENDPOINT_REQUEST_PROCESSING_ERROR } ${ error }`);
            return createHttpResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, { 'Content-Type': Headers.CONTENT_TYPE_JSON }, { error: error.message });
        }
    }

    private async processRequest(read: IRead, modify: IModify, persis: IPersistence, endpointContent: IActionsEndpointContent) {

        const { action, sessionId } = endpointContent;
        if (!sessionId) {
            throw new Error(Logs.INVALID_SESSION_ID);
        }
        switch (action) {
            case EndpointActionNames.CLOSE_CHAT:
                await closeChat(modify, read, sessionId);
                break;
            case EndpointActionNames.HANDOVER:
                const { actionData: { targetDepartment = null } = {} } = endpointContent;
                const room = await read.getRoomReader().getById(sessionId) as ILivechatRoom;
                if (!room) { throw new Error(Logs.INVALID_SESSION_ID); }
                const { visitor: { token: visitorToken }, department: { name = null } = {} } = room;
                if (targetDepartment && name && targetDepartment === name) {
                    throw new Error(Logs.INVALID_ACTION_USER_ALREADY_IN_DEPARTMENT);
                }
                await performHandover(modify, read, sessionId, visitorToken, targetDepartment);
                break;
            default:
                throw new Error(Logs.INVALID_ENDPOINT_ACTION);
        }
    }
}
