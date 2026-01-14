import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, ImagePlus, X } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
      setCameraStarted(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("카메라 접근이 거부되었습니다. 갤러리에서 사진을 선택하거나 브라우저 설정에서 카메라 권한을 허용해주세요.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCapturedBlob(blob);
              setCapturedImage(URL.createObjectURL(blob));
              stopCamera();
              setShowConfirmSheet(true);
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  }, [stopCamera]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      stopCamera();
      setCapturedBlob(file);
      setCapturedImage(URL.createObjectURL(file));
      setShowConfirmSheet(true);
    }
  }, [stopCamera]);

  const openGallery = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setError(null);
    setShowConfirmSheet(false);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  }, [capturedBlob, onCapture]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  // Hidden file input for gallery selection
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFileSelect}
      className="hidden"
    />
  );

  if (error && !capturedImage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
        {fileInput}
        <div className="text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4 inline-block">
            <Camera className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">카메라 접근 오류</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Button variant="hero" onClick={openGallery}>
              <ImagePlus className="mr-2 h-5 w-5" />
              갤러리에서 선택
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {fileInput}
      
      {/* Top Banner */}
      <div className="px-4 pt-8 pb-4 z-10">
        <div className="bg-primary rounded-xl px-6 py-4 text-center">
          <p className="text-primary-foreground font-medium">사진을 촬영해 주세요.</p>
          <p className="text-primary-foreground/80 text-sm">장루가 화면 중앙에 오도록 맞춰 주세요!</p>
        </div>
      </div>

      {/* Camera/Image Area */}
      <div className="flex-1 relative overflow-hidden mx-4 mb-4">
        <div className="bg-gray-800 rounded-2xl overflow-hidden h-full flex flex-col">
          {/* Camera Header */}
          <div className="bg-gray-700 py-3 text-center">
            <span className="text-white font-medium">카메라</span>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />

            {/* Circular Guide Overlay */}
            {!capturedImage && cameraStarted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 border-4 border-primary rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-14 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Controls (when not showing confirm sheet) */}
      {!showConfirmSheet && (
        <div className="bg-black p-6 pb-8 safe-area-inset-bottom">
          <div className="flex items-center justify-center gap-6">
            {/* Gallery button */}
            <button
              onClick={openGallery}
              className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
            >
              <ImagePlus className="h-6 w-6 text-white" />
            </button>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full border-4 border-primary" />
            </button>

            {/* Spacer for balance */}
            <div className="w-14 h-14" />
          </div>
        </div>
      )}

      {/* Confirm Sheet Modal */}
      {showConfirmSheet && (
        <div className="bg-background rounded-t-3xl px-6 pt-4 pb-8 safe-area-inset-bottom">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-foreground mb-2">이 사진으로 예측할까요?</h2>
            <p className="text-muted-foreground text-sm">사진이 흐리면 결과가 부정확할 수 있습니다</p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full h-14 text-base font-semibold rounded-xl"
              onClick={confirmPhoto}
            >
              분석 하기
            </Button>
            <Button 
              variant="outline"
              className="w-full h-14 text-base font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary/5"
              onClick={retakePhoto}
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              다시 찍기
            </Button>
            <button 
              className="w-full py-3 text-muted-foreground text-sm underline"
              onClick={handleCancel}
            >
              다음에 할래요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
