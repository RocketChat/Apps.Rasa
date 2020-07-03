import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IDepartment, ILivechatRoom, ILivechatTransferData, IVisitor } from '@rocket.chat/apps-engine/definition/livechat';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { AppSetting } from '../config/Settings';
import { createMessage } from './Message';
import { getAppSettingValue } from './Setting';

export const updateRoomCustomFields = async (rid: string, data: any, read: IRead,  modify: IModify): Promise<any> => {
    if (!rid) {
        return;
    }
    const room = await read.getRoomReader().getById(rid);
    if (!room) { throw new Error(`Invalid room id ${rid}`); }

    const botUserName = await getAppSettingValue(read, AppSetting.RasaBotUsername);
    if (!botUserName) { throw new Error('The Bot Username setting is not defined.'); }

    const user = await read.getUserReader().getByUsername(botUserName);
    if (!user) { throw new Error('The Bot User does not exist.'); }

    let { customFields = {} } = room;
    customFields = Object.assign(customFields, data);
    const roomBuilder = await modify.getUpdater().room(rid, user);
    roomBuilder.setCustomFields(customFields);

    try {
        modify.getUpdater().finish(roomBuilder);
    } catch (error) {
        console.error(error);
    }
};

export const closeChat = async (modify: IModify, read: IRead, rid: string) => {
    const room: IRoom = (await read.getRoomReader().getById(rid)) as IRoom;
    if (!room) { throw new Error('Error: Room Id not valid'); }

    const closeChatMessage = await getAppSettingValue(read, AppSetting.RasaCloseChatMessage);

    const result = await modify.getUpdater().getLivechatUpdater().closeRoom(room, closeChatMessage ? closeChatMessage : '');
    if (!result) { throw new Error('Error: Internal Server Error. Could not close the chat'); }
};

export const performHandover = async (modify: IModify, read: IRead, rid: string, visitorToken: string, targetDepartmentName?: string) => {

    const handoverMessage: string = await getAppSettingValue(read, AppSetting.RasaHandoverMessage);
    await createMessage(rid, read, modify, { text: handoverMessage ? handoverMessage : '' });

    const room: ILivechatRoom = (await read.getRoomReader().getById(rid)) as ILivechatRoom;
    if (!room) { throw new Error('Error: Room Id not valid'); }

    const visitor: IVisitor = (await read.getLivechatReader().getLivechatVisitorByToken(visitorToken)) as IVisitor;
    if (!visitor) { throw new Error('Error: Visitor Id not valid'); }

    const livechatTransferData: ILivechatTransferData = {
        currentRoom: room,
    };

    // Fill livechatTransferData.targetDepartment param if required
    if (targetDepartmentName) {
        const targetDepartment: IDepartment = (await read.getLivechatReader().getLivechatDepartmentByIdOrName(targetDepartmentName)) as IDepartment;
        if (!targetDepartment) { throw new Error('Error: Department Name is not valid'); }
        livechatTransferData.targetDepartment = targetDepartment.id;
    }

    const result = await modify.getUpdater().getLivechatUpdater().transferVisitor(visitor, livechatTransferData)
        .catch((error) => {
            throw new Error('Error occured while processing handover. Details' + error);
        });
    if (!result) {
        const offlineMessage: string = await getAppSettingValue(read, AppSetting.RasaServiceUnavailableMessage);

        await createMessage(rid, read, modify, { text: offlineMessage ? offlineMessage : '' });
    }
};
