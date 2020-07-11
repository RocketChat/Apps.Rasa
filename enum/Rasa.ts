export interface IRasaMessage {
    message: string | IRasaQuickReplies;
    sessionId: string;
}

export interface IRasaQuickReplies {
    text: string;
    quickReplies: Array<IRasaQuickReply>;
}

export interface IRasaQuickReply {
    title: string;
    payload: string;
}
