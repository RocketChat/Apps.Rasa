import { ILivechatEventContext, ILivechatRoom } from '@rocket.chat/apps-engine/definition/livechat';

import { IHttp, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { getAppSetting } from '../helper';
import { AppSettingId } from '../lib/AppSettings';
import { AppPersistence } from '../lib/persistence';

export class PostLivechatAgentAssignedHandler {
    constructor(private context: ILivechatEventContext,
                private read: IRead,
                private http: IHttp,
                private persis: IPersistence) {}

    public async run() {
        const SettingBotUsername: string = await getAppSetting(this.read, AppSettingId.RasaBotUsername);
        if (SettingBotUsername !== this.context.agent.username) { return; }

        await this.saveVisitorSession();
    }

    /**
     *
     * @description - save visitor.token and session id.
     *   - This will provide a mapping between visitor.token n session id.
     *   - This is required for implementing `perform-handover` webhooks since it requires a Visitor object
     *     which can be obtained from using visitor.token we save here in Persistant storage
     */
    private async saveVisitorSession() {
        const persistence = new AppPersistence(this.persis, this.read.getPersistenceReader());

        const lroom = this.context.room as ILivechatRoom;
        if (!lroom) { throw new Error('Error!! Could not create session. room object is undefined'); }

        // session Id for Dialogflow will be the same as Room Id
        const sessionId = lroom.id;
        await persistence.saveSessionId(sessionId);
    }
}
