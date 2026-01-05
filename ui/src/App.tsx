import { useState, useRef, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const cameraStartedRef = useRef(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1024, height: 1024 } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied or not available.');
    }
  };

  useEffect(() => {
    if (!cameraStartedRef.current) {
      cameraStartedRef.current = true;
      setTimeout(() => startCamera(), 0);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const video = videoRef.current;
        const { videoWidth, videoHeight } = video;
        const maxSize = 1024;
        const ratio = Math.min(maxSize / videoWidth, maxSize / videoHeight);
        const newWidth = videoWidth * ratio;
        const newHeight = videoHeight * ratio;
        canvas.width = newWidth;
        canvas.height = newHeight;
        console.log(canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, newWidth, newHeight);
        const pngData = canvas.toDataURL('image/png');
        const jpegData = canvas.toDataURL('image/jpeg', 1);
        const jpegData8 = canvas.toDataURL('image/jpeg', 0.8);
        const webpData = canvas.toDataURL('image/webp', 1);
        const webpData8 = canvas.toDataURL('image/webp', 0.8);

        setCaptured(jpegData);
        sendToAPI(pngData, '1.captured_image.png');
        sendToAPI(jpegData, '2.captured_image.jpg');
        sendToAPI(jpegData8, '3.captured_image_0.8.jpg');
        sendToAPI(webpData, '4.captured_image.webp');
        sendToAPI(webpData8, '5.captured_image_0.8.webp');
      }
    }
  };

  const sendToAPI = async (base64Data: string, name: string) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data, name: name }),
      });
      if (response.ok) {
        toast.success(`Image ${name} uploaded successfully!`);
      } else {
        toast.error('Failed to upload image: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    }
  };

  const retake = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCaptured(null);
    startCamera();
  };

  return (
    <div className="app">
      <h1>Camera App</h1>
      {!captured ? (
        <div className="camera-container">
          <div className="viewfinder">
            <video ref={videoRef} autoPlay playsInline muted className="video" />
          </div>
          <button onClick={capturePhoto} className="capture-btn">Capture</button>
        </div>
      ) : (
        <div className="captured-container">
          <img src={captured} alt="Captured" className="captured-image" />
          <div className="buttons">
            <button onClick={retake} className="retake-btn">Retake</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Toaster />
    </div>
  );
}

export default App;
