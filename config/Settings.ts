import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    RasaBotUsername = 'rasa_bot_username',
    RasaServerUrl = 'rasa_server_url',
    RasaServiceUnavailableMessage = 'rasa_service_unavailable_message',
    RasaHandoverMessage = 'rasa_handover_message',
    RasaCloseChatMessage = 'rasa_close_chat_message',
    RasaEnableCallbacks = 'rasa_enable_callbacks',
}

export enum DefaultMessage {
    DEFAULT_DialogflowServiceUnavailableMessage = 'Sorry, I\'m having trouble answering your question.',
    DEFAULT_DialogflowHandoverMessage = 'Transferring to an online agent',
    DEFAULT_DialogflowCloseChatMessage = 'Closing the chat, Goodbye',
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
    {
        id: AppSetting.RasaCloseChatMessage,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'rasa_close_chat_message',
        i18nDescription: 'rasa_close_chat_message_description',
        required: false,
    },
    {
        id: AppSetting.RasaHandoverMessage,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'rasa_handover_message',
        i18nDescription: 'rasa_handover_message_description',
        required: false,
    },
    {
        id: AppSetting.RasaEnableCallbacks,
        public: true,
        type: SettingType.BOOLEAN,
        packageValue: false,
        value: false,
        i18nLabel: 'rasa_callback_message',
        i18nDescription: 'rasa_callback_message_description',
        required: false,
    },
];
