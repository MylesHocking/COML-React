import React, { useEffect, useState } from 'react';
import './WikiModal.css';

const ImageSelectionModal = ({ isOpen, onSelect, onRequestClose, make, model, trim }) => {
  const [images, setImages] = useState([]);
  const pageTitle = `${make} ${model} ${trim || ''}`.trim();
  console.log('pageTitle', pageTitle);
  const thumbnailWidth = 300; // Desired width for thumbnails

  const imageUrlApi = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(pageTitle)}&gsrlimit=10&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${thumbnailWidth}&format=json&origin=*`;
  console.log('imageUrlApi', imageUrlApi);

  const handleImageSelect = (imageUrl) => {
    console.log('Selected image:', imageUrl);
    onSelect(imageUrl);
    onRequestClose();
  };

  useEffect(() => {
    setImages([]);
    fetch(imageUrlApi)
      .then(response => response.json())
      .then(data => {
        const pages = data.query.pages;
        const imageUrls = Object.values(pages).map(page => {
          // Get the thumbnail URL, falling back to the full URL if thumbnail is not available
          return page.imageinfo[0].thumburl || page.imageinfo[0].url;
        });
        setImages(imageUrls);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }, [pageTitle, imageUrlApi]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" isOpen={isOpen} onRequestClose={onRequestClose} contentlabel="Select a Car Image">
      <div className="modal-content">
        <span className="close-button" onClick={onRequestClose}>&times;</span>
        <div className="image-grid">
          {images.map((imageUrl, index) => (
            <img key={index} src={imageUrl} alt={`Car ${index}`} onClick={() => handleImageSelect(imageUrl)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
