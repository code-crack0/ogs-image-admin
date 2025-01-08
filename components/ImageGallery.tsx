'use client';

import { useEffect, useState } from 'react';
import { fetchImagesFromBucket } from '@/lib/fetchImages';
import { ImageGrid } from './ImageGrid';

export default function ImageGallery() {
  const [images, setImages] = useState<{ id: string | number; src: string; alt: string; }[]>([]);
  const bucketName = 'images';

  useEffect(() => {
    async function loadImages() {
      const fetchedImages = await fetchImagesFromBucket(bucketName);
      setImages(fetchedImages);
    }

    loadImages();
  }, []);

  return <ImageGrid images={images} />;
}
