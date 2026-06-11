// Fake OpenSidecar receiver — speaks just enough of the wire protocol to
// stand in for a third device: sends hello + pings, consumes video frames,
// reports receive rate. For Mac-side scale testing only.
import Foundation
import Network

let port: UInt16 = 9000
let listener = try! NWListener(using: .tcp, on: NWEndpoint.Port(rawValue: port)!)

func frame(_ json: String) -> Data {
    let payload = Data(json.utf8)
    var header = UInt32(payload.count).bigEndian
    var d = Data(bytes: &header, count: 4)
    d.append(payload)
    return d
}

listener.newConnectionHandler = { conn in
    print("connection from \(conn.endpoint)")
    var frames = 0, bytes = 0
    var windowStart = Date()
    conn.start(queue: .global())
    // iPad Pro 12.9" panel: 2732x2048 @2x
    conn.send(content: frame("{\"type\":\"hello\",\"pixelsWide\":2732,\"pixelsHigh\":2048,\"scale\":2,\"device\":\"iPad\",\"id\":\"FAKE-3\"}"),
              completion: .contentProcessed { _ in })
    let timer = DispatchSource.makeTimerSource(queue: .global())
    timer.schedule(deadline: .now() + 1, repeating: 2)
    timer.setEventHandler {
        let t = Date().timeIntervalSince1970 * 1000
        conn.send(content: frame("{\"type\":\"ping\",\"t\":\(t)}"),
                  completion: .contentProcessed { _ in })
    }
    timer.resume()
    func readLoop() {
        conn.receive(minimumIncompleteLength: 4, maximumLength: 4) { data, _, _, err in
            guard let data, data.count == 4, err == nil else { print("closed"); timer.cancel(); return }
            let len = Int(UInt32(bigEndian: data.withUnsafeBytes { $0.loadUnaligned(as: UInt32.self) }))
            guard len > 0, len < 1 << 24 else { print("bad length \(len)"); timer.cancel(); return }
            conn.receive(minimumIncompleteLength: len, maximumLength: len) { payload, _, _, err in
                guard let payload, payload.count == len, err == nil else { print("closed"); timer.cancel(); return }
                frames += 1
                bytes += len
                let el = Date().timeIntervalSince(windowStart)
                if el >= 5 {
                    print(String(format: "recv %.0f frames/s  %.1f Mbit/s",
                                 Double(frames) / el, Double(bytes) * 8 / el / 1_000_000))
                    frames = 0; bytes = 0; windowStart = Date()
                }
                readLoop()
            }
        }
    }
    readLoop()
}
listener.start(queue: .global())
print("fake receiver listening on \(port)")
RunLoop.main.run()
