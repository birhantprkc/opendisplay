import CoreGraphics
import Foundation

/// Remembers where the user placed each device's virtual display (#116).
///
/// macOS does persist display arrangement, but keys it on the monitor
/// identity (vendor/product/serial) — and ours legitimately changes: each
/// orientation uses a distinct serial (saved-mode separation, see
/// setupExtend), and the serial also derives from the session id, so USB
/// and WiFi produce different identities for the same iPad. Every such
/// change makes macOS treat the display as a brand-new monitor and park it
/// at the default position. Keying saved origins on the device's install id
/// makes the arrangement follow the physical device instead.
enum DisplayArrangement {

    /// Record the origin (global desktop points) the display settled at.
    static func save(origin: CGPoint, size: CGSize, device: String) {
        UserDefaults.standard.set([Int(origin.x), Int(origin.y), Int(size.width), Int(size.height)],
                                  forKey: key(device, size))
    }

    /// Where a new display of `size` points should go: the exact spot this
    /// orientation was last at, else the other orientation's spot mapped to
    /// keep the display's center (WindowServer then snaps that to the
    /// nearest valid adjacent arrangement, so the display stays on the same
    /// side of the desktop). Nil on first contact — let macOS choose.
    static func origin(for size: CGSize, device: String) -> CGPoint? {
        if let v = load(key(device, size)) {
            return CGPoint(x: v[0], y: v[1])
        }
        let flipped = CGSize(width: size.height, height: size.width)
        if let v = load(key(device, flipped)) {
            let saved = CGRect(x: CGFloat(v[0]), y: CGFloat(v[1]),
                               width: CGFloat(v[2]), height: CGFloat(v[3]))
            return CGPoint(x: saved.midX - size.width / 2, y: saved.midY - size.height / 2)
        }
        return nil
    }

    private static func key(_ device: String, _ size: CGSize) -> String {
        "displayOrigin.\(device).\(size.width >= size.height ? "landscape" : "portrait")"
    }

    private static func load(_ key: String) -> [Int]? {
        guard let v = UserDefaults.standard.array(forKey: key) as? [Int], v.count == 4 else { return nil }
        return v
    }
}
