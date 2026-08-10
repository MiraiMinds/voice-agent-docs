# Mirai Voice — Postman collection (public v2 API)

Outbound AI voice calls for India. This collection covers the whole surface:
agents, single calls, campaigns, the do-not-call list, the wallet, and webhooks.

| File | What it is |
| --- | --- |
| `mirai-voice-sandbox.postman_collection.json` | The collection — 7 folders, 37 requests, 67 saved example responses. |
| `sandbox.postman_environment.json` | The environment — base URL, your key, your test number. |

## Import

1. Postman → **Import** → drop in **both** JSON files.
2. Top right, select the **Mirai Voice — Sandbox** environment.
3. Open the environment and fill in:
   - **`api_key`** — your `sk_live_…` secret key. Marked *secret*, so it is never written back into the file you share.
   - **`test_phone`** — a number **you own**, E.164 with the country code: `+919876543210`. The quickstart rings it for real.
   - `webhook_endpoint` / `webhook_secret` — only if you want to test your webhook receiver (see the **Webhooks** folder).
4. Open **0-Quickstart** and run the nine requests top to bottom.

Each quickstart step saves the id the next one needs — `{{agent_id}}`,
`{{call_id}}`, `{{campaign_id}}` — so there is nothing to copy and paste. You
finish with an agent, one completed call, a wallet you can reconcile, and a
five-contact campaign that has run and reported.

### Where your key comes from

Secret keys are issued per workspace by your account contact —
[help@miraiminds.co](mailto:help@miraiminds.co). A key looks like
`sk_live_` followed by 32 hex characters, and it is shown **once**, at issue
time; we store only a hash and cannot recover it for you. Lost it? Ask for a new
one and revoke the old.

Issued alongside it is your webhook signing secret, `whsec_…`. That one belongs
to the **workspace**, not to the key: rotating an API key does not change it, so
your receiver keeps verifying without an outage.

Authentication is one header on every request, set once at the collection level:

```
Authorization: Bearer sk_live_…
```

> A trailing newline from `cat`-ing a key file is the most common cause of a
> `401`. Paste the key, do not pipe it.

## Limits

Per secret key, unless your account contact has provisioned you differently:

| Limit | Default | Over the limit |
| --- | --- | --- |
| Request rate | 10 requests/second, burst 20 | `429 rate_limited`, `Retry-After: 1` |
| Concurrent live calls | 5 | Nothing fails — extra calls wait in `queued` |
| Queue depth (accepted, not yet ended) | 500 | `429 rate_limited`, `Retry-After: 30` |
| Contacts per campaign request | 1000 | `400 invalid_request` |
| Page size | 20 default, 100 maximum | Clamped |
| `system_prompt` / `first_message` | 8,000 / 500 characters | `400 invalid_request` |
| `voice.voice_id` | `ashu` (default) or `aishe` — the whole catalogue | `400 invalid_request` |
| `variables` | 32 keys, 512 characters per value | `400 invalid_request` |
| `max_duration_secs` | 30–1800, default 300 | `400 invalid_request` |
| `Idempotency-Key` | 255 characters, remembered 24 hours | — |

Concurrency is a **pacer, not a gate**. A `POST /v2/calls` beyond your
concurrency ceiling is still accepted with `202` and sits in `queued` until a
slot frees. Only the request rate and the queue depth actually reject — and both
answer `429 rate_limited`, so the correct client behaviour is identical: honour
`Retry-After` and back off. `error.message` names which ceiling you hit:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "queue depth limit reached for this workspace (500 calls accepted and not yet ended, limit 500); wait for calls to drain or ask ops to raise it"
  }
}
```

Higher ceilings are a provisioning change, not a code change. If a campaign
needs to submit more than 500 outstanding calls, ask **before** the campaign.

## Money

Calls and the wallet are quoted in **rupees**: `balance_inr`, `cost_inr`,
`amount_inr`. Campaign budgets and campaign spend are integer **paise**:
`budget_paise`, `spent_paise`, where **100 paise = ₹1**. So a ₹500 campaign cap
is `"budget_paise": 50000`. Nothing mixes the two units inside one object.

Billing is per minute, rounded up, one-minute minimum. Tier `t1` is ₹1/minute
(100 paise). One minute is held from the wallet when a call is accepted and
reconciled when it ends; calls that never connect release the hold in full and
report `cost_inr: null`.

## Campaigns not switched on yet?

```json
{
  "error": {
    "code": "campaigns_unavailable",
    "message": "campaigns are not enabled on this deployment (no campaign database is configured)"
  }
}
```

A `503 campaigns_unavailable` on any `/v2/campaigns` or `/v2/dnc` request means
campaigns have not been provisioned for your workspace yet. It is not a mistake
in your request and retrying will not clear it — ask your account contact to
enable them. Everything else in this collection keeps working meanwhile.

## Notes for the road

- **Always send `Idempotency-Key` on `POST /v2/calls`.** A timeout tells you
  nothing about whether the phone rang. With the key, a retry replays the
  original response (`Idempotent-Replay: true`) and places no second call.
- **Webhooks over polling.** Pass `webhook_url` and verify the
  `X-Mirai-Signature` header against the **raw** body. The Webhooks folder has
  the scheme, verification snippets in two languages, and a request that fires a
  correctly signed test delivery at your own endpoint — no wallet balance
  required.
- **`{{customer_name}}` inside a prompt is not a Postman variable.** Those are
  agent placeholders, filled by the platform from each call's `variables`.
  Postman leaves an undefined `{{…}}` untouched, so they arrive intact — just do
  not create a Postman variable with the same name.
- **Foreign ids answer `404`, never `403`.** An id belonging to another
  workspace is indistinguishable from one that never existed. `403` means one
  thing only: your key was revoked.
- **Calling rules are yours.** The API will dial at 02:00 if you ask it to. The
  09:00–21:00 IST window, consent records, national DND scrubbing and telling
  people they are speaking to an AI are obligations of the business placing the
  calls. The `/v2/dnc` list is your own suppression list, not a national
  registry.

## Full documentation

**[docs.miraiminds.co](https://docs.miraiminds.co)** — object reference, status
and `ended_reason` vocabularies, webhook payloads, tiers and billing.

Questions, higher limits, or a campaigns enablement:
[help@miraiminds.co](mailto:help@miraiminds.co).
