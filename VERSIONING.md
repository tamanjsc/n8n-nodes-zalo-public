# 📋 QUY ĐỊNH VERSIONING - n8n-nodes-zalo-public

## 🎯 Nguyên tắc chung

Theo rules đã định, versioning phải tuân thủ quy tắc sau:

### 📊 Cấu trúc Version
```
MAJOR.MINOR.PATCH
```

### 🔢 Quy tắc Versioning

#### 1. **0.0.1 - 0.0.99** (Patch Level)
- **Mục đích**: Sửa lỗi nhỏ, cải thiện performance
- **Ví dụ**: 0.0.1, 0.0.2, ..., 0.0.99
- **Thay đổi**: 
  - Bug fixes
  - Performance improvements
  - Documentation updates
  - Code refactoring (không thay đổi API)

#### 2. **0.1.1 - 0.1.99** (Minor Level)
- **Mục đích**: Thêm tính năng mới, không breaking changes
- **Ví dụ**: 0.1.1, 0.1.2, ..., 0.1.99
- **Thay đổi**:
  - New features
  - New nodes
  - API enhancements
  - New configuration options

#### 3. **0.2.1 - 0.2.99** (Major Level)
- **Mục đích**: Thay đổi lớn, có thể có breaking changes nhỏ
- **Ví dụ**: 0.2.1, 0.2.2, ..., 0.2.99
- **Thay đổi**:
  - Major feature additions
  - API restructuring
  - Breaking changes (có migration guide)
  - Dependencies updates

#### 4. **1.0.0+** (Stable Level)
- **Mục đích**: Phiên bản ổn định, thay đổi hoàn toàn
- **Ví dụ**: 1.0.0, 1.0.1, 1.1.0, 1.2.0, 2.0.0, 2.1.0, 3.0.0, v.v.
- **Thay đổi**:
  - Complete rewrite
  - Major breaking changes
  - New architecture
  - Platform migration
  - **Không giới hạn**: Có thể lên đến 1.x.x, 2.x.x, 3.x.x, v.v.

## 📝 Quy trình Versioning

### 1. **Trước khi tăng version**
- [ ] Kiểm tra zca-js source mới nhất
- [ ] Test toàn bộ features
- [ ] Cập nhật documentation
- [ ] Tạo changelog chi tiết

### 2. **Khi tăng version**
- [ ] Cập nhật `package.json`
- [ ] Cập nhật `README.md`
- [ ] Tạo git tag
- [ ] Publish npmjs
- [ ] Publish GitHub release

### 3. **Sau khi publish**
- [ ] Backup version hiện tại
- [ ] Test trên production
- [ ] Monitor feedback
- [ ] Cập nhật CHANGELOG.md

## 🔄 Migration Guide

### Từ 0.6.x → 0.7.x (Planned)
- Cập nhật zca-js lên version mới nhất
- Cải thiện error handling
- Thêm logging chi tiết hơn

### Từ 0.x.x → 1.0.0 (Future)
- Major architecture changes
- Complete rewrite nếu cần
- Breaking changes với migration guide

### Breaking Changes Policy
- **Minor versions**: Không có breaking changes
- **Major versions**: Có thể có breaking changes với migration guide
- **Stable versions**: Breaking changes với full migration support

## 📊 Version History

| Version | Type | Date | Changes | Status |
| 0.0.7 | Patch | 2025-09-27 | Automated publish | ✅ Active |
| 0.0.6 | Patch | 2025-09-27 | Automated publish | ✅ Active |
| 0.0.5 | Patch | 2025-09-27 | Automated publish | ✅ Active |
| 0.0.4 | Patch | 2025-09-27 | Automated publish | ✅ Active |
| 0.0.3 | Patch | 2025-09-27 | Automated publish | ✅ Active |
| 0.0.2 | Patch | 2025-09-27 | Automated publish | ✅ Active |
|---------|------|------|---------|--------|
| 0.6.9 | Current | 2025-01-16 | Initial public release, cleanup | ✅ Active |
| 0.6.10 | Patch | Planned | Bug fixes, improvements | ⏳ Planned |
| 0.7.0 | Minor | Planned | New features, zca-js update | ⏳ Planned |
| 1.0.0 | Major | Planned | Major architecture changes | ⏳ Planned |

## 🎯 Current Status

**Current Version**: 0.6.9
**Next Planned**: 0.6.10 (Patch update)
**Target**: Cập nhật theo zca-js mới nhất
**Versioning**: Mở rộng không giới hạn (0.x.x, 1.x.x, 2.x.x, v.v.)

## 📋 Checklist cho mỗi release

### Pre-release
- [ ] Code review
- [ ] Test all features
- [ ] Update dependencies
- [ ] Check zca-js compatibility
- [ ] Update documentation

### Release
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Create git tag
- [ ] Publish to npm
- [ ] Create GitHub release

### Post-release
- [ ] Backup current version
- [ ] Monitor for issues
- [ ] Update documentation
- [ ] Notify users (if major)

## 🚨 Emergency Procedures

### Rollback Process
1. Revert to previous stable version
2. Update package.json
3. Publish emergency fix
4. Notify users
5. Investigate issue

### Hotfix Process
1. Create hotfix branch
2. Fix critical issue
3. Test thoroughly
4. Publish patch version
5. Merge to main

---
*Last updated: 2025-01-16*
*Maintainer: Hayashi Itsuki*
