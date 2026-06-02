# Supabase Email Templates

This document records the Supabase Auth email templates used by Curvio.

## Shared Notes

- Language is selected by `{{ if eq .Data.lang "zh" }}`.
- Chinese templates use `Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif`.
- English templates use `Arial, sans-serif`.
- Brand color: `#49695f`.
- Main text color: `#1f2522`.
- Muted text color: `#68706b`.
- Soft panel background: `#f4f3ef`.

## Confirm Sign Up

Supabase template: Confirm sign up

Subject:

```gotemplate
{{ if eq .Data.lang "zh" }}Curvio 验证码：{{ .Token }}{{ else }}Curvio verification code: {{ .Token }}{{ end }}
```

Body:

```html
{{ if eq .Data.lang "zh" }}
<div style="font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #1f2522;">
  <h2 style="margin: 0 0 12px; color: #49695f;">验证你的 Curvio 邮箱</h2>
  <p style="font-size: 15px; line-height: 1.8;">欢迎来到 <strong>Curvio</strong>。</p>
  <p style="font-size: 15px; line-height: 1.8;">Curvio 是一个安静的公益档案，用来记录捐赠、善意行动和开源贡献。这里不做募捐、不做排行榜、不鼓励攀比，只帮助长期发生的善意被诚实保存。</p>
  <p style="font-size: 15px; margin-top: 28px;">你的验证码：</p>
  <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 18px 0; padding: 18px; text-align: center; background: #f4f3ef; border: 1px solid #ddd9cf; border-radius: 12px;">
    {{ .Token }}
  </div>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7;">验证码将在几分钟后失效。如果不是你本人操作，请忽略此邮件。</p>
</div>
{{ else }}
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #1f2522;">
  <h2 style="margin: 0 0 12px; color: #49695f;">Verify your Curvio email</h2>
  <p style="font-size: 15px; line-height: 1.8;">Welcome to <strong>Curvio</strong>.</p>
  <p style="font-size: 15px; line-height: 1.8;">Curvio is a quiet public-welfare archive for recording donations, acts of kindness, and open-source contributions. No fundraising, no leaderboards, no comparison; just an honest place for long-term goodwill.</p>
  <p style="font-size: 15px; margin-top: 28px;">Your verification code:</p>
  <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 18px 0; padding: 18px; text-align: center; background: #f4f3ef; border: 1px solid #ddd9cf; border-radius: 12px;">
    {{ .Token }}
  </div>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7;">This code expires in a few minutes. If you did not request this email, you can safely ignore it.</p>
</div>
{{ end }}
```

## Reset Password

Supabase template: Reset password

Subject:

```gotemplate
{{ if eq .Data.lang "zh" }}重置你的 Curvio 密码{{ else }}Reset your Curvio password{{ end }}
```

Body:

```html
{{ if eq .Data.lang "zh" }}
<div style="font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #1f2522;">
  <h2 style="margin: 0 0 12px; color: #49695f;">重置你的 Curvio 密码</h2>
  <p style="font-size: 15px; line-height: 1.8;">我们收到了为 <strong>Curvio</strong> 重置密码的请求。</p>
  <p style="font-size: 15px; line-height: 1.8;">如果这是你本人操作，请点击下面的按钮继续设置新密码。</p>
  <div style="margin: 28px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #49695f; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-size: 15px; font-weight: 700;">重置密码</a>
  </div>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7;">如果按钮无法点击，也可以复制下面的链接到浏览器中打开：</p>
  <p style="font-size: 14px; line-height: 1.7; word-break: break-all; color: #49695f;">{{ .ConfirmationURL }}</p>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7; margin-top: 24px;">如果不是你本人操作，可以忽略此邮件，密码不会被修改。</p>
</div>
{{ else }}
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #1f2522;">
  <h2 style="margin: 0 0 12px; color: #49695f;">Reset your Curvio password</h2>
  <p style="font-size: 15px; line-height: 1.8;">We received a request to reset the password for your <strong>Curvio</strong> account.</p>
  <p style="font-size: 15px; line-height: 1.8;">If this was you, click the button below to choose a new password.</p>
  <div style="margin: 28px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #49695f; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-size: 15px; font-weight: 700;">Reset password</a>
  </div>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7;">If the button does not work, copy and paste this link into your browser:</p>
  <p style="font-size: 14px; line-height: 1.7; word-break: break-all; color: #49695f;">{{ .ConfirmationURL }}</p>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7; margin-top: 24px;">If you didn’t request this, you can ignore this email and your password will remain unchanged.</p>
</div>
{{ end }}
```

## Password Changed

Supabase template: Password changed

Subject:

```gotemplate
{{ if eq .Data.lang "zh" }}你的 Curvio 密码已更新{{ else }}Your Curvio password was changed{{ end }}
```

Body:

```html
{{ if eq .Data.lang "zh" }}
<div style="font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #1f2522;">
  <h2 style="margin: 0 0 12px; color: #49695f;">你的 Curvio 密码已更新</h2>
  <p style="font-size: 15px; line-height: 1.8;">你的 <strong>Curvio</strong> 账号密码刚刚被修改。</p>
  <p style="font-size: 15px; line-height: 1.8;">如果这是你本人操作，无需进行任何处理。</p>
  <p style="font-size: 15px; line-height: 1.8;">如果你没有修改密码，请立即发起密码重置，并检查账号是否存在异常登录或未经授权的操作。</p>
  <div style="margin: 28px 0;">
    <a href="{{ .SiteURL }}/zh/forgot" style="display: inline-block; background: #49695f; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-size: 15px; font-weight: 700;">发起密码重置</a>
  </div>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7;">如果按钮无法点击，也可以复制下面的链接到浏览器中打开：</p>
  <p style="font-size: 14px; line-height: 1.7; word-break: break-all; color: #49695f;">{{ .SiteURL }}/zh/forgot</p>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7; margin-top: 24px;">这是一封安全通知邮件，用于帮助你确认账号的重要变更。</p>
</div>
{{ else }}
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #1f2522;">
  <h2 style="margin: 0 0 12px; color: #49695f;">Your Curvio password was changed</h2>
  <p style="font-size: 15px; line-height: 1.8;">The password for your <strong>Curvio</strong> account was just changed.</p>
  <p style="font-size: 15px; line-height: 1.8;">If this was you, no further action is needed.</p>
  <p style="font-size: 15px; line-height: 1.8;">If you did not change your password, start a password reset immediately and review your account for unusual sign-ins or unauthorized activity.</p>
  <div style="margin: 28px 0;">
    <a href="{{ .SiteURL }}/en/forgot" style="display: inline-block; background: #49695f; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-size: 15px; font-weight: 700;">Start password reset</a>
  </div>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7;">If the button does not work, copy and paste this link into your browser:</p>
  <p style="font-size: 14px; line-height: 1.7; word-break: break-all; color: #49695f;">{{ .SiteURL }}/en/forgot</p>
  <p style="font-size: 14px; color: #68706b; line-height: 1.7; margin-top: 24px;">This security notification helps you confirm important account changes.</p>
</div>
{{ end }}
```
