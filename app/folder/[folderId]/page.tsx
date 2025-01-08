"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageViewer from 'react-simple-image-viewer';
import { FolderIcon, PencilIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function FolderDetail() {
  const router = useRouter();
  const { folderId } = useParams();

  const [folderName, setFolderName] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (folderId) {
      fetchFolderDetails();
      fetchImages();
    }
  }, [folderId]);

  const fetchFolderDetails = async () => {
    const { data, error } = await supabase.from('folders').select('*').eq('id', folderId).single();
    if (error) {
      console.error('Error fetching folder details:', error.message);
      return;
    }
    setFolderName(data.name);
  };

  const fetchImages = async () => {
    const { data, error } = await supabase.from('images').select('*').eq('folder_id', folderId);
    if (error) {
      console.error('Error fetching images:', error.message);
      return;
    }
    setImages(data || []);
  };

  const uploadImageToSupabase = async (file: File) => {
    try {
      setLoading(true);
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('images').upload(`folder_${folderId}/${fileName}`, file);
      if (error) throw error;

      const publicUrl = supabase.storage.from('images').getPublicUrl(`folder_${folderId}/${fileName}`).data.publicUrl;

      const { error: dbError } = await supabase.from('images').insert({
        folder_id: folderId,
        uri: publicUrl,
        uploaded_at: new Date(),
      });

      if (dbError) throw dbError;

      fetchImages();
    } catch (error: any) {
      console.error('Error uploading image:', error.message);
    } finally {
      setLoading(false);
    }
  };
  const deleteImage = async (imageId: string, imageUri: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
  
    try {
      setLoading(true);
  
      // Extract the file path from the URI
      const filePath = imageUri.split('/').slice(-2).join('/');
  
      // Delete the file from Supabase storage
      const { error: storageError } = await supabase.storage.from('images').remove([filePath]);
  
      if (storageError) {
        console.error('Error deleting file from storage:', storageError.message);
        return;
      }
  
      // Delete the image record from the database
      const { error: dbError } = await supabase.from('images').delete().eq('id', imageId);
  
      if (dbError) {
        console.error('Error deleting image from database:', dbError.message);
        return;
      }
  
      // Update the images state
      setImages((prevImages) => prevImages.filter((image) => image.id !== imageId));
    } catch (error: any) {
      console.error('Error deleting image:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRenameFolder = async () => {
    if (!newFolderName.trim()) return;
    const { error } = await supabase.from('folders').update({ name: newFolderName }).eq('id', folderId);
    if (error) {
      console.error('Error renaming folder:', error.message);
      return;
    }
    setFolderName(newFolderName);
    setNewFolderName('');
    setIsRenaming(false);
  };

  const deleteFolder = async () => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;
    try {
      setLoading(true);

      const { data } = await supabase.storage.from('images').list(`folder_${folderId}`);
      const files = data || [];
      if (files?.length > 0) {
        const filePaths = files.map((file) => `folder_${folderId}/${file.name}`);
        await supabase.storage.from('images').remove(filePaths);
      }

      await supabase.from('images').delete().eq('folder_id', folderId);
      await supabase.from('folders').delete().eq('id', folderId);

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error deleting folder:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FolderIcon className="h-8 w-8 text-blue-500" />
          {isRenaming ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="border-b border-gray-300 bg-transparent py-1 px-2 text-xl font-bold focus:border-blue-500 focus:outline-none"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder()}
                autoFocus
              />
              <button
                onClick={handleRenameFolder}
                className="text-blue-500 hover:text-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="text-gray-500 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h1 className="text-2xl font-bold">{folderName}</h1>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsRenaming(true)}
            className="flex items-center space-x-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            <PencilIcon className="h-5 w-5" />
            <span>Rename</span>
          </button>
          <button
            onClick={deleteFolder}
            className="flex items-center space-x-2 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            <TrashIcon className="h-5 w-5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {images.length > 0 ? (
    images.map((image, index) => (
      <div key={image.id} className="relative group">
        <img
          src={image.uri}
          alt={`Image ${index + 1}`}
          className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-300 transform group-hover:scale-105"
          
        />
        <div onClick={() => {
            setSelectedImageIndex(index);
            setIsViewerVisible(true);
          }} className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the image viewer
              deleteImage(image.id, image.uri);
            }}
            className="text-red-500 bg-white rounded-md px-3 py-1 text-sm shadow-lg hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-lg">No images found</p>
  )}
</div>


      <div className="mt-8">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex items-center justify-center space-x-2 rounded-md border-2 border-dashed border-gray-300 px-6 py-4 transition-colors hover:border-blue-500">
            <PlayIcon className="h-6 w-6 text-gray-400 cursor-pointer" />
            <span className="text-sm font-medium text-gray-600">Upload images</span>
          </div>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                Array.from(e.target.files).forEach(uploadImageToSupabase);
              }
            }}
            className="hidden"
          />
        </label>
      </div>

      {isViewerVisible && (
        <ImageViewer
          src={images.map((image) => image.uri)}
          currentIndex={selectedImageIndex}
          disableScroll={false}
          closeOnClickOutside={true}
          onClose={() => setIsViewerVisible(false)}
        />
      )}
    </div>
  );
}