import React, { useEffect, useState } from 'react';
import './WikiModal.css';

const ImageSelectionModal = ({ isOpen, onSelect, onRequestClose, make, model, trim }) => {
  const [images, setImages] = useState([]);
  const pageTitle = `${make} ${model} ${trim || ''}`.trim();
  console.log('pageTitle', pageTitle);
  //const pageTitle = "Audi A7";
  //const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
  //const pageTitle2 = "Audi_A4"; // Replace this with the actual title from your first API call
  //const imageUrlApi = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&format=json&origin=*`;
  const imageUrlApi = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
  //console.log('apiUrl', apiUrl);
  console.log('imageUrlApi', imageUrlApi);
  const handleImageSelect = (imageUrl) => {
    console.log('Selected image:', imageUrl);
    onSelect(imageUrl); // Call the function passed from AddCar
    console.log('onSelect', onSelect);
    onRequestClose(); // Close the modal
  };

  useEffect(() => {
    setImages([]);
    // First API call to get pageid
    console.log('useEffect imageUrlApi', imageUrlApi);
    fetch(imageUrlApi)
        .then(response => response.json())
        .then(data => {
            const pageId = Object.keys(data.query.pages)[0]; // This gets the first key (page ID)
            const pageData = data.query.pages[pageId];
      
            if (pageData && pageData.images) {
              // Further processing to extract image filenames
              const imageTitles = pageData.images.map(img => img.title);
              console.log('Image Titles:', imageTitles);
      
              return fetchImageUrls(imageTitles);
            }
        })
        .then(imageUrls => {
            // Filter out null values and set the image URLs in state
            setImages(imageUrls.filter(url => url != null));
          })
        .catch(error => {
        console.error('Error fetching images:', error);
        });
    }, [make, model, trim]);

    const fetchImageUrls = (imageTitles) => {
        const thumbnailWidth = 300; // Desired thumbnail width
      
        return Promise.all(imageTitles.map(title => 
          fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${thumbnailWidth}&format=json&origin=*`)
          .then(response => response.json())
          .then(data => {
            const page = data.query.pages[Object.keys(data.query.pages)[0]];
            if (page.imageinfo && page.imageinfo.length > 0) {
              // Check for thumburl, fallback to full url if not available
              //console.log('Image URL:', page.imageinfo[0].url);
              //console.log('Thumbnail URL:', page.imageinfo[0].thumburl);
              return page.imageinfo[0].thumburl || page.imageinfo[0].url;
            }
            return null;
          })
          .catch(error => {
            console.error('Error fetching thumbnail URL for:', title, error);
            return null;
          })
        ));
      };
      
      

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Select a Car Image">
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
