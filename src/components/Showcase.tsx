import { useEffect, useRef, useState } from "react"

// The demo section's media strip: the YouTube demo plus posts from people
// using OpenDisplay in the wild. Posts render as self-contained static cards
// (photos + avatars live in public/showcase/) instead of live X embeds —
// widgets.js renders unreliably under ad blockers and browser privacy
// features, and a third-party tracking script sits badly on a page that
// advertises "no telemetry" anyway. To showcase a new post, add an entry to
// ITEMS and drop its media into public/showcase/.
type ShowcaseItem =
  | { kind: "youtube"; id: string; title: string }
  | {
      kind: "post"
      url: string
      author: string
      handle: string
      avatar: string
      date: string
      text: string[] // paragraphs/lines of the post, verbatim
      translation?: string[] // English gloss, shown muted under non-English posts
      image: { src: string; alt: string; width: number; height: number }
    }

const ITEMS: ShowcaseItem[] = [
  {
    kind: "youtube",
    id: "wyEUkMgH3zw",
    title: "OpenDisplay demo — use your iPad as a second monitor for your Mac",
  },
  {
    kind: "post",
    url: "https://x.com/christophby/status/2075158401894547702",
    author: "Christoph Byza",
    handle: "@christophby",
    avatar: "showcase/avatar-christophby.jpg",
    date: "Jul 9, 2026",
    text: [
      "Using OpenDisplay to turn my iPad into a second monitor.",
      "Honestly: 100x better than Apple Sidecar.",
      "Amazing work @peetzweg 👏",
      "- touch + portrait support",
      "- works with different Apple IDs",
    ],
    image: {
      src: "showcase/tweet-christophby.jpg",
      alt: "A developer desk with an ultrawide monitor and an iPad in portrait on a stand serving as a second display, showing a mobile app preview",
      width: 900,
      height: 1200,
    },
  },
  {
    kind: "post",
    url: "https://x.com/eduwass/status/2071902710597583300",
    author: "Edu Wass",
    handle: "@eduwass",
    avatar: "showcase/avatar-eduwass.jpg",
    date: "Jun 30, 2026",
    text: [
      "@peetzweg here's the setup I've been testing OpenSidecar on 😅",
      "- LG Ultrawide",
      "- Macbook Pro M1 (built-in screen)",
      "- iPad Pro 12.9 x3",
      "working like a champ",
    ],
    image: {
      src: "showcase/tweet-eduwass.jpg",
      alt: "Desk with an LG ultrawide, a MacBook Pro and three iPad Pros all running as displays",
      width: 1200,
      height: 675,
    },
  },
  {
    kind: "post",
    url: "https://x.com/peetzweg/status/2074416821738815692",
    author: "peetzweg/",
    handle: "@peetzweg",
    avatar: "showcase/avatar-peetzweg.jpg",
    date: "Jul 7, 2026",
    text: ["How the magic is happening today. Obviously using OpenDisplay for my Mactendo DS™ setup."],
    image: {
      src: "showcase/tweet-peetzweg.jpg",
      alt: "MacBook with an iPhone perched above its screen as a second display — the Mactendo DS setup",
      width: 1200,
      height: 900,
    },
  },
  {
    kind: "post",
    url: "https://x.com/Vincent_AINotes/status/2074137525669753178",
    author: "Vincent",
    handle: "@Vincent_AINotes",
    avatar: "showcase/avatar-vincent.jpg",
    date: "Jul 6, 2026",
    text: [
      "家里吃灰的 iPhone 或 iPad，居然还能给 Mac 当副屏。",
      "OpenDisplay 装好后，Mac 会把它认成一块正经显示器，窗口能直接拖过去。插线能用，Wi-Fi 也能连，触控、双指滚动、横竖屏切换都有。",
      "免费开源，也没有订阅。地址放下一条👇",
    ],
    translation: [
      "The iPhone or iPad gathering dust at home can actually be a second screen for your Mac.",
      "Once OpenDisplay is set up, the Mac sees it as a real monitor — just drag windows over. Works wired or over Wi-Fi, with touch, two-finger scroll, and portrait/landscape switching.",
      "Free, open source, no subscription. Link in the next post 👇",
    ],
    image: {
      src: "showcase/tweet-vincent.jpg",
      alt: "An iPad running OpenDisplay beside a Mac mini, the app's device panel open showing Extend and Mirror options",
      width: 900,
      height: 1200,
    },
  },
  {
    kind: "post",
    url: "https://x.com/ZIRIXdesign/status/2074053036591518069",
    author: "ZIRIX",
    handle: "@ZIRIXdesign",
    avatar: "showcase/avatar-zirix.jpg",
    date: "Jul 6, 2026",
    text: [
      "OpenDisplay这款软件确实很不错，可以将iphone作为mac的显示器来用，有些不支持随航的旧款iPad也可以使用，而且底层原理和系统自带的随航体验一样流畅，实测只要在同一局域网下没有距离限制，而且支持横竖屏自动切换，非常推荐！",
    ],
    translation: [
      "OpenDisplay is genuinely great — you can use an iPhone as a Mac display, and even older iPads that don't support Sidecar work. It feels as smooth as Apple's built-in Sidecar; in my testing there's no distance limit as long as you're on the same LAN, and it auto-switches between portrait and landscape. Highly recommended!",
    ],
    image: {
      src: "showcase/tweet-zirix.jpg",
      alt: "An iPhone in landscape acting as a Mac display, sitting beside a Mac mini and a HomePod mini",
      width: 900,
      height: 1200,
    },
  },
  {
    kind: "post",
    url: "https://x.com/kocpc/status/2074352423377031242",
    author: "電腦王阿達",
    handle: "@kocpc",
    avatar: "showcase/avatar-kocpc.jpg",
    date: "Jul 7, 2026",
    text: [
      "OpenDisplay 把 iPhone、iPad 變成 Mac 第二螢幕。",
      "免費開源、可走有線或同 WiFi，臨時多一塊延伸螢幕很實用。",
    ],
    translation: [
      "OpenDisplay turns an iPhone or iPad into a second screen for your Mac.",
      "Free and open source, over a cable or the same Wi-Fi — a handy extra display in a pinch.",
    ],
    image: {
      src: "showcase/tweet-kocpc.jpg",
      alt: "Editorial graphic of an iPhone showing macOS as a second screen, captioned 'iPhone 變 Mac 第二螢幕'",
      width: 1200,
      height: 675,
    },
  },
]

// X logomark, shown in the card corner as the "view on X" affordance.
function XLogo() {
  return (
    <svg className="post-x" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function Showcase() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

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
            <a key={item.url} className="showcase-item is-post" href={item.url}>
              <div className="post-head">
                <img className="post-avatar" src={item.avatar} alt="" width="48" height="48" loading="lazy" />
                <div className="post-who">
                  <span className="post-author">{item.author}</span>
                  <span className="post-handle">{item.handle}</span>
                </div>
                <XLogo />
              </div>
              {item.text.map((line) => (
                <p key={line} className="post-text">{line}</p>
              ))}
              {item.translation?.map((line) => (
                <p key={line} className="post-trans" lang="en">{line}</p>
              ))}
              <img
                className="post-photo"
                src={item.image.src}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                loading="lazy"
              />
              <span className="post-date">{item.date} · View on X ↗</span>
            </a>
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
