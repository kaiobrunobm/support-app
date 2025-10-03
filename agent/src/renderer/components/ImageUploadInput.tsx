import React, { useState, useRef } from 'react';
import { PencilSimpleIcon, UserIcon } from '@phosphor-icons/react';
import ImageCropper from './ImageCroper'
import * as apiService from '../api/apiService';
import { toast } from 'sonner';

interface ImageUploadInputProps {
  initialAvatarUrl?: string | null;
  onUploadComplete: (newAvatarUrl: string) => void;
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ initialAvatarUrl, onUploadComplete }) => {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', croppedImageBlob, 'avatar.jpg'); 
      
      const response = await apiService.uploadImage(formData);
      const newAvatarUrl = response.data.data.url;

      setCurrentAvatar(newAvatarUrl);
      onUploadComplete(newAvatarUrl); 
      toast.success('Foto de perfil atualizada!');
    } catch (err) {
      toast.error('Falha no upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg"
        />
        {currentAvatar ? (
          <img src={currentAvatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <UserIcon size={64} className="text-secondaryText" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 rounded-full bg-background p-2 sadow-md transition-all duration-150 ease-in hover:bg-border"
        >
          <PencilSimpleIcon size={20} weight='fill' />
        </button>
      </div>
      
      <ImageCropper
        isOpen={!!imageToCrop}
        onClose={() => setImageToCrop(null)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default ImageUploadInput;
