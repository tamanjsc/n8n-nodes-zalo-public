"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloSticker = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const ZaloStickerDescription_1 = require("./ZaloStickerDescription");
const zca_js_1 = require("zca-js");
let api;
class ZaloSticker {
    constructor() {
        this.description = {
            displayName: 'Zalo Sticker',
            name: 'zaloSticker',
            icon: 'file:../shared/zalo.svg',
            group: ['Zalo'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Quản lý sticker trên Zalo',
            defaults: {
                name: 'Zalo Sticker',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'zaloApi',
                    required: true,
                    displayName: 'Zalo Credential to connect with',
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Zalo Sticker',
                            value: 'zaloSticker',
                        },
                    ],
                    default: 'zaloSticker',
                },
                ...ZaloStickerDescription_1.zaloStickerOperations,
                ...ZaloStickerDescription_1.zaloStickerFields,
            ],
        };
    }
    async execute() {
        var _a, _b, _c;
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const zaloCred = await this.getCredentials('zaloApi');
        const cookieFromCred = JSON.parse(zaloCred.cookie);
        const imeiFromCred = zaloCred.imei;
        const userAgentFromCred = zaloCred.userAgent;
        const cookie = cookieFromCred !== null && cookieFromCred !== void 0 ? cookieFromCred : (_a = items.find((x) => x.json.cookie)) === null || _a === void 0 ? void 0 : _a.json.cookie;
        const imei = imeiFromCred !== null && imeiFromCred !== void 0 ? imeiFromCred : (_b = items.find((x) => x.json.imei)) === null || _b === void 0 ? void 0 : _b.json.imei;
        const userAgent = userAgentFromCred !== null && userAgentFromCred !== void 0 ? userAgentFromCred : (_c = items.find((x) => x.json.userAgent)) === null || _c === void 0 ? void 0 : _c.json.userAgent;
        const zalo = new zca_js_1.Zalo();
        const _api = await zalo.login({ cookie, imei, userAgent });
        api = _api;
        if (!api) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No API instance found. Please make sure to provide valid credentials.');
        }
        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'zaloSticker') {
                    if (operation === 'getStickers') {
                        const name = this.getNodeParameter('name', i);
                        const result = await api.getStickers(name);
                        returnData.push({
                            json: {
                                success: true,
                                message: 'Lấy danh sách sticker thành công',
                                data: result,
                                count: Array.isArray(result) ? result.length : 0,
                            },
                            pairedItem: {
                                item: i,
                            },
                        });
                    }
                    else if (operation === 'getStickerDetail') {
                        const stickerId = this.getNodeParameter('stickerId', i);
                        const result = await api.getStickersDetail(parseInt(stickerId));
                        returnData.push({
                            json: {
                                success: true,
                                message: 'Lấy chi tiết sticker thành công',
                                data: result,
                            },
                            pairedItem: {
                                item: i,
                            },
                        });
                    }
                    else if (operation === 'searchStickers') {
                        const query = this.getNodeParameter('query', i);
                        const result = await api.getStickers(query);
                        returnData.push({
                            json: {
                                success: true,
                                message: 'Tìm kiếm sticker thành công',
                                data: result,
                                count: Array.isArray(result) ? result.length : 0,
                                query: query,
                            },
                            pairedItem: {
                                item: i,
                            },
                        });
                    }
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            success: false,
                            error: error.message,
                            pairedItem: {
                                item: i,
                            },
                        },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.ZaloSticker = ZaloSticker;
//# sourceMappingURL=ZaloSticker.node.js.map