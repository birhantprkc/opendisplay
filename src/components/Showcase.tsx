import { useEffect, useRef, useState } from "react"

// The demo section's media strip: the YouTube demo plus posts from people
// using OpenDisplay in the wild. To showcase something new, add an entry to
// ITEMS below — for a tweet, grab the blockquote from
// https://publish.x.com/oembed?url=<tweet-url> so the fallback text matches.
type ShowcaseItem =
  | { kind: "youtube"; id: string; title: string }
  | { kind: "tweet"; url: string; html: string }

const ITEMS: ShowcaseItem[] = [
  {
    kind: "youtube",
    id: "wyEUkMgH3zw",
    title: "OpenDisplay demo — use your iPad as a second monitor for your Mac",
  },
  // The <img> inside each blockquote is a self-hosted copy of the tweet's
  // photo (public/showcase/): ad blockers commonly block widgets.js, and the
  // styled blockquote + local photo is what those visitors get instead.
  {
    kind: "tweet",
    url: "https://x.com/eduwass/status/2071902710597583300",
    html: `<blockquote class="twitter-tweet" data-dnt="true" data-conversation="none"><p lang="en" dir="ltr"><a href="https://x.com/peetzweg?ref_src=twsrc%5Etfw">@peetzweg</a> here&#39;s the setup I&#39;ve been testing OpenSidecar on 😅 <br>- LG Ultrawide<br>- Macbook Pro M1 (built-in screen)<br>- iPad Pro 12.9 x3<br>working like a champ <a href="https://t.co/Fqy0fwHHrm">pic.twitter.com/Fqy0fwHHrm</a></p><img src="showcase/tweet-eduwass.jpg" alt="Desk with an LG ultrawide, a MacBook Pro and three iPad Pros all running as displays" loading="lazy" width="1200" height="675">&mdash; Edu Wass (@eduwass) <a href="https://x.com/eduwass/status/2071902710597583300?ref_src=twsrc%5Etfw">June 30, 2026</a></blockquote>`,
  },
  {
    kind: "tweet",
    url: "https://x.com/peetzweg/status/2074416821738815692",
    html: `<blockquote class="twitter-tweet" data-dnt="true"><p lang="en" dir="ltr">How the magic is happening today. Obviously using OpenDisplay for my Mactendo DS™ setup. <a href="https://t.co/6FEzG9APF8">pic.twitter.com/6FEzG9APF8</a></p><img src="showcase/tweet-peetzweg.jpg" alt="MacBook with an iPhone perched above its screen as a second display — the Mactendo DS setup" loading="lazy" width="1200" height="900">&mdash; peetzweg/ (@peetzweg) <a href="https://x.com/peetzweg/status/2074416821738815692?ref_src=twsrc%5Etfw">July 7, 2026</a></blockquote>`,
  },
]

const WIDGETS_SRC = "https://platform.twitter.com/widgets.js"

declare global {
  interface Window {
    twttr?: { widgets: { load: (el?: HTMLElement | null) => void } }
  }
}

export default function Showcase() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  // Upgrade the prerendered blockquotes into full tweet embeds (with media).
  // The blockquotes stay as the crawlable fallback — and the visible state
  // for visitors whose ad blocker eats widgets.js. Polling instead of a
  // script onload listener sidesteps every already-loading race (HMR,
  // remounts, a second copy of the script).
  useEffect(() => {
    const tryLoad = () => {
      if (!window.twttr?.widgets) return false
      window.twttr.widgets.load(trackRef.current)
      return true
    }
    if (tryLoad()) return
    if (!document.querySelector(`script[src="${WIDGETS_SRC}"]`)) {
      const script = document.createElement("script")
      script.src = WIDGETS_SRC
      script.async = true
      document.head.appendChild(script)
    }
    const timer = window.setInterval(() => {
      if (tryLoad()) window.clearInterval(timer)
    }, 250)
    // Blocked script → twttr never appears; stop polling after a while.
    const giveUp = window.setTimeout(() => window.clearInterval(timer), 15000)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(giveUp)
    }
  }, [])

  // Keep the arrows honest: disable the one pointing at an edge we're on.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const sync = () => {
      setCanPrev(el.scrollLeft > 8)
      setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
    }
    sync()
    el.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", sync)
    return () => {
      el.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
    }
  }, [])

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" })
  }

  return (
    <div className="showcase">
      <div className="showcase-track" ref={trackRef}>
        {ITEMS.map((item) =>
          item.kind === "youtube" ? (
            <div key={item.id} className="showcase-item is-video">
              <div className="video-embed">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${item.id}`}
                  title={item.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div
              key={item.url}
              className="showcase-item is-tweet"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          )
        )}
      </div>
      <div className="showcase-nav">
        <button type="button" aria-label="Scroll back" disabled={!canPrev} onClick={() => nudge(-1)}>
          ←
        </button>
        <button type="button" aria-label="Scroll forward" disabled={!canNext} onClick={() => nudge(1)}>
          →
        </button>
      </div>
    </div>
  )
}
