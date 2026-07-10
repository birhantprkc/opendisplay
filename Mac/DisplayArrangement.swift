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
    /// One record per device — the latest arrangement wins regardless of
    /// orientation, so the display follows wherever the user last put it
    /// (tested per-orientation spots and flipping back to an orientation's
    /// old position reads as broken; deliberate split positions are a
    /// possible opt-in, see #128).
    static func save(origin: CGPoint, size: CGSize, device: String) {
        UserDefaults.standard.set([Int(origin.x), Int(origin.y), Int(size.width), Int(size.height)],
                                  forKey: key(device))
    }

    /// Where a new display of `size` points should go: the saved spot —
    /// verbatim when the size matches, else mapped to keep the display's
    /// center (WindowServer then snaps that to the nearest valid adjacent
    /// arrangement, so a rotated display stays on the same side of the
    /// desktop). Nil on first contact — let macOS choose.
    static func origin(for size: CGSize, device: String) -> CGPoint? {
        guard let v = UserDefaults.standard.array(forKey: key(device)) as? [Int],
              v.count == 4 else { return nil }
        let saved = CGRect(x: CGFloat(v[0]), y: CGFloat(v[1]),
                           width: CGFloat(v[2]), height: CGFloat(v[3]))
        if saved.size == size { return saved.origin }
        return CGPoint(x: saved.midX - size.width / 2, y: saved.midY - size.height / 2)
    }

    private static func key(_ device: String) -> String { "displayOrigin.\(device)" }
}
