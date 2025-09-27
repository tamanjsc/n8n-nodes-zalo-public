"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloMessageTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const zca_js_1 = require("zca-js");
const apiInstances = new Map();
const reconnectTimers = new Map();
const messageQueue = new Map();
class ZaloMessageTrigger {
    constructor() {
        this.description = {
            displayName: 'Zalo Message Trigger',
            name: 'zaloMessageTrigger',
            icon: 'file:../shared/zalo.svg',
            group: ['trigger'],
            version: 1,
            description: 'Sự kiện lắng nghe tin nhắn trên Zalo (Hỗ trợ multiple users)',
            defaults: {
                name: 'Zalo Message Trigger',
            },
            inputs: [],
            outputs: ['main'],
            webhooks: [
                {
                    name: 'default',
                    httpMethod: 'POST',
                    responseMode: 'onReceived',
                    path: 'webhook',
                },
            ],
            credentials: [
                {
                    name: 'zaloApi',
                    required: true,
                    displayName: 'Zalo Credential to connect with',
                },
            ],
            properties: [
                {
                    displayName: 'Event Types',
                    name: 'eventTypes',
                    type: 'multiOptions',
                    options: [
                        {
                            name: 'User Messages',
                            value: zca_js_1.ThreadType.User,
                            description: 'Lắng nghe tin nhắn từ người dùng',
                        },
                        {
                            name: 'Group Messages',
                            value: zca_js_1.ThreadType.Group,
                            description: 'Lắng nghe tin nhắn từ nhóm',
                        },
                    ],
                    default: [zca_js_1.ThreadType.User, zca_js_1.ThreadType.Group],
                    required: true,
                    description: 'Types of messages to listen for',
                },
                {
                    displayName: 'Self Listen',
                    name: 'selfListen',
                    type: 'boolean',
                    default: false,
                    required: true,
                    description: 'Whether to allow listening to messages sent by yourself',
                },
                {
                    displayName: 'User Identifier',
                    name: 'userIdentifier',
                    type: 'string',
                    default: 'default',
                    placeholder: 'user1, user2, etc.',
                    required: true,
                    description: 'Định danh duy nhất cho user này (để phân biệt với các user khác)',
                },
            ],
        };
        this.webhookMethods = {
            default: {
                async checkExists() {
                    const webhookData = this.getWorkflowStaticData('node');
                    const userIdentifier = this.getNodeParameter('userIdentifier', 0) || 'default';
                    const credentials = await this.getCredentials('zaloApi');
                    const credentialId = credentials.id || 'default';
                    const instanceKey = `${credentialId}_${userIdentifier}`;
                    this.logger.info(`checkExists: credentialId="${credentialId}", userIdentifier="${userIdentifier}", instanceKey="${instanceKey}"`);
                    const instanceData = webhookData[instanceKey];
                    return !!(instanceData === null || instanceData === void 0 ? void 0 : instanceData.isConnected);
                },
                async create() {
                    const credentials = await this.getCredentials('zaloApi');
                    const userIdentifier = this.getNodeParameter('userIdentifier', 0) || 'default';
                    const credentialId = credentials.id || 'default';
                    const instanceKey = `${credentialId}_${userIdentifier}`;
                    this.logger.info(`Creating instance with userIdentifier: "${userIdentifier}", credentialId: "${credentialId}", instanceKey: "${instanceKey}"`);
                    if (!credentials) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No credentials found');
                    }
                    if (apiInstances.has(instanceKey)) {
                        this.logger.info(`Instance ${instanceKey} already exists, reusing...`);
                        const webhookData = this.getWorkflowStaticData('node');
                        webhookData[instanceKey] = {
                            isConnected: true,
                            eventTypes: this.getNodeParameter('eventTypes', 0),
                            credentialId,
                            userIdentifier,
                            createdAt: new Date().toISOString()
                        };
                        return true;
                    }
                    try {
                        this.logger.info(`Creating new Zalo instance for ${instanceKey}`);
                        const cookieFromCred = JSON.parse(credentials.cookie);
                        const imeiFromCred = credentials.imei;
                        const userAgentFromCred = credentials.userAgent;
                        const selfListen = this.getNodeParameter('selfListen', 0);
                        const zalo = new zca_js_1.Zalo({ selfListen });
                        const api = await zalo.login({ cookie: cookieFromCred, imei: imeiFromCred, userAgent: userAgentFromCred });
                        if (!api) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No API instance found. Please make sure to provide valid credentials.');
                        }
                        apiInstances.set(instanceKey, api);
                        const webhookUrl = this.getNodeWebhookUrl('default');
                        this.logger.info(`Webhook URL for ${instanceKey}: ${webhookUrl}`);
                        const context = {
                            instanceKey,
                            credentialId,
                            userIdentifier,
                            eventTypes: this.getNodeParameter('eventTypes', 0),
                            webhookUrl: this.getNodeWebhookUrl('default'),
                            logger: this.logger,
                            helpers: this.helpers,
                            getWorkflowStaticData: this.getWorkflowStaticData.bind(this)
                        };
                        api.listener.on('message', async (message) => {
                            context.logger.info(`Message received for ${context.instanceKey}: ${message.type}`);
                            context.logger.info(`Message content: ${JSON.stringify(message, null, 2)}`);
                            context.logger.info(`Webhook configuration for ${context.instanceKey}: webhookUrl=${context.webhookUrl}`);
                            if (context.eventTypes.includes(message.type)) {
                                context.logger.info(`Message type ${message.type} matches configured event types for ${context.instanceKey}`);
                                const messageWithContext = {
                                    ...message,
                                    _timestamp: new Date().toISOString(),
                                    _instanceKey: context.instanceKey,
                                    _credentialId: context.credentialId,
                                    _userIdentifier: context.userIdentifier,
                                    _eventType: message.type,
                                    _source: 'zalo_message_trigger'
                                };
                                try {
                                    await context.helpers.httpRequest({
                                        method: 'POST',
                                        url: context.webhookUrl,
                                        body: {
                                            message: messageWithContext,
                                            instanceKey: context.instanceKey,
                                            trigger: 'zalo_message'
                                        },
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    });
                                    context.logger.info(`Webhook triggered successfully for ${context.instanceKey}`);
                                }
                                catch (webhookError) {
                                    context.logger.error(`Failed to trigger webhook for ${context.instanceKey}: ${webhookError.message}`);
                                    if (!messageQueue.has(context.instanceKey)) {
                                        messageQueue.set(context.instanceKey, []);
                                    }
                                    const queue = messageQueue.get(context.instanceKey);
                                    queue.push(messageWithContext);
                                    context.logger.info(`Message stored in fallback queue for ${context.instanceKey}, queue size: ${queue.length}`);
                                }
                            }
                            else {
                                context.logger.info(`Message type ${message.type} does not match configured event types for ${context.instanceKey}, skipping webhook`);
                            }
                            const webhookData = context.getWorkflowStaticData('node');
                            if (!webhookData[context.instanceKey]) {
                                webhookData[context.instanceKey] = {};
                            }
                            const instanceData = webhookData[context.instanceKey];
                            instanceData.lastMessage = message;
                            instanceData.lastMessageTime = new Date().toISOString();
                        });
                        api.listener.start();
                        this.logger.info(`Started listening for ${instanceKey}`);
                        this.logger.info(`Message event listener attached for ${instanceKey}`);
                        const webhookData = this.getWorkflowStaticData('node');
                        if (!webhookData[instanceKey]) {
                            webhookData[instanceKey] = {};
                        }
                        const instanceData = webhookData[instanceKey];
                        instanceData.isConnected = true;
                        instanceData.eventTypes = this.getNodeParameter('eventTypes', 0);
                        instanceData.credentialId = credentialId;
                        instanceData.userIdentifier = userIdentifier;
                        instanceData.createdAt = new Date().toISOString();
                        return true;
                    }
                    catch (error) {
                        this.logger.error(`Failed to create Zalo instance for ${instanceKey}: ${error.message}`);
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Zalo connection failed for ${instanceKey}: ${error.message}`);
                    }
                },
                async delete() {
                    const webhookData = this.getWorkflowStaticData('node');
                    const userIdentifier = this.getNodeParameter('userIdentifier', 0) || 'default';
                    const credentials = await this.getCredentials('zaloApi');
                    const credentialId = credentials.id || 'default';
                    const instanceKey = `${credentialId}_${userIdentifier}`;
                    this.logger.info(`Deleting Zalo instance for ${instanceKey}`);
                    if (apiInstances.has(instanceKey)) {
                        const api = apiInstances.get(instanceKey);
                        if (api) {
                            api.listener.stop();
                            apiInstances.delete(instanceKey);
                        }
                    }
                    if (reconnectTimers.has(instanceKey)) {
                        clearTimeout(reconnectTimers.get(instanceKey));
                        reconnectTimers.delete(instanceKey);
                    }
                    if (messageQueue.has(instanceKey)) {
                        messageQueue.delete(instanceKey);
                    }
                    if (webhookData[instanceKey]) {
                        delete webhookData[instanceKey];
                    }
                    return true;
                },
            },
        };
    }
    async webhook() {
        const req = this.getRequestObject();
        const body = req.body;
        this.logger.info('Webhook received', { body: JSON.stringify(body, null, 2) });
        const webhookData = this.getWorkflowStaticData('node');
        this.logger.info(`Webhook data keys: ${Object.keys(webhookData).join(', ')}`);
        this.logger.info(`Message queue size: ${messageQueue.size}, keys: [${Array.from(messageQueue.keys()).join(', ')}]`);
        const allMessages = [];
        if (body && body.message && body.trigger === 'zalo_message') {
            this.logger.info('Processing direct webhook trigger');
            allMessages.push(body.message);
            this.logger.info(`Added direct message from ${body.instanceKey}`);
        }
        else {
            for (const [instanceKey, messages] of messageQueue.entries()) {
                this.logger.info(`Processing fallback queued messages for instance: ${instanceKey}, message count: ${messages.length}`);
                if (messages.length > 0) {
                    for (const message of messages) {
                        allMessages.push(message);
                        this.logger.info(`Added fallback queued message from ${instanceKey}`);
                    }
                    messageQueue.set(instanceKey, []);
                    this.logger.info(`Cleared fallback message queue for ${instanceKey}`);
                }
            }
        }
        if (allMessages.length === 0) {
            this.logger.info('No messages found, returning empty trigger data');
            allMessages.push({
                _trigger: 'empty',
                _timestamp: new Date().toISOString(),
                _source: 'zalo_message_trigger',
                _debug: {
                    webhookDataKeys: Object.keys(webhookData),
                    messageQueueSize: messageQueue.size,
                    messageQueueKeys: Array.from(messageQueue.keys()),
                    requestBody: body
                }
            });
        }
        this.logger.info(`Processed ${allMessages.length} messages total`);
        return {
            workflowData: [this.helpers.returnJsonArray(allMessages)],
        };
    }
}
exports.ZaloMessageTrigger = ZaloMessageTrigger;
//# sourceMappingURL=ZaloMessageTrigger.node.js.map