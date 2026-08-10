# WELCOME — send-to-partner template

Copy everything below the line into an email, fill the four `{{…}}` slots, and
attach the two Postman files from this folder. Thirty seconds.

**Before you send, check:**

- [ ] `{{API_KEY}}` pasted from the mint screen — it is shown **once**, and we
      store only a hash. If you did not capture it, mint a new one and revoke
      the old.
- [ ] `{{WEBHOOK_SECRET}}` (`whsec_…`) from the same screen. It belongs to the
      workspace, not the key.
- [ ] Wallet credited. A partner whose first call `402`s does not try a second.
- [ ] (Optional) Attach the two Postman files — or skip it: they are
      downloadable from the docs quickstart page directly.
- [ ] Send the key over a channel you would send a password over. Not the same
      message as everything else, if you can help it.

---

**Subject:** Your Mirai Voice API access — start here

Hi {{NAME}},

Your workspace is live. Everything you need to make your first call is below —
it takes about ten minutes end to end, and you do not need us for any of it.

**1. The docs — start here**

https://docs.miraiminds.co/v2/start-building

That page is the whole journey: check your key, create an agent, ring one real
phone, run a campaign, read the report. Every request is copy-paste. The rest of
the reference lives at https://docs.miraiminds.co.

**2. Your key**

Base URL: `https://sandbox.voice.miraiminds.co`

```
API key:        {{API_KEY}}
Webhook secret: {{WEBHOOK_SECRET}}
```

Send it as one header on every request:

```
Authorization: Bearer {{API_KEY}}
```

The API key is shown once and we store only a hash of it — put it in your secret
manager now. If it leaks, tell us and we will rotate it; rotation issues the
replacement before revoking the old one, so there is no outage. The webhook
secret belongs to the workspace, so rotating the API key does not change it.

Quick check that everything works:

```bash
curl https://sandbox.voice.miraiminds.co/v2/wallet \
  -H "Authorization: Bearer {{API_KEY}}"
```

A `401` here is almost always a trailing newline from `cat`-ing a key file.
Paste the key, do not pipe it.

**3. Postman (optional, faster for a team)**

Two files are attached:

- `mirai-voice-sandbox.postman_collection.json` — every endpoint, with worked
  example responses.
- `sandbox.postman_environment.json` — base URL, your key, your test number.

Import both, select the **Mirai Voice — Sandbox** environment, fill in `api_key`
and `test_phone` (a number you own, E.164 — it will actually ring), then run the
**0-Quickstart** folder top to bottom. Each step saves the id the next one
needs, so there is nothing to copy and paste.

**4. Pricing**

₹3 per minute — that is tier `t3`, what your key is issued at, and what
everything defaults to. Billing is per minute, rounded up, one-minute minimum,
and only calls that produced live media are billed: `completed`, `voicemail` and
`timeout`. Rang out, busy, failed and cancelled calls are free.

`t1` is available at ₹1/minute for simple high-volume transactional calls — pass
`"tier": "t1"` on the call or campaign. Its voice catalogue is two voices
(`ashu`, `aishe`) versus the full premium catalogue on `t3`.

**5. The three limits that will actually bite you**

| Limit | Your default | What happens past it |
| --- | --- | --- |
| Request rate | 10 requests/second (burst 20) | `429 rate_limited` — honour `Retry-After` |
| Concurrent live calls | 5 | Nothing fails; extra calls wait in `queued` |
| Queue depth | 500 accepted-and-not-yet-ended | `429 rate_limited`, `Retry-After: 30` |

Concurrency is a pacer, not a gate — only the request rate and the queue depth
actually reject. Higher ceilings are a provisioning change, not a code change:
ask us **before** a big campaign, not during it.

**6. Anything else**

help@miraiminds.co — send the `call_id` or `campaign_id` and we can see exactly
what happened on our side.

Welcome aboard.

{{YOUR_NAME}}
Mirai Minds
