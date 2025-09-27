"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloLoginByQr = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const zca_js_1 = require("zca-js");
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
async function sendWebhookNotification(webhookUrl, eventData, logger) {
    try {
        if (!webhookUrl || webhookUrl.trim() === '') {
            if (logger) {
                logger.info('Webhook URL is empty, skipping webhook notification');
            }
            else {
                console.log('Webhook URL is empty, skipping webhook notification');
            }
            return;
        }
        try {
            new URL(webhookUrl);
        }
        catch (error) {
            if (logger) {
                logger.warn(`Invalid webhook URL: ${webhookUrl}`);
            }
            else {
                console.log(`Invalid webhook URL: ${webhookUrl}`);
            }
            return;
        }
        if (logger) {
            logger.info(`Sending webhook to: ${webhookUrl}`);
            logger.debug(`Webhook data: ${JSON.stringify(eventData, null, 2)}`);
        }
        else {
            console.log(`Sending webhook to: ${webhookUrl}`);
            console.log(`Webhook data:`, JSON.stringify(eventData, null, 2));
        }
        const response = await axios_1.default.post(webhookUrl, eventData, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 15000
        });
        if (logger) {
            logger.info(`Webhook sent successfully: ${response.status} - ${response.statusText}`);
            if (response.headers) {
                logger.debug('Response headers:', response.headers);
            }
        }
        else {
            console.log(`Webhook sent successfully: ${response.status} - ${response.statusText}`);
            if (response.headers) {
                console.log('Response headers:', response.headers);
            }
        }
    }
    catch (error) {
        if (logger) {
            logger.error(`Failed to send webhook to ${webhookUrl}: ${error.message}`);
            if (error.response) {
                logger.error(`Response status: ${error.response.status}`);
                logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
            }
            else if (error.request) {
                logger.warn('No response received from webhook server');
            }
        }
        else {
            console.log(`Failed to send webhook to ${webhookUrl}:`);
            console.log(`Error: ${error.message}`);
            if (error.response) {
                console.log(`Response status: ${error.response.status}`);
                console.log(`Response data:`, error.response.data);
            }
            else if (error.request) {
                console.log('No response received from webhook server');
            }
        }
    }
}
class ZaloLoginByQr {
    constructor() {
        this.description = {
            displayName: 'Zalo Login Via QR Code',
            name: 'zaloLoginByQr',
            group: ['Zalo'],
            version: 1,
            description: 'Đăng nhập Zalo bằng QR code và lưu thông tin vào Credential',
            defaults: {
                name: 'Zalo Login Via QR Code',
            },
            inputs: ['main'],
            outputs: ['main'],
            icon: 'file:../shared/zalo.svg',
            credentials: [
                {
                    name: 'zaloApi',
                    required: false,
                    displayName: 'Zalo Credential to connect with',
                },
                {
                    name: 'n8nZaloApi',
                    required: true,
                    displayName: 'n8n Account Credential',
                },
            ],
            properties: [
                {
                    displayName: 'State',
                    name: 'state',
                    type: 'string',
                    default: '',
                    placeholder: 'user1, user2, session1, etc.',
                    required: true,
                    description: 'Unique identifier for this QR login session (used to identify who this QR belongs to)',
                },
                {
                    displayName: 'Proxy',
                    name: 'proxy',
                    type: 'string',
                    default: '',
                    placeholder: 'https://user:pass@host:port',
                    description: 'HTTP proxy to use for Zalo API requests',
                },
                {
                    displayName: 'Domain',
                    name: 'domain',
                    type: 'string',
                    default: '',
                    placeholder: 'https://zalo.me',
                    description: 'Domain to use for Zalo API requests',
                },
                {
                    displayName: 'Webhook URL',
                    name: 'webhookUrl',
                    type: 'string',
                    default: 'https://auto.aiviethub.com/webhook/zalo-log',
                    placeholder: 'https://auto.aiviethub.com/webhook/zalo-log',
                    description: 'Webhook URL to send events to (QR expired, scanned, declined, etc.)',
                },
                {
                    displayName: 'Enable Webhook',
                    name: 'enableWebhook',
                    type: 'boolean',
                    default: true,
                    description: 'Whether to send webhook notifications for Zalo events',
                },
            ],
        };
    }
    async execute() {
        const returnData = [];
        const state = this.getNodeParameter('state', 0, '');
        const proxy = this.getNodeParameter('proxy', 0, '');
        const domain = this.getNodeParameter('domain', 0, '');
        const webhookUrl = this.getNodeParameter('webhookUrl', 0, 'https://auto.aiviethub.com/webhook/zalo-log');
        const enableWebhook = this.getNodeParameter('enableWebhook', 0, true);
        const timeout = 30;
        const fileName = 'zalo-qr-code.png';
        let zaloCredential;
        let n8nCredential;
        try {
            zaloCredential = await this.getCredentials('zaloApi');
        }
        catch (error) {
        }
        try {
            n8nCredential = await this.getCredentials('n8nZaloApi');
        }
        catch (error) {
        }
        let selectedCredential = undefined;
        if (n8nCredential) {
            this.logger.info('Using n8n account credential');
            selectedCredential = n8nCredential;
        }
        else if (zaloCredential) {
            this.logger.info('Using Zalo API credential');
            selectedCredential = zaloCredential;
        }
        else {
            this.logger.info('No credentials provided, will generate QR code for login');
        }
        try {
            const zaloOptions = {
                selfListen: true,
                logging: true,
            };
            if (proxy) {
                zaloOptions.proxy = proxy;
            }
            let zalo;
            if (selectedCredential) {
                this.logger.info('Using existing Zalo credentials');
                zalo = new zca_js_1.Zalo(zaloOptions);
                if (selectedCredential === n8nCredential) {
                    this.logger.info('Using n8n credential to get Zalo credentials');
                    const n8nApiKey = selectedCredential.apiKey;
                    const n8nUrl = selectedCredential.url || 'http://localhost:5678';
                    this.logger.info(`Using n8n API at ${n8nUrl} with API key ${n8nApiKey ? 'provided' : 'not provided'}`);
                    this.logger.info('n8n credential support is not fully implemented yet. Will use QR code login.');
                    zalo = new zca_js_1.Zalo(zaloOptions);
                }
                else {
                    this.logger.info('Using Zalo credential for login');
                    const cookie = selectedCredential.cookie;
                    const imei = selectedCredential.imei;
                    const userAgent = selectedCredential.userAgent;
                    const supportCode = selectedCredential.supportCode;
                    const licenseKey = selectedCredential.licenseKey;
                    if (selectedCredential.proxy) {
                        this.logger.info(`Using proxy from credential: ${selectedCredential.proxy}`);
                        zaloOptions.proxy = selectedCredential.proxy;
                    }
                    await zalo.login({
                        cookie,
                        imei,
                        userAgent,
                        supportCode,
                        licenseKey,
                    });
                }
            }
            else {
                zalo = new zca_js_1.Zalo(zaloOptions);
            }
            this.logger.info('Starting Zalo QR login process...');
            let userDisplayName = '';
            let userAvatar = '';
            let userImei = '';
            let userUserAgent = '';
            let userZaloUserId = '';
            let createdCredentialId = '';
            const processContext = (context) => {
                if (!context) {
                    this.logger.warn('Context is null or undefined');
                    return;
                }
                const cookie = context.cookie || '';
                const imei = context.imei || '';
                const userAgent = context.userAgent || '';
                const zaloUserId = context.userId || context.zaloUserId || '';
                userImei = imei;
                userUserAgent = userAgent;
                userZaloUserId = zaloUserId;
                this.logger.info('=== ZALO CREDENTIALS ===');
                this.logger.info(`Cookie: ${cookie ? `Received (length: ${typeof cookie === 'string' ? cookie.length : (Array.isArray(cookie) ? cookie.length : 'unknown')})` : 'None'}`);
                this.logger.info(`IMEI: ${imei ? imei : 'None'}`);
                this.logger.info(`User Agent: ${userAgent ? userAgent : 'None'}`);
                this.logger.info(`Zalo User ID: ${zaloUserId ? zaloUserId : 'None'}`);
                this.logger.info('=== END CREDENTIALS ===');
            };
            const setupEventListeners = (api) => {
                this.logger.info('Setting up event listeners to get credentials');
                try {
                    if (typeof api.getContext === 'function') {
                        const contextResult = api.getContext();
                        if (contextResult && typeof contextResult.then === 'function') {
                            contextResult.then((context) => {
                                processContext(context);
                            }).catch((error) => {
                                this.logger.error(`Error getting context: ${error.message}`);
                            });
                        }
                        else {
                            processContext(contextResult);
                        }
                    }
                    else {
                        this.logger.warn('getContext is not a function');
                        if (api.context) {
                            this.logger.info('Found context in api object');
                            processContext(api.context);
                        }
                        else {
                            this.logger.warn('No context found in api object');
                        }
                    }
                }
                catch (error) {
                    this.logger.error(`Error in setupEventListeners: ${error.message}`);
                }
            };
            const qrCodePromise = new Promise(async (resolve, reject) => {
                let isResolved = false;
                let api = null;
                const timeoutId = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        if (enableWebhook && webhookUrl) {
                            const webhookData = {
                                event: 'qr_timeout',
                                timestamp: new Date().toISOString(),
                                message: 'Timeout generating QR code. Please try again or check your Zalo connection.',
                                status: 'timeout',
                                state: state,
                                timeoutSeconds: timeout
                            };
                            sendWebhookNotification(webhookUrl, webhookData);
                        }
                        reject(new n8n_workflow_1.NodeOperationError(this.getNode(), 'Timeout generating QR code. Please try again or check your Zalo connection.'));
                    }
                }, timeout * 1000);
                try {
                    api = await zalo.loginQR(null, (qrEvent) => {
                        var _a, _b, _c;
                        this.logger.info(`Received QR event type: ${qrEvent ? qrEvent.type : 'no event'}`);
                        switch (qrEvent.type) {
                            case 0:
                                if ((_a = qrEvent === null || qrEvent === void 0 ? void 0 : qrEvent.data) === null || _a === void 0 ? void 0 : _a.image) {
                                    const qrCodeBase64 = qrEvent.data.image;
                                    this.logger.info(`QR code generated, length: ${qrCodeBase64.length}`);
                                    if (isResolved)
                                        return;
                                    clearTimeout(timeoutId);
                                    if (qrCodeBase64) {
                                        isResolved = true;
                                        resolve(qrCodeBase64);
                                    }
                                }
                                else {
                                    console.log('Could not get QR code from Zalo SDK');
                                    reject(new Error("Could not get QR code"));
                                }
                                break;
                            case 1:
                                this.logger.warn('QR code expired. Please try again.');
                                if (enableWebhook && webhookUrl) {
                                    const webhookData = {
                                        event: 'qr_expired',
                                        timestamp: new Date().toISOString(),
                                        message: 'QR code expired. Please try again.',
                                        status: 'expired',
                                        state: state
                                    };
                                    sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                }
                                break;
                            case 2:
                                this.logger.info('=== QR CODE SCANNED ===');
                                if (qrEvent === null || qrEvent === void 0 ? void 0 : qrEvent.data) {
                                    userDisplayName = qrEvent.data.display_name || '';
                                    userAvatar = qrEvent.data.avatar || '';
                                    this.logger.info(`User: ${userDisplayName}`);
                                    this.logger.info(`Avatar: ${userAvatar ? 'Yes' : 'No'}`);
                                }
                                if (enableWebhook && webhookUrl) {
                                    const webhookData = {
                                        event: 'qr_scanned',
                                        timestamp: new Date().toISOString(),
                                        message: 'QR code scanned successfully',
                                        status: 'scanned',
                                        state: state,
                                        "zalo_name": userDisplayName,
                                        "zalo_avatar": userAvatar,
                                        userInfo: {
                                            displayName: userDisplayName || 'Unknown',
                                            hasAvatar: !!userAvatar
                                        }
                                    };
                                    sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                }
                                break;
                            case 3:
                                this.logger.warn('=== QR CODE DECLINED ===');
                                if ((_b = qrEvent === null || qrEvent === void 0 ? void 0 : qrEvent.data) === null || _b === void 0 ? void 0 : _b.code) {
                                    this.logger.warn(`Decline code: ${qrEvent.data.code}`);
                                }
                                if (enableWebhook && webhookUrl) {
                                    const webhookData = {
                                        event: 'qr_declined',
                                        timestamp: new Date().toISOString(),
                                        message: 'QR code was declined by user',
                                        status: 'declined',
                                        state: state,
                                        declineCode: ((_c = qrEvent === null || qrEvent === void 0 ? void 0 : qrEvent.data) === null || _c === void 0 ? void 0 : _c.code) || 'unknown'
                                    };
                                    sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                }
                                break;
                            case 4:
                                this.logger.info('=== GOT LOGIN INFO ===');
                                if (qrEvent === null || qrEvent === void 0 ? void 0 : qrEvent.data) {
                                    const cookie = qrEvent.data.cookie || [];
                                    const imei = qrEvent.data.imei || '';
                                    const userAgent = qrEvent.data.userAgent || '';
                                    const displayName = userDisplayName;
                                    const avatar = userAvatar;
                                    if (cookie && cookie.length > 0 && imei && userAgent) {
                                        this.logger.info('Login trực tiếp để lấy UID...');
                                        const loginZalo = new zca_js_1.Zalo();
                                        loginZalo.login({ cookie, imei, userAgent })
                                            .then((loginApi) => {
                                            if (loginApi === null || loginApi === void 0 ? void 0 : loginApi.getOwnId) {
                                                const newUid = loginApi.getOwnId();
                                                userZaloUserId = newUid;
                                                this.logger.info(`UID: ${newUid}`);
                                                if (enableWebhook && webhookUrl) {
                                                    const webhookData = {
                                                        event: 'login_success',
                                                        timestamp: new Date().toISOString(),
                                                        message: 'Zalo login successful',
                                                        status: 'success',
                                                        state: state,
                                                        imei: imei,
                                                        user_agent: userAgent,
                                                        zalo_user_id: newUid,
                                                        zalo_name: displayName,
                                                        zalo_avatar: avatar,
                                                        userInfo: {
                                                            displayName: displayName || 'Unknown',
                                                            hasAvatar: !!userAvatar
                                                        },
                                                        loginData: {
                                                            hasCookie: cookie.length > 0,
                                                            hasImei: !!imei,
                                                            hasUserAgent: !!userAgent
                                                        }
                                                    };
                                                    sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                                }
                                            }
                                        })
                                            .catch((error) => {
                                            this.logger.warn(`Login error: ${error.message}`);
                                            userZaloUserId = 'unknown';
                                            if (enableWebhook && webhookUrl) {
                                                const webhookData = {
                                                    event: 'login_success',
                                                    timestamp: new Date().toISOString(),
                                                    message: 'Zalo login successful',
                                                    status: 'success',
                                                    state: state,
                                                    imei: imei,
                                                    user_agent: userAgent,
                                                    zalo_user_id: 'unknown',
                                                    zalo_name: displayName,
                                                    zalo_avatar: avatar,
                                                    userInfo: {
                                                        displayName: displayName || 'Unknown',
                                                        hasAvatar: !!userAvatar
                                                    },
                                                    loginData: {
                                                        hasCookie: cookie.length > 0,
                                                        hasImei: !!imei,
                                                        hasUserAgent: !!userAgent
                                                    }
                                                };
                                                sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                            }
                                        });
                                    }
                                    else {
                                        userZaloUserId = 'unknown';
                                        if (enableWebhook && webhookUrl) {
                                            const webhookData = {
                                                event: 'login_success',
                                                timestamp: new Date().toISOString(),
                                                message: 'Zalo login successful',
                                                status: 'success',
                                                state: state,
                                                imei: imei,
                                                user_agent: userAgent,
                                                zalo_user_id: 'unknown',
                                                zalo_name: displayName,
                                                zalo_avatar: avatar,
                                                userInfo: {
                                                    displayName: displayName || 'Unknown',
                                                    hasAvatar: !!userAvatar
                                                },
                                                loginData: {
                                                    hasCookie: cookie.length > 0,
                                                    hasImei: !!imei,
                                                    hasUserAgent: !!userAgent
                                                }
                                            };
                                            sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                        }
                                    }
                                    this.logger.info(`Cookie received: ${cookie.length > 0 ? 'Yes' : 'No'}`);
                                    this.logger.info(`IMEI received: ${imei ? 'Yes' : 'No'}`);
                                    this.logger.info(`User Agent received: ${userAgent ? 'Yes' : 'No'}`);
                                    this.logger.info(`User Display Name: ${displayName}`);
                                    try {
                                        if (cookie.length > 0 || imei || userAgent) {
                                            const credentialName = domain ? `${displayName}_${domain}` : displayName;
                                            const credentialData = {
                                                cookie: JSON.stringify(cookie),
                                                imei: imei,
                                                userAgent: userAgent,
                                                proxy: proxy || '',
                                                supportCode: '',
                                                licenseKey: ''
                                            };
                                            try {
                                                this.logger.info('Attempting to create Zalo credential via n8n API');
                                                const credentialApiData = {
                                                    name: credentialName,
                                                    type: 'zaloApi',
                                                    nodesAccess: [],
                                                    data: credentialData
                                                };
                                                const ports = [5678];
                                                const createCredentialOnPort = async (port) => {
                                                    const n8nApi = await this.getCredentials('n8nZaloApi');
                                                    const n8nApiUrl = n8nApi.url;
                                                    const fullApiUrl = `${n8nApiUrl}/api/v1/credentials`;
                                                    const n8nApiKey = n8nApi.apiKey;
                                                    this.logger.info(`Trying to create credential via n8n API at ${fullApiUrl}`);
                                                    try {
                                                        const response = await axios_1.default.post(fullApiUrl, credentialApiData, {
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'X-N8N-API-KEY': n8nApiKey
                                                            },
                                                        });
                                                        this.logger.info('Credential created successfully via n8n API');
                                                        if (response.data && response.data.id) {
                                                            this.logger.info(`Credential ID: ${response.data.id}`);
                                                            createdCredentialId = response.data.id;
                                                            if (enableWebhook && webhookUrl) {
                                                                const webhookData = {
                                                                    event: 'credential_created',
                                                                    timestamp: new Date().toISOString(),
                                                                    message: 'Zalo credential created successfully',
                                                                    status: 'success',
                                                                    state: state,
                                                                    credential_id: response.data.id,
                                                                    credential_name: credentialName,
                                                                    credential_type: 'zaloApi'
                                                                };
                                                                sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                                            }
                                                        }
                                                        else {
                                                            this.logger.info('Credential ID: Not available in response');
                                                            this.logger.debug('Response data:', response.data);
                                                        }
                                                        return true;
                                                    }
                                                    catch (apiError) {
                                                        this.logger.error(`Error creating credential on port ${port}: ${apiError.message}`);
                                                        return false;
                                                    }
                                                };
                                                let credentialCreated = false;
                                                (async () => {
                                                    for (const port of ports) {
                                                        try {
                                                            const result = await createCredentialOnPort.call(this, port);
                                                            if (result) {
                                                                credentialCreated = true;
                                                                break;
                                                            }
                                                        }
                                                        catch (error) {
                                                            this.logger.error(`Error trying port ${port}: ${error.message}`);
                                                        }
                                                    }
                                                })().catch(error => {
                                                    this.logger.error(`Error in credential creation: ${error.message}`);
                                                });
                                                if (!credentialCreated) {
                                                    this.logger.warn('Could not create credential via n8n API on any port.');
                                                    this.logger.info('Credential info saved to file. You can create it manually using:');
                                                    this.logger.info('node auto-create-zalo-credential.js');
                                                }
                                            }
                                            catch (error) {
                                                this.logger.error(`Error creating credential: ${error.message}`);
                                                this.logger.info('Credential info saved to file. You can create it manually using:');
                                                this.logger.info('node auto-create-zalo-credential.js');
                                            }
                                        }
                                        else {
                                            this.logger.warn('=== NO CREDENTIALS TO SAVE ===');
                                            this.logger.warn('No login information available to save');
                                        }
                                    }
                                    catch (fileError) {
                                        this.logger.error(`Error saving credentials: ${fileError.message}`);
                                    }
                                }
                                break;
                            default:
                                this.logger.warn(`Unknown QR event type: ${qrEvent.type}`);
                                if (enableWebhook && webhookUrl) {
                                    const webhookData = {
                                        event: 'unknown_event',
                                        timestamp: new Date().toISOString(),
                                        message: 'Unknown QR event type received',
                                        status: 'unknown',
                                        state: state,
                                        eventType: qrEvent.type,
                                        eventData: qrEvent
                                    };
                                    sendWebhookNotification(webhookUrl, webhookData, this.logger);
                                }
                                break;
                        }
                    });
                    this.logger.info('Starting Zalo listener');
                    api.listener.start();
                    api.listener.onConnected(() => {
                        this.logger.info("=== ZALO SDK CONNECTED ===");
                        setupEventListeners(api);
                        if (enableWebhook && webhookUrl) {
                            setTimeout(() => {
                                const webhookData = {
                                    event: 'connection_success',
                                    timestamp: new Date().toISOString(),
                                    message: 'Zalo SDK connected successfully',
                                    status: 'connected',
                                    state: state,
                                };
                                sendWebhookNotification(webhookUrl, webhookData, this.logger);
                            }, 1000);
                        }
                    });
                    api.listener.onError((error) => {
                        this.logger.error("=== ZALO ERROR ===", error);
                        if (enableWebhook && webhookUrl) {
                            const webhookData = {
                                event: 'connection_error',
                                timestamp: new Date().toISOString(),
                                message: 'Zalo SDK connection error',
                                status: 'error',
                                state: state,
                                error: error.message || 'Unknown error',
                                errorType: error.type || 'unknown'
                            };
                            sendWebhookNotification(webhookUrl, webhookData, this.logger);
                        }
                    });
                    api.listener.onMessage((message) => {
                        this.logger.info("=== ZALO MESSAGE RECEIVED ===");
                        this.logger.info(`Message type: ${message.type}`);
                        this.logger.debug(`Message content: ${JSON.stringify(message).substring(0, 200)}...`);
                        if (message.type === 'login_success' || message.type === 'qr_scanned') {
                            this.logger.info("=== QR CODE SCANNED OR LOGIN SUCCESSFUL ===");
                            setupEventListeners(api);
                        }
                    });
                    this.logger.info('All event listeners set up');
                }
                catch (error) {
                    clearTimeout(timeoutId);
                    if (!isResolved) {
                        isResolved = true;
                        reject(error);
                    }
                }
            });
            const qrCodeBase64 = await qrCodePromise;
            const binaryData = Buffer.from(qrCodeBase64, 'base64');
            const newItem = {
                json: {
                    success: true,
                    state: state,
                    message: selectedCredential === n8nCredential
                        ? 'Using n8n account credential. QR code generated successfully.'
                        : (selectedCredential === zaloCredential
                            ? 'Using existing Zalo credentials. QR code generated successfully.'
                            : 'QR code generated successfully. Scan with Zalo app to login.'),
                    fileName,
                    usingExistingCredential: !!selectedCredential,
                    credentialType: selectedCredential === n8nCredential ? 'n8nZaloApi' : (selectedCredential === zaloCredential ? 'zaloApi' : null),
                    userInfo: {
                        displayName: userDisplayName || 'Not available yet - scan QR code first',
                        avatar: userAvatar || 'Not available yet - scan QR code first'
                    },
                    zaloApiInfo: {
                        imei: userImei || 'Not available yet',
                        userAgent: userUserAgent || 'Not available yet',
                        zaloUserId: userZaloUserId || 'Not available yet'
                    },
                    webhook: {
                        enabled: enableWebhook,
                        url: webhookUrl,
                        state: state,
                        events: [
                            'qr_generated',
                            'qr_expired',
                            'qr_scanned',
                            'qr_declined',
                            'login_success',
                            'connection_success',
                            'connection_error',
                            'credential_created',
                            'qr_timeout',
                            'unknown_event'
                        ]
                    }
                },
                binary: {
                    data: await this.helpers.prepareBinaryData(binaryData, fileName, 'image/png'),
                },
            };
            returnData.push(newItem);
            if (returnData[0] && returnData[0].json) {
                if (!selectedCredential) {
                    returnData[0].json.credentialInstructions = 'Credentials have been saved to file. Credentials will be created automatically if n8n API credentials are provided.';
                    returnData[0].json.credentialFilePath = path.join(process.cwd(), 'output', 'zalo-credentials.json');
                    returnData[0].json.autoCreateScript = 'node auto-create-zalo-credential.js';
                    returnData[0].json.autoCreateApi = 'Credentials will be created automatically via n8n API if n8n API credentials are provided.';
                    if (createdCredentialId) {
                        returnData[0].json.createdCredentialId = createdCredentialId;
                        returnData[0].json.credentialCreationStatus = 'success';
                    }
                }
                else if (selectedCredential === n8nCredential) {
                    returnData[0].json.credentialInstructions = 'Using n8n account credential. New Zalo credentials will be created automatically after successful login.';
                    returnData[0].json.credentialName = selectedCredential.name || 'Unknown';
                    returnData[0].json.credentialId = selectedCredential.id || 'Unknown';
                    returnData[0].json.credentialType = 'n8nZaloApi';
                    returnData[0].json.autoCreateApi = 'Credentials will be created automatically via n8n API after successful login.';
                    if (createdCredentialId) {
                        returnData[0].json.createdCredentialId = createdCredentialId;
                        returnData[0].json.credentialCreationStatus = 'success';
                    }
                }
                else {
                    returnData[0].json.credentialInstructions = 'Using existing Zalo credentials from the selected credential.';
                    returnData[0].json.credentialName = selectedCredential.name || 'Unknown';
                    returnData[0].json.credentialId = selectedCredential.id || 'Unknown';
                    returnData[0].json.credentialType = 'zaloApi';
                }
            }
            return [returnData];
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({
                    error: error.message,
                    state: state,
                    success: false
                }), { itemData: { item: 0 } });
                return [executionData];
            }
            else {
                throw error;
            }
        }
    }
}
exports.ZaloLoginByQr = ZaloLoginByQr;
//# sourceMappingURL=ZaloLoginByQr.node.js.map