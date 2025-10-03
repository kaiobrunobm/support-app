import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import Modal from './Modal';
import Button from './Button';
import RangeInput from './RangeInput';
import { getCroppedImg } from '../lib/cropImage';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: Point) => setCrop(location), []);
  const onZoomChange = useCallback((zoomValue: number) => setZoom(zoomValue), []);
  const onCropFullComplete = useCallback((_croppedArea: Area, croppedAreaPixelsValue: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const handleSaveCrop = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedImageBlob);
        onClose(); // This will now correctly just close the modal
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Foto de Perfil">
      <div className="relative h-96 w-full bg-background">
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropFullComplete}
          />
        )}
      </div>
      <div className="mt-4 flex flex-col items-center">
        <RangeInput
          label="Zoom"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={handleSaveCrop}>Salvar Foto</Button>
      </div>
    </Modal>
  );
};

export default ImageCropper;
