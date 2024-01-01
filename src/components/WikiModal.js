import React, { useEffect, useState } from 'react';
import './WikiModal.css';

const ImageSelectionModal = ({ isOpen, onSelect, onRequestClose, make, model, trim }) => {
  const [images, setImages] = useState([]);
  const [includeVariant, setIncludeVariant] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const thumbnailWidth = 300; // Desired width for thumbnails

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };
  const handleIncludeVariantToggle = (e) => {
    setIncludeVariant(e.target.checked);
  };
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
    const colorQuery = selectedColor ? ` ${selectedColor}` : '';
    const variantPart = includeVariant && trim ? ` ${trim}` : '';
    const searchQuery = `${make} ${model}${variantPart}${colorQuery}`.trim();
    const imageUrlApi = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=15&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${thumbnailWidth}&format=json&origin=*`;

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
  }, [make, model, trim, selectedColor, includeVariant]); // Dependencies for useEffect

  // Construct the display label for the search
  const searchLabel = `${make} ${model}${includeVariant && trim ? ` ${trim}` : ''}${selectedColor ? ` - ${selectedColor}` : ''}`.trim();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Select a Car Image">
      <div className="modal-content">
        
        <span className="close" onClick={onRequestClose}>&times;</span>
        <h2>Select an Image</h2>
        <p className="wiki-results-label">Wiki results for "{searchLabel}"</p> 
        <p>
          <label>
            Include Variant
            <input 
              type="checkbox" 
              checked={includeVariant} 
              onChange={handleIncludeVariantToggle} 
            />
          </label>
        </p>
        <p>
          <select onChange={handleColorChange} value={selectedColor}>
            <option value="">Select Color</option>
            <option value="Black">Black</option>
            <option value="White">White</option>
            <option value="Silver">Silver</option>
            <option value="Gray">Gray</option>
            <option value="Red">Red</option>          
            <option value="Orange">Orange</option>
            <option value="Yellow">Yellow</option>
            <option value="Green">Green</option>
            <option value="Blue">Blue</option>
            <option value="Yellow">Yellow</option>
          </select>
        </p>
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

