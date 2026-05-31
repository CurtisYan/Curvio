# Curvio Schema Notes (中文字段注释)

本文档是 Curvio 当前 Supabase 业务结构的中文注释版说明，便于产品、前端、后端共同理解字段含义与数据边界。

## 使用规则

- 任何 Supabase 结构变更（新增/删除/重命名表、字段、约束、函数、触发器、索引）都必须在同一次 PR/提交中同步更新本文档。
- 本文档是“面向团队阅读”的 schema 注释，不替代迁移 SQL（`supabase/migrations/*.sql`）。

## 1. profiles（用户档案）

用途：保存用户公开主页信息、展示偏好和隐私开关。

字段：

- `id`：用户 ID，主键，外键到 `auth.users(id)`。
- `username`：唯一用户名（公开 URL 标识）。
- `display_name`：展示名称。
- `avatar_url`：头像 URL（当前头像文件实际存储在 R2）。
- `bio`：个人简介。
- `location`：地理位置文本。
- `principle`：个人理念。
- `website_url`：个人网站。
- `github_url`：GitHub 链接。
- `blog_url`：博客链接。
- `preferred_language`：偏好语言（`en` / `zh`）。
- `is_public`：是否公开主页。
- `allow_follow`：是否允许被关注。
- `show_annual_summary`：是否展示年度总结。
- `hide_amounts_by_default`：默认隐藏金额。
- `created_at` / `updated_at`：创建/更新时间。

关键约束：

- `username` 仅允许字母、数字、下划线（内部统一转小写存储）。
- `username` 长度限制为 4-20。
- `display_name` 长度限制为 2-40。

## 2. follows（关注关系）

用途：保存用户间关注关系。

字段：

- `id`：关注关系 ID。
- `follower_id`：关注发起者（谁关注）。
- `following_id`：被关注者（关注谁）。
- `created_at`：关注时间。

关键约束：

- `follows_no_self_follow`：禁止自关注。
- `follows_unique_pair`：同一对用户只能有一条关注关系。

## 3. records（公益记录主表）

用途：保存捐赠、善事、开源等记录内容。

字段：

- `id`：记录 ID。
- `user_id`：所属用户 ID。
- `type`：记录类型（`donation` / `kindness` / `open_source`）。
- `title`：标题。
- `organization_name`：机构名（可选）。
- `platform_name`：平台名（可选）。
- `project_url`：项目或来源链接（可选）。
- `amount`：金额（可选）。
- `currency`：币种（可选）。
- `show_amount`：是否显示金额。
- `content`：正文描述。
- `reflection`：补充反思（可选）。
- `date`：发生日期。
- `tags`：标签数组。
- `language`：内容语言（`en` / `zh`）。
- `is_public`：是否公开。
- `is_anonymous`：是否匿名发布。
- `public_record_id`：公开记录 ID（格式：`YYYYMMDD-{uuid}`）。
- `created_at` / `updated_at`：创建/更新时间。

相关机制：

- `public_record_id` 有唯一索引。
- 通过触发器 `records_set_public_record_id` + 函数 `set_record_public_id()` 在插入/日期更新时自动生成或更新。

## 4. record_images（记录图片）

用途：保存记录关联图片元数据（文件存储在 R2）。

字段：

- `id`：图片记录 ID。
- `record_id`：所属记录 ID。
- `user_id`：所属用户 ID。
- `r2_key`：R2 对象键。
- `r2_url`：可访问 URL。
- `mime_type`：文件 MIME 类型。
- `file_size`：文件大小（字节）。
- `sort_order`：图片排序。
- `is_cover`：是否封面图。
- `created_at`：创建时间。

## 5. profile_sections（主页栏目配置）

用途：控制公开主页中各栏目显示与顺序。

字段：

- `id`：配置 ID。
- `user_id`：所属用户 ID。
- `section_type`：栏目类型（donations/kindness/open_source/annual_summary/about/timeline/favorite_platforms）。
- `sort_order`：排序值。
- `is_visible`：是否显示。
- `created_at` / `updated_at`：创建/更新时间。

## 6. open_source_projects（开源项目）

用途：保存用户开源项目资料。

字段：

- `id`：项目 ID。
- `user_id`：所属用户 ID。
- `name`：项目名。
- `description`：项目描述。
- `repo_url`：仓库地址。
- `demo_url`：演示地址（可选）。
- `screenshot_url`：截图地址（可选）。
- `license`：许可证（可选）。
- `tech_stack`：技术栈数组。
- `status`：状态（Planning/Building/Active/Maintained/Paused/Archived）。
- `is_free`：是否免费。
- `is_open_source`：是否开源。
- `is_public`：是否公开。
- `language`：语言（`en` / `zh`）。
- `tags`：标签数组。
- `created_at` / `updated_at`：创建/更新时间。

## 7. donation_platforms（公益平台目录）

用途：维护官方公益平台目录信息（站点内容数据，不是用户隐私数据）。

字段：

- `id`：平台 ID。
- `name`：平台名。
- `description`：描述。
- `official_url`：官方链接。
- `official_url_zh`：中文官方链接（可选）。
- `region`：地区（可选）。
- `languages`：支持语言数组。
- `category`：分类（可选）。
- `is_verified`：是否已验证。
- `created_at` / `updated_at`：创建/更新时间。

## 8. deletion_requests（删除请求）

用途：记录用户发起的数据删除/账号清理请求，形成可追踪处理流程。

字段：

- `id`：删除请求 ID。
- `user_id`：请求发起用户。
- `request_content`：按模板提交的请求正文。
- `status`：处理状态（`pending` / `processing` / `completed` / `rejected`）。
- `processed_note`：处理备注（可选）。
- `created_at` / `updated_at`：创建/更新时间。
- `processed_at`：处理完成时间（可选）。

权限策略（RLS）：

- 用户只能提交自己的删除请求。
- 用户只能读取自己的删除请求。

## 9. 当前已使用 RPC

### `get_profile_with_follow_status(viewer_uuid uuid, username_text text)`

用途：一次调用返回目标用户公开档案 + 当前访问者是否关注该用户（`is_following`）。

返回列：

- `id`
- `username`
- `display_name`
- `avatar_url`
- `bio`
- `principle`
- `location`
- `website_url`
- `github_url`
- `allow_follow`
- `is_public`
- `is_following`

## 数据收集边界（摘要）

Curvio 当前收集的是“账号 + 公开档案 + 公益记录 + 关注关系 + 展示偏好”这类产品运行必需信息。默认不收集支付信息、身份证件、生物特征等高敏数据。

建议：

- 对 `location`、`website_url`、`github_url`、`blog_url`、`bio`、`principle` 保持可选，避免强制采集。
- 对金额相关字段坚持“默认隐藏”。
- 在隐私页面清晰说明：收集目的、公开范围、删除流程。
