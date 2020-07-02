import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    RasaBotUsername = 'rasa_bot_username',
    RasaServerUrl = 'rasa_server_url',
    RasaServiceUnavailableMessage = 'rasa_service_unavailable_message',
 }

export const settings: Array<ISetting> = [
    {
        id: AppSetting.RasaBotUsername,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'bot_username',
        required: true,
    },
    {
        id: AppSetting.RasaServerUrl,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'rasa_server_url',
        required: true,
    },
    {
        id: AppSetting.RasaServiceUnavailableMessage,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'rasa_service_unavailable_message',
        i18nDescription: 'rasa_service_unavailable_message_description',
        required: false,
    },
];
