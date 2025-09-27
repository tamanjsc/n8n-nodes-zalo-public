"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zaloUserFields = exports.zaloUserOperations = void 0;
exports.zaloUserOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
            },
        },
        options: [
            {
                name: 'Bỏ Chặn Người Dùng',
                value: 'unblockUser',
                action: 'Bỏ chặn người dùng.',
            },
            {
                name: 'Chặn Người Dùng',
                value: 'blockUser',
                action: 'Chặn người dùng.',
            },
            {
                name: 'Chấp Nhận Lời Mời Kết Bạn',
                value: 'acceptFriendRequest',
                action: 'Chấp nhận lời mời kết bạn.',
            },
            {
                name: 'Đánh Dấu Tin Nhắn Chưa Đọc',
                value: 'markMessageAsUnread',
                action: 'Đánh dấu tin nhắn chưa đọc.',
            },
            {
                name: 'Đánh Dấu Tin Nhắn Đã Đọc',
                value: 'markMessageAsRead',
                action: 'Đánh dấu tin nhắn đã đọc.',
            },
            {
                name: 'Đổi Tên Gợi Nhớ',
                value: 'changeAliasName',
                action: 'Đổi tên gợi nhớ.',
            },
            {
                name: 'Gửi Lời Mời Kết Bạn',
                value: 'sendFriendRequest',
                action: 'Gửi lời mời kết bạn.',
            },
            {
                name: 'Lấy Danh Sách Bạn Bè',
                value: 'getAllFriends',
                action: 'Lấy danh sách bạn bè.',
            },
            {
                name: 'Lấy Thông Tin Người Dùng',
                value: 'getUserInfo',
                action: 'Lấy thông tin người dùng.',
            },
            {
                name: 'Thay Đổi Cài Đặt Tài Khoản',
                value: 'changeAccountSetting',
                action: 'Thay đổi cài đặt tài khoản.',
            },
            {
                name: 'Thu Hồi Tin Nhắn',
                value: 'undoMessage',
                action: 'Thu hồi tin nhắn.',
            },
            {
                name: 'Tìm Kiếm Người Dùng',
                value: 'findUser',
                action: 'Tìm kiếm người dùng.',
            },
        ],
        default: 'getUserInfo',
    },
];
exports.zaloUserFields = [
    {
        displayName: 'Thread ID',
        name: 'threadId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['undoMessage'],
            },
        },
        default: '',
        description: 'ID của người dùng cần thu hồi tin nhắn',
    },
    {
        displayName: 'Thread ID',
        name: 'threadId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['markMessageAsRead', 'markMessageAsUnread'],
            },
        },
        default: '',
        description: 'ID của người dùng cần đánh dấu tin nhắn',
    },
    {
        displayName: 'Thread Type',
        name: 'threadType',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['markMessageAsRead', 'markMessageAsUnread'],
            },
        },
        default: '',
        description: 'Loại user',
    },
    {
        displayName: 'Thread Type',
        name: 'threadType',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['undoMessage'],
            },
        },
        default: '',
        description: 'Loại user',
    },
    {
        displayName: 'msgId',
        name: 'msgId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['undoMessage'],
            },
        },
        default: '',
        description: 'Message ID',
    },
    {
        displayName: 'cliMsgId',
        name: 'cliMsgId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['undoMessage'],
            },
        },
        default: '',
        description: 'Client message ID',
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['changeAliasName'],
            },
        },
        default: '',
        description: 'ID của người dùng cần đổi tên gợi nhớ',
    },
    {
        displayName: 'Alias Name',
        name: 'aliasName',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['changeAliasName'],
            },
        },
        default: '',
        description: 'Tên gợi nhớ mới',
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['acceptFriendRequest'],
            },
        },
        default: '',
        description: 'ID của người dùng cần chấp nhận lời mời kết bạn',
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['sendFriendRequest'],
            },
        },
        default: '',
        description: 'ID của người dùng cần gửi lời mời kết bạn',
    },
    {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['sendFriendRequest'],
            },
        },
        default: '',
        description: 'Tin nhắn kèm theo lời mời kết bạn',
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['blockUser'],
            },
        },
        default: '',
        description: 'ID của người dùng cần chặn',
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['unblockUser'],
            },
        },
        default: '',
        description: 'ID của người dùng cần bỏ chặn',
    },
    {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['changeAccountSetting'],
            },
        },
        default: '',
        description: 'Tên hiển thị',
    },
    {
        displayName: 'Date of Birth',
        name: 'dob',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['changeAccountSetting'],
            },
        },
        default: '',
        description: 'Ngày sinh (YYYY-MM-DD)',
    },
    {
        displayName: 'Gender',
        name: 'gender',
        type: 'options',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['changeAccountSetting'],
            },
        },
        options: [
            {
                name: 'Male',
                value: 1,
            },
            {
                name: 'Female',
                value: 2,
            },
            {
                name: 'Other',
                value: 3,
            },
        ],
        default: 1,
        description: 'Giới tính',
    },
    {
        displayName: 'Language',
        name: 'language',
        type: 'string',
        required: false,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['changeAccountSetting'],
            },
        },
        default: '',
        description: 'Ngôn ngữ (vi, en)',
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['getUserInfo'],
            },
        },
        default: '',
        description: 'ID của người dùng cần lấy thông tin',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['getAllFriends'],
            },
        },
        default: 50,
        description: 'Số lượng bạn bè tối đa cần lấy',
    },
    {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['findUser'],
            },
        },
        default: '',
        description: 'Số điện thoại cần tìm kiếm',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['zaloUser'],
                operation: ['findUser'],
            },
        },
        default: 50,
        description: 'Số lượng kết quả tối đa',
    },
];
//# sourceMappingURL=ZaloUserDescription.js.map