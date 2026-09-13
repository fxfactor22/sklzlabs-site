/* SKLZ demo — the public showcase link.
 *
 * Every demo surface normally opens from a prospect's own private link
 * (?t=…), minted with a short lifetime. The public site has no such link,
 * so its CTAs used to land on "this demo has ended" — which is the worst
 * possible first impression.
 *
 * This one value is the fallback: a long-lived demo token used ONLY when
 * the URL carries no private token of its own. A prospect's own link always
 * wins, so nothing about a real sales demo changes.
 *
 * Read this before changing it:
 *
 *   - It is PUBLIC. It ships in a file anyone can open. Treat it as a
 *     published address, never as a secret.
 *   - It is a CAPABILITY, not just a viewing key. It authorises the same
 *     endpoints a prospect link does: /control and /run-live place real
 *     orders on the MT5 broker DEMO account, and /ai-send posts to the
 *     demo Telegram channel. Anyone who opens the public site can trigger
 *     those. That is the deliberate trade — the live desk is the proof —
 *     but it is the reason this file exists on its own, with this note.
 *   - It is REVOCABLE and reversible in two independent ways: server-side
 *     with POST /api/demo-links/{token}/revoke, and client-side by setting
 *     the value below back to "". Emptying it restores the previous
 *     behaviour exactly: the public CTAs fall back to the sales bot.
 *   - Funds are virtual. The account behind it is a broker DEMO account;
 *     no real money is reachable through this token.
 *
 * Empty means "not configured" everywhere it is read.
 */
window.SKLZ_SHOWCASE_TOKEN = "db30d69c01d86a0cdeea14cda19a38ef";

/* Minted 2026-09-13 as purpose=showcase. It does NOT expire.
 *
 * The server stores it with expires_at = NULL and reports
 * seconds_remaining = null, so there is no countdown to run out and no
 * date to re-mint against. The previous value here was an ordinary
 * private demo clamped to 168 hours, which is why it had to be replaced
 * every week; that is over.
 *
 * What "showcase" changes on the server, and why this token is safe to
 * publish: a rolling budget of 6 market trades per hour instead of the
 * private 3-per-lifetime, AI Send refused outright so no visitor can post
 * arbitrary text to the channel, and no private commercial offer — the
 * 48-hour discount and its promo code are reserved for prospect links and
 * the server returns offer.eligible = false here.
 *
 * Only one showcase can be active at a time; revoking this one is what
 * frees the slot for a replacement. */
