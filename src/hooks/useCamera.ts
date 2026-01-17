import { useState, useRef } from 'react';

interface CameraImage {
  file: File;
  preview: string;
  name: string;
  size: number;
}

export function useCamera(maxImages: number = 10) {
  const [images, setImages] = useState<CameraImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ta bild med kamera
  const capturePhoto = async (): Promise<void> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Kamera stöds inte av din enhet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Be om kamera-åtkomst
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Bakre kamera på mobiler
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Skapa video element för att ta bild
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Vänta på att video laddar
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Skapa canvas för att ta bild
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Konvertera till blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            const preview = URL.createObjectURL(file);
            
            if (images.length < maxImages) {
              setImages(prev => [...prev, {
                file,
                preview,
                name: file.name,
                size: file.size
              }]);
            } else {
              setError(`Max ${maxImages} bilder tillåtna`);
            }
          }
          
          // Stäng kamera-stream
          stream.getTracks().forEach(track => track.stop());
          setLoading(false);
        }, 'image/jpeg', 0.9);
      }
    } catch (err) {
      setLoading(false);
      let errorMessage = 'Kunde inte ta bild';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Du måste tillåta kameraåtkomst för att ta bilder';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Ingen kamera hittades på enheten';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Kamera stöds inte av din browser';
        }
      }
      
      setError(errorMessage);
    }
  };

  // Välj bilder från galleri
  const selectFromGallery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setError(null);
    const newImages: CameraImage[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        if (images.length + newImages.length < maxImages) {
          const preview = URL.createObjectURL(file);
          newImages.push({
            file,
            preview,
            name: file.name,
            size: file.size
          });
        }
      }
    });

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    } else if (images.length >= maxImages) {
      setError(`Max ${maxImages} bilder tillåtna`);
    }
  };

  // Ta bort bild
  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    URL.revokeObjectURL(imageToRemove.preview); // Frigör minne
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Rensa alla bilder
  const clearImages = () => {
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
    setError(null);
  };

  // Öppna kamera
  const openCamera = () => {
    capturePhoto();
  };

  // Öppna galleri
  const openGallery = () => {
    fileInputRef.current?.click();
  };

  // Konvertera till format som backend förväntar sig
  const getImagesForUpload = (): string[] => {
    return images.map(img => img.preview);
  };

  return {
    images,
    loading,
    error,
    fileInputRef,
    capturePhoto,
    selectFromGallery,
    removeImage,
    clearImages,
    openCamera,
    openGallery,
    getImagesForUpload
  };
}
