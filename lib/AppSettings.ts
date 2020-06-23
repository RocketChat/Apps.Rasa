import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSettingId {
    RasaBotUsername = 'rasa_bot_username',
    RasaServerUrl = 'rasa_server_url',
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
    {
        id: AppSettingId.RasaServerUrl,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'Rasa Server Url',
        i18nDescription: 'Here enter the RASA url where the RASA server is hosted. Make sure to add `/webhooks/rest/webhook` to the end of url. Eg: https://efee760b.ngrok.io/webhooks/rest/webhook',
        required: true,
    },
];
