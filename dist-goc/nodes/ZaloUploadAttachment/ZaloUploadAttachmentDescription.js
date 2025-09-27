"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloUploadAttachmentDescription = void 0;
exports.ZaloUploadAttachmentDescription = {
    displayName: 'Zalo Upload Attachment',
    name: 'zaloUploadAttachment',
    icon: 'file:../shared/zalo.svg',
    group: ['Zalo'],
    version: 1,
    description: 'Upload attachment (ảnh, video, file) lên Zalo sử dụng kết nối đăng nhập bằng cookie',
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
            description: 'ID của thread để upload attachment (User ID hoặc Group ID)',
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
            description: 'Loại của thread (user hoặc group)',
        },
        {
            displayName: 'Attachment Source',
            name: 'attachmentSource',
            type: 'options',
            options: [
                {
                    name: 'File Path',
                    value: 'filePath',
                    description: 'Đường dẫn file trên server n8n',
                },
                {
                    name: 'URL',
                    value: 'url',
                    description: 'URL công khai của file',
                },
                {
                    name: 'Binary Data',
                    value: 'binary',
                    description: 'Binary data từ n8n workflow',
                },
            ],
            default: 'filePath',
            description: 'Nguồn của attachment',
        },
        {
            displayName: 'File Path',
            name: 'filePath',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    attachmentSource: ['filePath'],
                },
            },
            description: 'Đường dẫn tuyệt đối đến file trên server n8n',
            placeholder: '/path/to/your/file.jpg',
        },
        {
            displayName: 'File URL',
            name: 'fileUrl',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    attachmentSource: ['url'],
                },
            },
            description: 'URL công khai của file cần upload',
            placeholder: 'https://example.com/image.jpg',
        },
        {
            displayName: 'Binary Property',
            name: 'binaryProperty',
            type: 'string',
            default: 'data',
            displayOptions: {
                show: {
                    attachmentSource: ['binary'],
                },
            },
            description: 'Tên của binary property chứa file data',
        },
        {
            displayName: 'Filename',
            name: 'filename',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    attachmentSource: ['binary'],
                },
            },
            description: 'Tên file với extension (ví dụ: image.jpg, document.pdf)',
            placeholder: 'image.jpg',
        },
        {
            displayName: 'Multiple Files',
            name: 'multipleFiles',
            type: 'boolean',
            default: false,
            description: 'Upload nhiều file cùng lúc',
        },
        {
            displayName: 'File Paths (Multiple)',
            name: 'filePaths',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    attachmentSource: ['filePath'],
                    multipleFiles: [true],
                },
            },
            description: 'Danh sách đường dẫn file cách nhau bởi dấu phẩy hoặc xuống dòng',
            placeholder: '/path/to/file1.jpg\n/path/to/file2.pdf\n/path/to/file3.mp4',
        },
        {
            displayName: 'File URLs (Multiple)',
            name: 'fileUrls',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    attachmentSource: ['url'],
                    multipleFiles: [true],
                },
            },
            description: 'Danh sách URL file cách nhau bởi dấu phẩy hoặc xuống dòng',
            placeholder: 'https://example.com/file1.jpg\nhttps://example.com/file2.pdf',
        },
        {
            displayName: 'Binary Properties (Multiple)',
            name: 'binaryProperties',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    attachmentSource: ['binary'],
                    multipleFiles: [true],
                },
            },
            description: 'Tên các binary properties cách nhau bởi dấu phẩy',
            placeholder: 'data1,data2,data3',
        },
        {
            displayName: 'Filenames (Multiple)',
            name: 'filenames',
            type: 'string',
            default: '',
            displayOptions: {
                show: {
                    attachmentSource: ['binary'],
                    multipleFiles: [true],
                },
            },
            description: 'Tên các file với extension cách nhau bởi dấu phẩy',
            placeholder: 'file1.jpg,file2.pdf,file3.mp4',
        },
    ],
};
//# sourceMappingURL=ZaloUploadAttachmentDescription.js.map