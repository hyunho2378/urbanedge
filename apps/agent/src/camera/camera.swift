// camera.swift: macOS AVFoundation 카메라 목록과 1컷 촬영. 사용: camera list | camera capture <out.jpg> [deviceIndex]
import AVFoundation
import Foundation

func devices() -> [AVCaptureDevice] {
    let types: [AVCaptureDevice.DeviceType] = [.builtInWideAngleCamera, .external, .continuityCamera, .deskViewCamera]
    return AVCaptureDevice.DiscoverySession(deviceTypes: types, mediaType: .video, position: .unspecified).devices
}

func fail(_ code: String, _ msg: String) -> Never {
    FileHandle.standardError.write(Data("{\"ok\":false,\"error\":\"\(code)\",\"message\":\"\(msg)\"}\n".utf8))
    exit(2)
}

let args = CommandLine.arguments
guard args.count >= 2 else { fail("usage", "list | capture out.jpg [index]") }

if args[1] == "list" {
    let list = devices().enumerated().map { "{\"index\":\($0.offset),\"name\":\"\($0.element.localizedName)\",\"id\":\"\($0.element.uniqueID)\"}" }
    let status = AVCaptureDevice.authorizationStatus(for: .video).rawValue
    print("{\"ok\":true,\"authorization\":\(status),\"devices\":[\(list.joined(separator: ","))]}")
    exit(0)
}

final class Grabber: NSObject, AVCapturePhotoCaptureDelegate {
    let out: String
    let sem = DispatchSemaphore(value: 0)
    var err: String? = nil
    init(_ o: String) { out = o }
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let e = error { err = e.localizedDescription; sem.signal(); return }
        guard let data = photo.fileDataRepresentation() else { err = "no data"; sem.signal(); return }
        do { try data.write(to: URL(fileURLWithPath: out)) } catch { err = error.localizedDescription }
        sem.signal()
    }
}

if args[1] == "capture", args.count >= 3 {
    let out = args[2]
    let idx = args.count >= 4 ? Int(args[3]) ?? 0 : 0
    let st = AVCaptureDevice.authorizationStatus(for: .video)
    if st == .notDetermined {
        let s = DispatchSemaphore(value: 0)
        AVCaptureDevice.requestAccess(for: .video) { _ in s.signal() }
        _ = s.wait(timeout: .now() + 20)
    }
    let st2 = AVCaptureDevice.authorizationStatus(for: .video)
    if st2 != .authorized { fail("camera_permission", "camera authorization status \(st2.rawValue) (0 notDetermined, 1 restricted, 2 denied)") }
    let devs = devices()
    guard idx < devs.count else { fail("no_device", "no camera at index \(idx); found \(devs.count)") }
    let session = AVCaptureSession()
    session.sessionPreset = .photo
    guard let input = try? AVCaptureDeviceInput(device: devs[idx]), session.canAddInput(input) else { fail("input", "cannot open device") }
    session.addInput(input)
    let photoOut = AVCapturePhotoOutput()
    guard session.canAddOutput(photoOut) else { fail("output", "cannot add output") }
    session.addOutput(photoOut)
    session.startRunning()
    Thread.sleep(forTimeInterval: 1.5) // 노출 안정화
    let g = Grabber(out)
    photoOut.capturePhoto(with: AVCapturePhotoSettings(), delegate: g)
    if g.sem.wait(timeout: .now() + 10) == .timedOut { fail("timeout", "capture timed out") }
    session.stopRunning()
    if let e = g.err { fail("capture", e) }
    print("{\"ok\":true,\"file\":\"\(out)\",\"device\":\"\(devs[idx].localizedName)\"}")
    exit(0)
}
fail("usage", "unknown command")
