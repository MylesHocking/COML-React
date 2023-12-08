import React, { useState } from 'react';
import './CarImageModal.css';

const CarImageModal = () => {
    //const [isOpen, setIsOpen] = useState(false);
    const [carMake, setCarMake] = useState('');
    const [carModel, setCarModel] = useState('');
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchImages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Constructing the Wikimedia API URL
            const searchQuery = `${carMake} ${carModel}`;
            const encodedQuery = encodeURIComponent(searchQuery);
            const apiURL = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&srlimit=10&srnamespace=6`;
    
            // Fetching data from the API
            const response = await fetch(apiURL);
            const data = await response.json();
    
            // Extracting image URLs from the response
            const imageUrls = data.query.search.map((item) => `https://commons.wikimedia.org/wiki/File:${item.title.replace(' ', '_')}`);
    
            setImages(imageUrls);
        } catch (error) {
            setError('Failed to fetch images');
        } finally {
            setIsLoading(false);
        }
    };
    

    // Inside the return statement of CarImageModal
    //style={{ display: isOpen ? 'block' : 'none' }} onClick={() => setIsOpen(false)}
    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close">&times;</span>
                <h2>Search Car Images</h2>
                <input 
                    type="text" 
                    placeholder="Car Make" 
                    value={carMake} 
                    onChange={(e) => setCarMake(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="Car Model" 
                    value={carModel} 
                    onChange={(e) => setCarModel(e.target.value)}
                />
                <button onClick={fetchImages}>Search</button>
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
                <div className="image-container">
                    {images.map((image, index) => (
                        <img key={index} src={image} alt={`${carMake} ${carModel}`} />
                    ))}
                </div>
            </div>
        </div>
    );

    };

export default CarImageModal;
