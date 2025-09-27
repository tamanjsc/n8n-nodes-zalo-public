"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zaloStickerFields = exports.zaloStickerOperations = void 0;
exports.zaloStickerOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['zaloSticker'],
            },
        },
        options: [
            {
                name: 'Lấy Danh Sách Sticker',
                value: 'getStickers',
                action: 'Lấy danh sách tất cả sticker có sẵn.',
            },
            {
                name: 'Lấy Chi Tiết Sticker',
                value: 'getStickerDetail',
                action: 'Lấy thông tin chi tiết của một sticker cụ thể.',
            },
            {
                name: 'Tìm Kiếm Sticker',
                value: 'searchStickers',
                action: 'Tìm kiếm sticker theo từ khóa.',
            },
        ],
        default: 'getStickers',
    },
];
exports.zaloStickerFields = [
    {
        displayName: 'Tên Sticker',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloSticker'],
                operation: ['getStickers'],
            },
        },
        default: '',
        description: 'Tên hoặc từ khóa để lấy sticker (để trống để lấy tất cả)',
    },
    {
        displayName: 'Sticker ID',
        name: 'stickerId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloSticker'],
                operation: ['getStickerDetail'],
            },
        },
        default: '',
        description: 'ID của sticker cần lấy thông tin chi tiết',
    },
    {
        displayName: 'Từ Khóa Tìm Kiếm',
        name: 'query',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloSticker'],
                operation: ['searchStickers'],
            },
        },
        default: '',
        description: 'Từ khóa để tìm kiếm sticker',
    },
];
//# sourceMappingURL=ZaloStickerDescription.js.map