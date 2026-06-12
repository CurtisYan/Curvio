# Curvio

Curvio is an open-source public-good community for recording donations, acts of kindness, and open work.

It is intentionally quiet. It is not a fundraising platform, not a payment product, and not a place for donation rankings. Curvio exists for a simpler reason: to help people keep a long-term record of good things they have done, supported, or built, without turning kindness into performance.

The first version focuses on three kinds of records:

- Donations to public-good projects or organizations.
- Acts of kindness that are not necessarily financial.
- Free and open-source projects with public-good value.

Curvio keeps the product boundary narrow by design. It does not provide private payment links, does not take commission, does not rank people by amount, and does not use likes or badges as the center of the experience. A small donation, a quiet volunteer action, or a maintained open-source tool can all be recorded with the same dignity.

## Why This Exists

Curvio began with a personal need: I wanted a place to record the small donations I made as a student. The amounts were not large, but the habit mattered.

Most public-good tools emphasize campaigns, urgency, and fundraising conversion. Those are useful in the right context, but Curvio is trying to hold a different space: a calm public archive where long-term goodwill can accumulate, be revisited, and gently encourage others to participate.

## Product Principles

- Recording first, social features second.
- Truthfulness first, metrics second.
- Long-term consistency first, short-term attention second.
- Privacy and user control are part of the product, not an afterthought.
- Open source is the default posture, so the community can inspect, improve, and reuse the work.

## What Curvio Supports

Curvio currently includes public profiles, public and private records, amount visibility controls, anonymous publishing, record images with public/private visibility, bilingual English and Chinese pages, a searchable public archive, and a curated entry page for official charity platforms.

The privacy model is deliberately modest: Curvio only collects the account, profile, record, follow, and display-preference data needed to run the community. It does not collect payment card data because it does not process donations.

## Stack

Curvio is built with Next.js, React, Supabase, Cloudflare R2, Cloudflare Turnstile, and OpenNext for Cloudflare deployment.

For local development:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Copy `.env.example` to `.env.local` and fill in the required Supabase, R2, Turnstile, and site URL values.

---

# Curvio 中文说明

Curvio 是一个开源公益记录社区，用来记录捐赠、善意行动和开放贡献。

它不是募捐平台，不提供个人收款入口，不抽成，也不做金额排行榜。它更像一个安静的公益档案：让每个人可以把长期发生的善意保存下来，而不是把善事变成一次性的展示。

Curvio 第一版主要支持三类记录：

- 捐赠记录：记录自己支持过的公益项目或机构。
- 善意行动：记录非金钱类的帮助、志愿服务、资源分享等。
- 开放贡献：记录免费、开源、有公共价值的项目。

我做 Curvio 的起点很简单：想记录学生时期那些并不大的捐赠。金额不大，但习惯很重要。我希望它能帮助更多人把善意安静、长期地保存下来，也让开源和公益之间产生一点真实的连接。

Curvio 的原则是克制、真实、长期主义。记录优先，社交其次；真实优先，数据其次；长期坚持优先，短期热度其次。

目前它支持公开个人主页、公开/私有记录、金额隐藏、匿名发布、记录图片公开/私有可见、中英文双语、公开档案搜索，以及官方公益平台入口。隐私上，Curvio 只收集运行账号、主页、记录和展示偏好所需的数据；因为不处理捐款，所以不会采集银行卡或支付扣款信息。

我认可并推荐该社区：[Linux Do](https://linux.do/)
