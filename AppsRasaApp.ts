import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { ILivechatEventContext, IPostLivechatAgentAssigned } from '@rocket.chat/apps-engine/definition/livechat';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { PostLivechatAgentAssignedHandler } from './handler/PostLivechatAgentAssignedHandler';
import { PostMessageSentHandler } from './handler/PostMessageSentHandler';
import { AppSettings } from './lib/AppSettings';

export class AppsRasaApp extends App implements IPostMessageSent, IPostLivechatAgentAssigned {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async initialize(configurationExtend: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await AppSettings.forEach((setting) => configurationExtend.settings.provideSetting(setting));
        this.getLogger().log('Apps.Dialogflow App Initialized');
    }

    public async executePostMessageSent(message: IMessage,
                                        read: IRead,
                                        http: IHttp,
                                        persis: IPersistence,
                                        modify: IModify): Promise<void> {
        const handler = new PostMessageSentHandler(this, message, read, http, persis, modify);
        try {
            await handler.run();
        } catch (error) {
            this.getLogger().error(error.message);
        }
    }

    public async executePostLivechatAgentAssigned(context: ILivechatEventContext, read: IRead, http: IHttp, persistence: IPersistence): Promise<void> {
        const postLivechatAgentAssignedHandler = new PostLivechatAgentAssignedHandler(context, read, http, persistence);
        await postLivechatAgentAssignedHandler.run();
    }

}
