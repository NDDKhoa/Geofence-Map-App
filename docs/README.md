# Docs Index (runtime-first)

Mục tiêu của thư mục `docs/` là phản ánh **đúng trạng thái hiện tại**. Khi có mâu thuẫn, ưu tiên:

1. **`SYSTEM_CURRENT_STATE.md`** — tóm tắt các stage đã làm, client (`admin-web`, `web`, MAUI), và việc còn lại.
2. **`../README.md`** (root) — bố cục monorepo và chạy nhanh từng phần.

## 1) Runtime Contract (ưu tiên cao)

- [SYSTEM_CURRENT_STATE.md](SYSTEM_CURRENT_STATE.md) — handoff cho AI/dev và team.
- [00-system-overview.md](00-system-overview.md) — backend Node: layers, env, client surfaces.
- [05-admin-flow.md](05-admin-flow.md) — moderation + audit (Stage 4–5).
- [07-api-reference.md](07-api-reference.md) — catalog endpoint; login trả `{ success, data }`.
- [12-testing-guide.md](12-testing-guide.md) — `backend/tests/`, Jest + Supertest.

## 2) Chủ đề cốt lõi

- [01-architecture.md](01-architecture.md) … [04-owner-flow.md](04-owner-flow.md), [06-poi-lifecycle.md](06-poi-lifecycle.md)
- [02-auth-rbac.md](02-auth-rbac.md), [03-subscription.md](03-subscription.md)
- [08-error-model.md](08-error-model.md), [09-data-model.md](09-data-model.md), [10-business-rules.md](10-business-rules.md)
- [11-security-model.md](11-security-model.md), [13-developer-playbook.md](13-developer-playbook.md)

## 3) QR / Map / Planning (tham khảo)

- [QR_INTEGRATED_DOCUMENT.md](QR_INTEGRATED_DOCUMENT.md), [architecture.md](architecture.md), [known-issues.md](known-issues.md)
- [07_refactor_plan.md](07_refactor_plan.md), [PHASE6_PLAN.md](PHASE6_PLAN.md), [PRD_Culinary_Tourism_MVP.md](PRD_Culinary_Tourism_MVP.md)

---

*Các tài liệu QR nhỏ đã gom trong `QR_INTEGRATED_DOCUMENT.md` nếu có.*
