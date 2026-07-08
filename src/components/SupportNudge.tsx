// Full-width Ko-fi nudge bar that jumps to #support. Rendered once, above the
// download area, and pinned under the sticky nav as you scroll (position:
// sticky). It lives inside <div class="nudge-scope"> in App — that box ends
// where #support begins, so the bar stops sticking once the real support
// section is reached. Inner content is wrap-constrained: blurb left, CTA right.
export default function SupportNudge() {
  return (
    <a className="support-nudge" href="#support">
      <span className="support-nudge-inner wrap">
        <span className="kofi-banner-left">
          <img className="kofi-mark" src="kofi-mark.webp" alt="" width="24" height="24" />
          <span className="kofi-banner-text">Free, and built by one person.</span>
        </span>
        <span className="kofi-banner-cta">
          Support me<span className="kofi-banner-arrow">↓</span>
        </span>
      </span>
    </a>
  )
}
