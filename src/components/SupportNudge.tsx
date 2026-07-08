// Repeatable Ko-fi nudge that scrolls to #support. Lives as its own borderless
// section so it brings its own breathing room rather than being crammed into a
// neighbouring section's flow. Drop <SupportNudge /> between any two sections.
export default function SupportNudge() {
  return (
    <section className="support-nudge">
      <div className="wrap">
        <a className="kofi-banner" href="#support">
          <span className="kofi-banner-left">
            <img className="kofi-mark" src="kofi-mark.webp" alt="" width="24" height="24" />
            <span className="kofi-banner-text">Free, and built by one person.</span>
          </span>
          <span className="kofi-banner-cta">
            Support me<span className="kofi-banner-arrow">↓</span>
          </span>
        </a>
      </div>
    </section>
  )
}
