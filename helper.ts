import { IRead } from '@rocket.chat/apps-engine/definition/accessors';

import { IMessage } from '@rocket.chat/apps-engine/definition/messages';

import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { ILivechatMessage, ILivechatRoom } from '@rocket.chat/apps-engine/definition/livechat';

export const getAppSetting = async (read: IRead, id: string): Promise<any> => {
    return (await read.getEnvironmentReader().getSettings().getById(id)).value;
};

export const getBotUser = (message: IMessage): IUser => {
    const lroom: ILivechatRoom = getLivechatRoom(message);
    if (!lroom.servedBy) { throw Error('Error!! Room.servedBy field is undefined'); }
    return lroom.servedBy;
};

export const getLivechatRoom = (message: IMessage): ILivechatRoom => {
    return ((message as ILivechatMessage).room as ILivechatRoom);
};

/**
 * @description: Returns a session Id. Session Id is used to maintain sessions of Dialogflow.
 *      Note that the Session Id is the same as Room Id
 */
export const getSessionId = (message: IMessage): string => {
    return getLivechatRoom(message).id;
};
