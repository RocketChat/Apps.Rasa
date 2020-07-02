export interface IRasaMessage {
    messages: Array<string | IRasaQuickReplies>;
}

export interface IRasaQuickReplies {
    text: string;
    quickReplies: Array<IRasaQuickReply>;
}

export interface IRasaQuickReply {
    title: string;
    payload: string;
}
