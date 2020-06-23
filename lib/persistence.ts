import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

export class AppPersistence {
    constructor(private readonly persistence: IPersistence, private readonly persistenceRead: IPersistenceRead) {}

    public async saveSessionId(sessionId: string): Promise<void> {
        const sessionIdAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, sessionId);
        const sessionAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'session-Id');

        await this.persistence.updateByAssociations([sessionIdAssociation, sessionAssociation], {
            sessionId,
        }, true);
    }

    public async checkIfSessionExists(sessionId: string): Promise<boolean> {
        const sessionIdAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, sessionId);
        const sessionAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'session-Id');

        const [result] = await this.persistenceRead.readByAssociations([sessionIdAssociation, sessionAssociation]);
        return result && (result as any).sessionId;
    }
}
