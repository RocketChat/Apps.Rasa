import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    RasaBotUsername = 'rasa_bot_username',
    RasaServerUrl = 'rasa_server_url',
    RasaServiceUnavailableMessage = 'rasa_service_unavailable_message',
    RasaHandoverMessage = 'rasa_handover_message',
    RasaCloseChatMessage = 'rasa_close_chat_message',
    RasaEnableCallbacks = 'rasa_enable_callbacks',
    RasaDefaultHandoverDepartment = 'rasa_target_handover_department',
    RasaHideQuickReplies = 'rasa_hide_quick_replies',
}

export enum DefaultMessage {
    DEFAULT_RasaServiceUnavailableMessage = 'Sorry, I\'m having trouble answering your question.',
    DEFAULT_RasaHandoverMessage = 'Transferring to an online agent',
    DEFAULT_RasaCloseChatMessage = 'Closing the chat, Goodbye',
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
        id: AppSetting.RasaDefaultHandoverDepartment,
        public: true,
        type: SettingType.STRING,
        packageValue: '',
        i18nLabel: 'rasa_default_handover_department',
        i18nDescription: 'rasa_default_handover_department_description',
        required: true,
    },
    {
        id: AppSetting.RasaEnableCallbacks,
        public: true,
        type: SettingType.BOOLEAN,
        packageValue: false,
        value: false,
        i18nLabel: 'rasa_callback_message',
        i18nDescription: 'rasa_callback_message_description',
        required: true,
    },
    {
        id: AppSetting.RasaHideQuickReplies,
        public: true,
        type: SettingType.BOOLEAN,
        packageValue: true,
        value: true,
        i18nLabel: 'rasa_hide_quick_replies',
        i18nDescription: 'rasa_hide_quick_replies_description',
        required: true,
    },
];
