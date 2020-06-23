import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSettingId {
    RasaBotUsername = 'rasa_bot_username',
}

export const AppSettings: Array<ISetting> = [
    {
        id: AppSettingId.RasaBotUsername,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'Bot Username',
        required: true,
    },
];
