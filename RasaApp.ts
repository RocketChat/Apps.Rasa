import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { ILivechatMessage } from '@rocket.chat/apps-engine/definition/livechat';
import { IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IUIKitResponse, UIKitLivechatBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { settings } from './config/Settings';
import { CallbackInputEndpoint } from './endpoints/CallbackInputEndpoint';
import { IncomingEndpoint } from './endpoints/IncomingEndpoint';
import { ExecuteLivechatBlockActionHandler } from './handler/ExecuteLivechatBlockActionHandler';
import { PostMessageSentHandler } from './handler/PostMessageSentHandler';

export class RasaApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executeLivechatBlockActionHandler(context: UIKitLivechatBlockInteractionContext,
                                                   read: IRead,
                                                   http: IHttp,
                                                   persistence: IPersistence,
                                                   modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteLivechatBlockActionHandler(this, context, read, http, persistence, modify);
        return await handler.run();
    }

    public async executePostMessageSent(message: ILivechatMessage,
                                        read: IRead,
                                        http: IHttp,
                                        persis: IPersistence,
                                        modify: IModify): Promise<void> {
        const handler = new PostMessageSentHandler(this, message, read, http, persis, modify);
        await handler.run();
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new IncomingEndpoint(this),
                new CallbackInputEndpoint(this),
            ],
        });
        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
    }
}
