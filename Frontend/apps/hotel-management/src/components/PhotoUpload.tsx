import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { hotelApiService } from '../services/hotelApiService';

interface PhotoUploadProps {
  entityType: 'hotel' | 'room-type' | 'facility';
  entityId: string;
  imageType?: 'featured' | 'gallery';
  maxFiles?: number;
  existingImages?: string[];
  onUploadSuccess?: (images: string[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  entityType,
  entityId,
  imageType = 'gallery',
  maxFiles = 10,
  existingImages = [],
  onUploadSuccess,
  onUploadError
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }));
    
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - files.length,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(fileObj => {
        formData.append('images', fileObj.file);
      });
      
      if (imageType) {
        formData.append('image_type', imageType);
      }

      let uploadedImages: string[] = [];
      
      switch (entityType) {
        case 'hotel':
          const hotelResult = await hotelApiService.uploadHotelImages(entityId, formData);
          uploadedImages = hotelResult.uploaded_files.map((f: any) => f.url);
          break;
        case 'room-type':
          const roomTypeResult = await hotelApiService.uploadRoomTypeImages(entityId, formData);
          uploadedImages = roomTypeResult.uploaded_files.map((f: any) => f.url);
          break;
        case 'facility':
          const facilityResult = await hotelApiService.uploadFacilityImages(entityId, formData);
          uploadedImages = facilityResult.uploaded_files.map((f: any) => f.url);
          break;
      }
      
      setFiles([]);
      onUploadSuccess?.(uploadedImages);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const deleteExistingImage = async (imageUrl: string) => {
    try {
      await hotelApiService.deleteImage({
        entity_type: entityType === 'room-type' ? 'room_type' : entityType,
        entity_id: entityId,
        image_url: imageUrl
      });
      
      const updatedImages = existingImages.filter(img => img !== imageUrl);
      onUploadSuccess?.(updatedImages);
    } catch (error: any) {
      onUploadError?.(error.response?.data?.message || 'Failed to delete image');
    }
  };

  return (
    <div className="photo-upload">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="existing-images mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => deleteExistingImage(imageUrl)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the images here...</p>
            ) : (
              <div>
                <p>Drag & drop images here, or click to select</p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to 10MB (max {maxFiles} files)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Files */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((fileObj, index) => (
              <div key={index} className="relative">
                <img
                  src={fileObj.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="text-xs text-white bg-black bg-opacity-50 px-1 py-0.5 rounded truncate">
                    {fileObj.file.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
            </button>
            <button
              onClick={() => setFiles([])}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};