import React, { useEffect, useState } from 'react';
import './WikiModal.css';

const ImageSelectionModal = ({ isOpen, onSelect, onRequestClose, make, model, trim }) => {
  const [images, setImages] = useState([]);
  const pageTitle = `${make} ${model} ${trim || ''}`.trim();
  const thumbnailWidth = 300; // Desired width for thumbnails

  const imageUrlApi = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(pageTitle)}&gsrlimit=15&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${thumbnailWidth}&format=json&origin=*`;

  const handleImageSelect = (image) => {
    const imageInfo = {
      url: image.url, // Full image URL
      thumbnailUrl: image.thumburl, // Thumbnail URL
      attribution: `Image: "${image.title}", available at: ${image.descriptionurl}`
    };

    onSelect(imageInfo); // Pass the full image information
    onRequestClose();
  };

  useEffect(() => {
    setImages([]);
    fetch(imageUrlApi)
      .then(response => response.json())
      .then(data => {
        const pages = data.query.pages;
        const imageData = Object.values(pages).map(page => {
          const imageInfo = page.imageinfo[0];
          return {
            url: imageInfo.url,
            thumburl: imageInfo.thumburl,
            title: page.title,
            descriptionurl: imageInfo.descriptionurl
          };
        });
        setImages(imageData);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }, [pageTitle, imageUrlApi]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Select a Car Image">
      <div className="modal-content">
        
        <span className="close" onClick={onRequestClose}>&times;</span>
        <h2>Select an Image</h2>
        <div className="image-grid">
          {images.map((image, index) => (
            <img key={index} src={image.thumburl || image.url} alt={`Car ${index}`} onClick={() => handleImageSelect(image)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;

