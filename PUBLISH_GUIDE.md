# 🚀 HƯỚNG DẪN PUBLISH - n8n-nodes-zalo-public

Hướng dẫn chi tiết để publish lên npmjs và GitHub với hệ thống tự động hóa hoàn chỉnh.

## 📋 Tổng quan

Hệ thống publish đã được thiết lập hoàn chỉnh với:
- ✅ **Tự động hóa 100%** - Từ version bump đến publish
- ✅ **Đồng bộ npmjs & GitHub** - Publish cùng lúc cả hai platform
- ✅ **Tự động tạo GitHub Releases** - Không chỉ tags mà còn tạo releases đẹp
- ✅ **Dual Changelog System** - CHANGELOG.md (admin) + CHANGELOG_USER.md (user)
- ✅ **GitHub chỉ publish user changelog** - CHANGELOG.md không được push lên GitHub
- ✅ **Backup tự động** - Sao lưu source code trước khi obfuscate
- ✅ **Obfuscation** - Mã hóa code trước khi publish
- ✅ **Git integration** - Commit, tag, push tự động
- ✅ **Dry-run support** - Test trước khi publish thật

## 🔒 Quy tắc Publish

### 📝 Changelog System
- **CHANGELOG.md** - Chi tiết đầy đủ cho developers/admins (KHÔNG publish lên GitHub)
- **CHANGELOG_USER.md** - User-friendly cho end users (ĐƯỢC publish lên GitHub)
- **GitHub Releases** - Chỉ sử dụng nội dung từ CHANGELOG_USER.md

### 🚀 Auto Publish Process
1. **Generate user changelog** - Tự động tạo CHANGELOG_USER.md
2. **Update version** - Bump version trong package.json
3. **Publish to npm** - Upload package lên npmjs
4. **Push to GitHub** - Chỉ push CHANGELOG_USER.md (không push CHANGELOG.md)
5. **Create GitHub release** - Tạo release với user-friendly notes

## 🛠️ Cách sử dụng

### 1. 🚀 Auto Publish (Khuyến nghị)

```bash
# Auto publish patch version (0.0.1 → 0.0.2)
npm run publish:auto

# Auto publish minor version (0.0.1 → 0.1.0)
npm run publish:auto:minor

# Auto publish major version (0.0.1 → 1.0.0)
npm run publish:auto:major
```

### 2. 📦 Manual Publish

```bash
# Xem hướng dẫn đầy đủ
npm run publish:help

# Test trước khi publish (BẮT BUỘC)
npm run publish:dry

# Publish patch version (0.0.1 → 0.0.2)
npm run publish:patch

# Publish minor version (0.0.1 → 0.1.0)  
npm run publish:minor

# Publish major version (0.0.1 → 1.0.0)
npm run publish:major

# Obfuscate code only
npm run obfuscate

# Publish obfuscated version
npm run publish:obfuscated

# Restore source code for editing
npm run restore:source

# Backup source code
npm run backup:source

# Generate user changelog
npm run changelog:user
```

### 2. 🔒 Obfuscation Process

```bash
# Step 1: Publish obfuscated version (auto backup source)
npm run publish:obfuscated

# Step 2: Restore source for editing (if needed)
npm run restore:source

# Step 3: Edit code in dist/ directory
# ... make your changes ...

# Step 4: Publish again
npm run publish:obfuscated
```

### 3. 🐚 Manual Commands

```bash
# Test trước khi publish
node scripts/publish.js patch --dry-run

# Publish normal version
node scripts/publish.js minor

# Publish obfuscated version
node scripts/publish-obfuscated.js
```

## 📊 Version Types

| Type | Example | Mô tả | Khi nào dùng |
|------|---------|-------|--------------|
| `patch` | 0.6.9 → 0.6.10 | Sửa lỗi nhỏ | Bug fixes, docs |
| `minor` | 0.6.9 → 0.7.0 | Tính năng mới | New features |
| `major` | 0.6.9 → 1.0.0 | Breaking changes | Major updates |
| `X.Y.Z` | 0.6.9 → 0.7.1 | Version cụ thể | Hotfix, specific |

## 🔄 Quy trình Publish

### Bước 1: Chuẩn bị
```bash
# 1. Kiểm tra working directory clean
git status

# 2. Test trước khi publish (BẮT BUỘC)
npm run publish:dry

# 3. Nếu có uncommitted changes, commit hoặc stash
git add .
git commit -m "Your changes"
```

### Bước 2: Publish (Chọn 1 trong 2 cách)

#### Cách 1: Normal Publish (Source code visible)
```bash
npm run publish:patch    # Sửa lỗi
npm run publish:minor    # Tính năng mới
npm run publish:major    # Thay đổi lớn
```

#### Cách 2: Obfuscated Publish (RECOMMENDED)
```bash
# Publish obfuscated version (auto backup source)
npm run publish:obfuscated

# Nếu cần sửa code:
npm run restore:source
# ... edit code in dist/ ...
npm run publish:obfuscated
```

### Bước 3: Kiểm tra kết quả
```bash
# Kiểm tra npmjs
# https://www.npmjs.com/package/n8n-nodes-zalo-public

# Kiểm tra GitHub
# https://github.com/aiviethub/n8n-nodes-zalo-public/releases
```

## 📁 Files được tạo/cập nhật

### Tự động cập nhật
- `package.json` - Version number
- `CHANGELOG.md` - Release notes chi tiết
- `VERSIONING.md` - Version info và status

### Tự động tạo
- `dist-original/` - Source code gốc (chưa obfuscated)
- `backups/obfuscated-backup-*.tar.gz` - Backup obfuscated version
- `RELEASE_NOTES_vX.X.X.md` - Release notes cho GitHub
- Git commit với message chi tiết
- Git tag với release notes

## 🔒 Obfuscation Details

### Tại sao cần obfuscation?
- **Bảo vệ source code** - Ngăn chặn reverse engineering
- **Bảo mật API keys** - Ẩn credentials và sensitive data
- **Professional** - Giống các package thương mại khác
- **Compliance** - Tuân thủ quy định bảo mật

### Obfuscation Options
- **String Array Encoding** - Mã hóa strings
- **Identifier Renaming** - Đổi tên variables/functions
- **Control Flow** - Làm phức tạp logic flow
- **Dead Code Injection** - Thêm code giả
- **Safe for n8n** - Tương thích với n8n runtime

## ⚠️ Lưu ý quan trọng

### ✅ Trước khi publish
1. **Luôn test với dry-run trước**
2. **Commit tất cả changes** hoặc dùng `--force`
3. **Kiểm tra branch** (nên ở main)
4. **Backup source code** trước khi obfuscate
5. **Sử dụng obfuscated publish** cho production

### ✅ Sau khi publish
1. **Kiểm tra npmjs** - Đảm bảo package đã publish
2. **Kiểm tra GitHub** - Đảm bảo release đã tạo
3. **Monitor feedback** - Theo dõi phản hồi từ users
4. **Update docs** - Cập nhật tài liệu nếu cần

## 🚨 Troubleshooting

### Lỗi thường gặp

#### 1. "Working directory has uncommitted changes"
```bash
# Giải pháp 1: Commit changes
git add .
git commit -m "Your changes"

# Giải pháp 2: Stash changes
git stash

# Giải pháp 3: Force publish
node scripts/publish.js patch --force
```

#### 2. "Obfuscation failed"
```bash
# Kiểm tra dependencies
npm install javascript-obfuscator

# Kiểm tra source files
ls -la dist/

# Chạy obfuscation manually
node scripts/obfuscate.js
```

#### 3. "npm publish failed"
```bash
# Kiểm tra đăng nhập npm
npm whoami

# Đăng nhập npm
npm login

# Kiểm tra quyền publish
npm access list packages
```

#### 4. "GitHub push failed"
```bash
# Kiểm tra remote
git remote -v

# Cập nhật remote
git remote set-url origin https://github.com/aiviethub/n8n-nodes-zalo-public.git
```

## 📈 Monitoring & Maintenance

### Theo dõi sau publish
1. **NPM Downloads** - https://www.npmjs.com/package/n8n-nodes-zalo-public
2. **GitHub Stars** - https://github.com/aiviethub/n8n-nodes-zalo-public
3. **Issues & PRs** - https://github.com/aiviethub/n8n-nodes-zalo-public/issues
4. **User Feedback** - Theo dõi comments và reviews

### Backup & Recovery
- **Source code** được lưu trong `dist-original/` (luôn có sẵn)
- **Obfuscated backup** được tạo trong `backups/obfuscated-backup-*.tar.gz`
- **Restore source** với `npm run restore:source`
- **Git history** lưu trữ tất cả thay đổi
- **Release notes** được lưu trữ vĩnh viễn

## 🎯 Best Practices

### 1. Version Strategy
- **Patch**: Bug fixes, docs, minor improvements
- **Minor**: New features, enhancements
- **Major**: Breaking changes, major rewrites

### 2. Release Frequency
- **Patch**: Khi cần sửa lỗi khẩn cấp
- **Minor**: Mỗi 2-4 tuần cho features mới
- **Major**: Mỗi 3-6 tháng cho major updates

### 3. Quality Assurance
- **Luôn test dry-run trước**
- **Source code được tự động backup trong dist-original/**
- **Sử dụng obfuscated publish cho production**
- **Restore source để sửa code khi cần**
- **Review changes** trước khi publish
- **Monitor feedback** sau khi publish

## 🔗 Links & Resources

- **NPM Package**: https://www.npmjs.com/package/n8n-nodes-zalo-public
- **GitHub Repository**: https://github.com/aiviethub/n8n-nodes-zalo-public
- **Documentation**: ./README.md
- **Changelog**: ./CHANGELOG.md
- **Versioning Rules**: ./VERSIONING.md

## 📞 Support

- **Maintainer**: Hayashi Itsuki
- **Contact**: 0899.524.011
- **GitHub Issues**: https://github.com/aiviethub/n8n-nodes-zalo-public/issues
- **Email**: itsuki.hayashi@gmail.com

---

## 🎉 Kết luận

Hệ thống publish đã được thiết lập hoàn chỉnh với obfuscation và backup tự động. Bạn có thể:

1. **Sử dụng ngay** với `npm run publish:dry` để test
2. **Publish obfuscated** với `npm run publish:obfuscated` (RECOMMENDED)
3. **Restore source** với `npm run restore:source` để sửa code
4. **Theo dõi** kết quả trên npmjs và GitHub

**Chúc bạn publish thành công! 🚀**

---
*Tạo bởi AI Assistant - Hệ thống publish tự động hoàn chỉnh với obfuscation*
