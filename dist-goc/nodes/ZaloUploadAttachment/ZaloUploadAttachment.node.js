"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloUploadAttachment = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const zca_js_1 = require("zca-js");
const helper_1 = require("../utils/helper");
const fs_1 = __importDefault(require("fs"));
let api;
class ZaloUploadAttachment {
    constructor() {
        this.description = {
            displayName: 'Zalo Upload Attachment',
            name: 'zaloUploadAttachment',
            icon: 'file:../shared/zalo.svg',
            group: ['Zalo'],
            version: 1,
            description: 'Upload file đính kèm lên Zalo để lấy thông tin file (photoId, fileId, fileUrl...)',
            defaults: {
                name: 'Zalo Upload Attachment',
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
                    description: 'ID của thread (user ID hoặc group ID) để upload file',
                },
                {
                    displayName: 'Thread Type',
                    name: 'threadType',
                    type: 'options',
                    options: [
                        {
                            name: 'User',
                            value: 'user',
                        },
                        {
                            name: 'Group',
                            value: 'group',
                        },
                    ],
                    default: 'user',
                    description: 'Loại thread (user hoặc group)',
                },
                {
                    displayName: 'Upload Sources',
                    name: 'sources',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    placeholder: 'Add Source',
                    default: {},
                    options: [
                        {
                            name: 'source',
                            displayName: 'Source',
                            values: [
                                {
                                    displayName: 'Source Type',
                                    name: 'type',
                                    type: 'options',
                                    options: [
                                        {
                                            name: 'File Path',
                                            value: 'filePath',
                                        },
                                        {
                                            name: 'File URL',
                                            value: 'fileUrl',
                                        },
                                        {
                                            name: 'Binary Data',
                                            value: 'binaryData',
                                        },
                                    ],
                                    default: 'filePath',
                                    description: 'Loại nguồn file để upload',
                                },
                                {
                                    displayName: 'File Path',
                                    name: 'filePath',
                                    type: 'string',
                                    default: '',
                                    displayOptions: {
                                        show: {
                                            'type': ['filePath'],
                                        },
                                    },
                                    description: 'Đường dẫn đến file cần upload',
                                },
                                {
                                    displayName: 'File URL',
                                    name: 'fileUrl',
                                    type: 'string',
                                    default: '',
                                    displayOptions: {
                                        show: {
                                            'type': ['fileUrl'],
                                        },
                                    },
                                    description: 'URL của file cần upload',
                                },
                                {
                                    displayName: 'Binary Property',
                                    name: 'binaryProperty',
                                    type: 'string',
                                    default: 'data',
                                    displayOptions: {
                                        show: {
                                            'type': ['binaryData'],
                                        },
                                    },
                                    description: 'Tên của binary property chứa file data',
                                },
                                {
                                    displayName: 'File Name',
                                    name: 'fileName',
                                    type: 'string',
                                    default: '',
                                    displayOptions: {
                                        show: {
                                            'type': ['binaryData'],
                                        },
                                    },
                                    description: 'Tên file (bắt buộc khi sử dụng binary data)',
                                },
                            ],
                        },
                    ],
                    description: 'Danh sách các file cần upload',
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
            const zalo = new zca_js_1.Zalo({
                selfListen: false,
                logging: true,
                imageMetadataGetter: async (filePath) => {
                    return {
                        width: 0,
                        height: 0,
                        size: 0
                    };
                }
            });
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
                const threadTypeStr = this.getNodeParameter('threadType', i);
                const threadType = threadTypeStr === 'user' ? zca_js_1.ThreadType.User : zca_js_1.ThreadType.Group;
                const sourcesData = this.getNodeParameter('sources', i, {});
                if (!sourcesData.source || sourcesData.source.length === 0) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Cần ít nhất một file để upload');
                }
                const sources = [];
                const tempFiles = [];
                for (const sourceConfig of sourcesData.source) {
                    let source;
                    if (sourceConfig.type === 'filePath') {
                        const filePath = sourceConfig.filePath;
                        if (!fs_1.default.existsSync(filePath)) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `File không tồn tại: ${filePath}`);
                        }
                        source = filePath;
                    }
                    else if (sourceConfig.type === 'fileUrl') {
                        const fileUrl = sourceConfig.fileUrl;
                        const tempFilePath = await (0, helper_1.saveFile)(fileUrl);
                        if (!tempFilePath) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Không thể tải file từ URL: ${fileUrl}`);
                        }
                        tempFiles.push(tempFilePath);
                        source = tempFilePath;
                    }
                    else if (sourceConfig.type === 'binaryData') {
                        const binaryProperty = sourceConfig.binaryProperty;
                        const fileName = sourceConfig.fileName;
                        if (!fileName) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'File name là bắt buộc khi sử dụng binary data');
                        }
                        this.helpers.assertBinaryData(i, binaryProperty);
                        const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
                        source = {
                            data: buffer,
                            filename: fileName,
                            metadata: {
                                fileName: fileName,
                                totalSize: buffer.length,
                            }
                        };
                    }
                    sources.push(source);
                }
                this.logger.info(`Uploading ${sources.length} file(s) to thread ${threadId} (${threadTypeStr})`);
                if (!api) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Zalo API not initialized');
                }
                const uploadResults = await api.uploadAttachment(sources, threadId, threadType);
                for (const tempFile of tempFiles) {
                    (0, helper_1.removeFile)(tempFile);
                }
                this.logger.info(`Successfully uploaded ${uploadResults.length} file(s)`);
                returnData.push({
                    json: {
                        success: true,
                        threadId,
                        threadType: threadTypeStr,
                        uploadResults,
                        totalFiles: uploadResults.length,
                    },
                });
            }
            catch (error) {
                this.logger.error('Error uploading attachments:', error);
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
exports.ZaloUploadAttachment = ZaloUploadAttachment;
//# sourceMappingURL=ZaloUploadAttachment.node.js.map