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
window.SKLZ_SHOWCASE_TOKEN = "";
