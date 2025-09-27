"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloSendMessage = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const zca_js_1 = require("zca-js");
const helper_1 = require("../utils/helper");
let api;
function parseHtmlToStyles(html) {
    var _a, _b;
    let workingHtml = html
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ');
    workingHtml = workingHtml.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2');
    workingHtml = workingHtml.replace(/<br\s*\/?>/gi, '___BR___');
    workingHtml = workingHtml.replace(/>\s+</g, '><');
    workingHtml = workingHtml.replace(/___BR___/g, '<br>');
    const styles = [];
    const tagMappings = {
        'b': 'b',
        'strong': 'b',
        'i': 'i',
        'em': 'i',
        'u': 'u',
        's': 's',
        'strike': 's',
        'del': 's',
        'small': 'f_13',
        'big': 'f_18',
        'red': 'c_db342e',
        'orange': 'c_f27806',
        'yellow': 'c_f7b503',
        'green': 'c_15a85f',
    };
    const openTags = [];
    let cleanText = '';
    let htmlIndex = 0;
    let textIndex = 0;
    while (htmlIndex < workingHtml.length) {
        const char = workingHtml[htmlIndex];
        if (char === '<') {
            const tagEndIndex = workingHtml.indexOf('>', htmlIndex);
            if (tagEndIndex === -1) {
                cleanText += char;
                textIndex++;
                htmlIndex++;
                continue;
            }
            const tagContent = workingHtml.substring(htmlIndex + 1, tagEndIndex);
            const isClosingTag = tagContent.startsWith('/');
            const tagName = (isClosingTag ? tagContent.substring(1) : tagContent.split(/\s/)[0]).toLowerCase();
            if (tagName === 'br') {
                cleanText += '\n';
                textIndex++;
            }
            else if (tagName === 'p') {
                if (isClosingTag) {
                    cleanText += '\n\n';
                    textIndex += 2;
                }
            }
            else if (tagName === 'div') {
                if (isClosingTag) {
                    cleanText += '\n';
                    textIndex++;
                }
            }
            else if (tagName.match(/^h[1-6]$/)) {
                if (isClosingTag) {
                    cleanText += '\n';
                    textIndex++;
                }
            }
            else if (tagName === 'li') {
                if (!isClosingTag) {
                    cleanText += '• ';
                    textIndex += 2;
                }
                else {
                    cleanText += '\n';
                    textIndex++;
                }
            }
            else if (tagName === 'ul' || tagName === 'ol') {
                if (!isClosingTag) {
                    cleanText += '\n';
                    textIndex++;
                }
                else {
                    cleanText += '\n';
                    textIndex++;
                }
            }
            else {
                const styleType = tagMappings[tagName];
                if (styleType) {
                    if (isClosingTag) {
                        for (let i = openTags.length - 1; i >= 0; i--) {
                            if (openTags[i].tagName === tagName) {
                                const openTag = openTags[i];
                                if (textIndex > openTag.startPos) {
                                    styles.push({
                                        st: openTag.styleType,
                                        start: openTag.startPos,
                                        end: textIndex
                                    });
                                }
                                openTags.splice(i, 1);
                                break;
                            }
                        }
                    }
                    else {
                        openTags.push({
                            tagName: tagName,
                            styleType: styleType,
                            startPos: textIndex
                        });
                    }
                }
            }
            htmlIndex = tagEndIndex + 1;
        }
        else {
            cleanText += char;
            textIndex++;
            htmlIndex++;
        }
    }
    for (const openTag of openTags) {
        if (textIndex > openTag.startPos) {
            styles.push({
                st: openTag.styleType,
                start: openTag.startPos,
                end: textIndex
            });
        }
    }
    cleanText = cleanText
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/[ \t]+/g, ' ');
    const trimStart = ((_b = (_a = cleanText.match(/^\s*/)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) || 0;
    cleanText = cleanText.replace(/^\s+|\s+$/g, '');
    if (trimStart > 0) {
        for (const style of styles) {
            style.start = Math.max(0, style.start - trimStart);
            style.end = Math.max(style.start, style.end - trimStart);
        }
    }
    return { cleanText, styles };
}
class ZaloSendMessage {
    constructor() {
        this.description = {
            displayName: 'Zalo Send Message',
            name: 'zaloSendMessage',
            icon: 'file:../shared/zalo.svg',
            group: ['Zalo'],
            version: 4,
            description: 'Gửi tin nhắn qua API Zalo sử dụng kết nối đăng nhập bằng cookie',
            defaults: {
                name: 'Zalo Send Message',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'zaloApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Thread ID',
                    name: 'threadId',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'ID của thread để gửi tin nhắn',
                },
                {
                    displayName: 'Type',
                    name: 'type',
                    type: 'options',
                    options: [
                        {
                            name: 'User',
                            value: 0,
                        },
                        {
                            name: 'Group',
                            value: 1,
                        },
                    ],
                    default: 0,
                    description: 'Loại của tin nhắn (user hoặc group)',
                },
                {
                    displayName: 'Message',
                    name: 'message',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'Nội dung tin nhắn cần gửi',
                },
                {
                    displayName: 'Message Format',
                    name: 'messageFormat',
                    type: 'options',
                    options: [
                        {
                            name: 'Plain Text',
                            value: 'plain',
                        },
                        {
                            name: 'HTML (Auto Convert)',
                            value: 'html',
                        },
                    ],
                    default: 'plain',
                    description: 'Định dạng tin nhắn: Plain text hoặc HTML tự động chuyển đổi',
                },
                {
                    displayName: 'Urgency',
                    name: 'urgency',
                    type: 'options',
                    options: [
                        {
                            name: 'Default',
                            value: 0,
                        },
                        {
                            name: 'Important',
                            value: 1,
                        },
                        {
                            name: 'Urgent',
                            value: 2,
                        },
                    ],
                    default: 0,
                    description: 'Mức độ khẩn cấp của tin nhắn',
                },
                {
                    displayName: 'Quote Message',
                    name: 'quote',
                    type: 'collection',
                    placeholder: 'Add Quote',
                    default: {},
                    options: [
                        {
                            displayName: 'Message ID',
                            name: 'msgId',
                            type: 'string',
                            default: '',
                            description: 'ID của tin nhắn cần trích dẫn',
                        },
                        {
                            displayName: 'Sender ID',
                            name: 'senderId',
                            type: 'string',
                            default: '',
                            description: 'ID của người gửi tin nhắn trích dẫn',
                        },
                        {
                            displayName: 'Content',
                            name: 'content',
                            type: 'string',
                            default: '',
                            description: 'Nội dung tin nhắn trích dẫn',
                        },
                    ],
                },
                {
                    displayName: 'Mentions',
                    name: 'mentions',
                    type: 'collection',
                    placeholder: 'Add Mention',
                    default: {},
                    options: [
                        {
                            displayName: 'User ID',
                            name: 'uid',
                            type: 'string',
                            default: '',
                            description: 'ID của người dùng được mention',
                        },
                        {
                            displayName: 'Position',
                            name: 'pos',
                            type: 'number',
                            default: 0,
                            description: 'Vị trí mention trong tin nhắn',
                        },
                        {
                            displayName: 'Length',
                            name: 'len',
                            type: 'number',
                            default: 0,
                            description: 'Độ dài của mention',
                        },
                    ],
                },
                {
                    displayName: 'Text Styles',
                    name: 'styles',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    placeholder: 'Add Text Style',
                    default: {},
                    options: [
                        {
                            name: 'style',
                            displayName: 'Style',
                            values: [
                                {
                                    displayName: 'Style Type',
                                    name: 'st',
                                    type: 'options',
                                    options: [
                                        {
                                            name: 'Big Font',
                                            value: 'f_18',
                                        },
                                        {
                                            name: 'Bold',
                                            value: 'b',
                                        },
                                        {
                                            name: 'Green Color',
                                            value: 'c_15a85f',
                                        },
                                        {
                                            name: 'Indent',
                                            value: 'ind_$',
                                        },
                                        {
                                            name: 'Italic',
                                            value: 'i',
                                        },
                                        {
                                            name: 'Orange Color',
                                            value: 'c_f27806',
                                        },
                                        {
                                            name: 'Ordered List',
                                            value: 'lst_2',
                                        },
                                        {
                                            name: 'Red Color',
                                            value: 'c_db342e',
                                        },
                                        {
                                            name: 'Small Font',
                                            value: 'f_13',
                                        },
                                        {
                                            name: 'Strike Through',
                                            value: 's',
                                        },
                                        {
                                            name: 'Underline',
                                            value: 'u',
                                        },
                                        {
                                            name: 'Unordered List',
                                            value: 'lst_1',
                                        },
                                        {
                                            name: 'Yellow Color',
                                            value: 'c_f7b503',
                                        },
                                    ],
                                    default: 'b',
                                    description: 'Loại style áp dụng cho text',
                                },
                                {
                                    displayName: 'Start Position',
                                    name: 'start',
                                    type: 'number',
                                    default: 0,
                                    description: 'Vị trí bắt đầu áp dụng style (tính từ 0)',
                                },
                                {
                                    displayName: 'End Position',
                                    name: 'end',
                                    type: 'number',
                                    default: 0,
                                    description: 'Vị trí kết thúc áp dụng style',
                                },
                                {
                                    displayName: 'Indent Size',
                                    name: 'indentSize',
                                    type: 'number',
                                    default: 1,
                                    displayOptions: {
                                        show: {
                                            'st': ['ind_$'],
                                        },
                                    },
                                    description: 'Kích thước indent (chỉ dùng cho Indent style)',
                                },
                            ],
                        },
                    ],
                    description: 'Định dạng text với các style khác nhau',
                },
                {
                    displayName: 'TTL (Time To Live)',
                    name: 'ttl',
                    type: 'number',
                    default: 0,
                    description: 'Thời gian tồn tại của tin nhắn (giây). 0 = vĩnh viễn.',
                },
                {
                    displayName: 'Multiple URLs (Comma Separated)',
                    name: 'multipleUrls',
                    type: 'string',
                    default: '',
                    placeholder: 'https://example1.com/image1.jpg, https://example2.com/document.pdf, https://example3.com/video.mp4',
                    description: 'Nhập nhiều URL cách nhau bằng dấu phẩy. Ví dụ: https://example1.com/image1.jpg, https://example2.com/image2.png.',
                },
                {
                    displayName: 'Attachments',
                    name: 'attachments',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    placeholder: 'Add Attachment',
                    default: {},
                    options: [
                        {
                            name: 'attachment',
                            displayName: 'Attachment',
                            values: [
                                {
                                    displayName: 'Type',
                                    name: 'type',
                                    type: 'options',
                                    options: [
                                        {
                                            name: 'Image URL/File URL',
                                            value: 'url',
                                        }
                                    ],
                                    default: 'url',
                                    description: 'Loại file đính kèm',
                                },
                                {
                                    displayName: 'Image URL/File URL',
                                    name: 'imageUrl',
                                    type: 'string',
                                    default: '',
                                    displayOptions: {
                                        show: {
                                            'type': ['url'],
                                        },
                                    },
                                    description: 'URL công khai của ảnh hoặc file',
                                }
                            ],
                        },
                    ],
                    description: 'Một hoặc nhiều ảnh đính kèm để gửi',
                },
            ],
        };
    }
    async execute() {
        const returnData = [];
        const items = this.getInputData();
        const zaloCred = await this.getCredentials('zaloApi');
        const cookieFromCred = JSON.parse(zaloCred.cookie);
        const imeiFromCred = zaloCred.imei;
        const userAgentFromCred = zaloCred.userAgent;
        try {
            const zalo = new zca_js_1.Zalo();
            api = await zalo.login({
                cookie: cookieFromCred,
                imei: imeiFromCred,
                userAgent: userAgentFromCred
            });
            if (!api) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Failed to initialize Zalo API. Check your credentials.');
            }
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Zalo login error: ${error.message}`);
        }
        for (let i = 0; i < items.length; i++) {
            try {
                const threadId = this.getNodeParameter('threadId', i);
                const typeNumber = this.getNodeParameter('type', i);
                const type = typeNumber === 0 ? zca_js_1.ThreadType.User : zca_js_1.ThreadType.Group;
                const rawMessage = this.getNodeParameter('message', i);
                const messageFormat = this.getNodeParameter('messageFormat', i, 'plain');
                const urgency = this.getNodeParameter('urgency', i, 0);
                const quote = this.getNodeParameter('quote', i, {});
                const mentions = this.getNodeParameter('mentions', i, {});
                const manualStyles = this.getNodeParameter('styles', i, {});
                const ttl = this.getNodeParameter('ttl', i, 0);
                const attachments = this.getNodeParameter('attachments', i, {});
                let message = rawMessage;
                let styles = manualStyles;
                if (messageFormat === 'html') {
                    const parsed = parseHtmlToStyles(rawMessage);
                    message = parsed.cleanText;
                    const htmlStyles = parsed.styles;
                    const manualStylesArray = manualStyles && manualStyles.style ? manualStyles.style : [];
                    styles = {
                        style: [...htmlStyles, ...manualStylesArray]
                    };
                    this.logger.info(`HTML parsed: "${rawMessage}" -> "${message}" with ${htmlStyles.length} styles`);
                    this.logger.info(`Parsed styles: ${JSON.stringify(htmlStyles, null, 2)}`);
                }
                const messageContent = {
                    msg: message,
                };
                if (urgency !== 0) {
                    messageContent.urgency = urgency;
                }
                if (ttl !== 0) {
                    messageContent.ttl = ttl;
                }
                if (styles && styles.style && styles.style.length > 0) {
                    messageContent.styles = styles.style.map((style) => ({
                        st: style.st,
                        start: style.start,
                        len: style.end - style.start,
                        indentSize: style.st === 'ind_$' ? style.indentSize : undefined,
                    }));
                }
                if (quote && Object.keys(quote).length > 0) {
                    messageContent.quote = {
                        msgId: quote.msgId,
                        senderId: quote.senderId,
                        content: quote.content,
                    };
                }
                if (mentions && Object.keys(mentions).length > 0) {
                    messageContent.mentions = [{
                            pos: mentions.pos || 0,
                            uid: mentions.uid,
                            len: mentions.len || 0,
                        }];
                }
                if (attachments && attachments.attachment && attachments.attachment.length > 0) {
                    messageContent.attachments = [];
                    for (const attachment of attachments.attachment) {
                        let fileData;
                        if (attachment.type === 'url') {
                            fileData = await (0, helper_1.saveFile)(attachment.imageUrl);
                        }
                        messageContent.attachments.push(fileData);
                    }
                }
                this.logger.info(`Sending message with parameters: ${JSON.stringify(messageContent)}`);
                this.logger.info(`Final styles being sent: ${JSON.stringify(messageContent.styles || 'No styles')}`);
                if (!api) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Zalo API not initialized');
                }
                try {
                    const result = await api.sendTypingEvent(threadId, type);
                    if (!!result) {
                        this.logger.info("Send! typing event");
                    }
                }
                catch (e) {
                    this.logger.error("Cannot send typing event");
                }
                const response = await api.sendMessage(messageContent, threadId, type);
                if (messageContent.attachments && messageContent.attachments.length > 0) {
                    for (const attachment of messageContent.attachments) {
                        this.logger.info(`Remove attachment: ${attachment}`);
                        (0, helper_1.removeFile)(attachment);
                    }
                }
                this.logger.info('Message sent successfully', { threadId, type });
                returnData.push({
                    json: {
                        success: true,
                        response,
                        threadId,
                        threadType: type,
                        messageContent,
                    },
                });
            }
            catch (error) {
                this.logger.error('Error sending Zalo message:', error);
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            success: false,
                            error: error.message,
                        },
                    });
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, { itemIndex: i });
                }
            }
        }
        return [returnData];
    }
}
exports.ZaloSendMessage = ZaloSendMessage;
//# sourceMappingURL=ZaloSendMessage.node.js.map