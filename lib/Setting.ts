import { IRead } from '@rocket.chat/apps-engine/definition/accessors';

export const getAppSettingValue = async (read: IRead, id: string) => {
    return id && await read.getEnvironmentReader().getSettings().getValueById(id);
};
