import React, { useState, useEffect, useContext, useCallback } from 'react';
import './AddCar.css';
import axios from 'axios';
import { CarContext } from '../App.js';
import CarCarousel from './CarCarousel';
import SuccessModal from './SuccessModal';

const AddCar = ({ cars }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const { fetchCarsForUser } = useContext(CarContext);
    const apiUrl = process.env.REACT_APP_FLASK_API_URL;
    const [showCustomCarFields, setShowCustomCarFields] = useState(false);
    //console.log("API URL:", apiUrl);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [modelVariants, setModelVariants] = useState([]);
    const [formData, setFormData] = useState({
      make: '',
      model: '',
      year: '',
      variant: '',
      rating: '',
      memories: '',
    });
    
    const [imageURL, setImageURL] = useState(null); //single image
    const [imageURLs, setImageURLs] = useState([]); //for gallery
    const [selectedFile, setSelectedFile] = useState(null); // New state for selected file
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const extension = file.name.split('.').pop().toLowerCase();
    
        if (!['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
          alert('Invalid file type. Please upload a jpg, jpeg, png, or gif.');
          return;
        }
      }      
      setSelectedFile(file);
    };
    
    const fetchImages = useCallback(async (startIndex, desiredCount) => {
      let fetchedCount = 0;
      let newImageDetails = [];
      let index = startIndex;
    
      while (fetchedCount < desiredCount && index < modelVariants.length) {
        const batchOfVariants = modelVariants.slice(index, index + desiredCount - fetchedCount);
    
        try {
          const imagesResponses = await Promise.all(
            batchOfVariants.map(variant =>
              axios.get(`${apiUrl}/api/get_first_thumb/${variant.model_id}`)
                .then(response => ({
                  imageUrl: response.data.image_url,
                  modelId: variant.model_id,
                  year: variant.year,
                  trim: variant.trim,
                  // Include any other variant details you need
                }))
                .catch(error => {
                  console.error('Error fetching image for model ID:', variant.model_id, error);
                  return null; // Return null for errors to filter them out later
                })
            )
          );
    
          const validImageDetails = imagesResponses.filter(details => details && details.imageUrl);
    
          newImageDetails.push(...validImageDetails);
          fetchedCount += validImageDetails.length;
          index += desiredCount - fetchedCount; // Move the index forward by the number of images we still need
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      }
    
      setImageURLs(prevURLs => [...prevURLs, ...newImageDetails]);
    }, [apiUrl, modelVariants]);   

    // Use useEffect to call fetchImages when a model is selected
    useEffect(() => {
      if (formData.model) {
        console.log("Model Variants:", modelVariants);
        console.log("OldModel Image URLs before reset:", imageURLs);
        setImageURLs([]);
        console.log("OldModel Image URLs after reset:", imageURLs);
        fetchImages(0, 7); // Fetch the first 6 images
      }
    }, [formData.model, fetchImages, modelVariants.length]);

    const loadMoreImages = () => {
      const startIndex = imageURLs.length; // Start from the end of the currently loaded images
      const count = 6; // Number of images to load each time
      fetchImages(startIndex, count);
    };

    const handleSlideChange = (currentSlide) => {
      // This function would be triggered after the carousel slide changes.
      // You can use this to load more images if needed.
      console.log("Current slide is:", currentSlide);
    
      // Load more images if the end of the carousel is reached
      const threshold = 5; // Or whatever your threshold is
      if (currentSlide >= imageURLs.length - threshold) {
        // Implement the logic to fetch and add more images to imageURLs
        loadMoreImages();
      }
    };    

    const onSelectThumbnail = (selectedThumbnail) => {
        const { modelId } = selectedThumbnail;
        const selectedVariant = modelVariants.find(variant => variant.model_id === modelId);
        console.log('Selected Thumbnail:', selectedThumbnail);
        console.log('Selected Variant:', selectedVariant);
        console.log('Current FormData:', formData);
        if (selectedVariant) {

          const stringifyVariant = (variant) => {
            const keyOrder = ['model_id', 'year', 'trim', 'is_generic_model'];
            return JSON.stringify(variant, keyOrder);
          };
          
          // When setting the formData:
          setFormData(prevFormData => ({
            ...prevFormData,
            variant: stringifyVariant({
              model_id: selectedVariant.model_id,
              year: selectedVariant.year,
              trim: selectedVariant.trim,
              is_generic_model: selectedVariant.is_generic_model
            })
          }));
          
          fetchFirstImage(modelId);
        }
      };
    
    const fetchFirstImage = async (modelId, isMultiple = false) => {
        console.log("Fetching first image for model:", modelId);     
        try {
            let apiEndpoint = isMultiple
            ? `${apiUrl}/api/get_first_thumb/${modelId}`
            : `${apiUrl}/api/get_first_photo/${modelId}`;
        
            console.log(`API URL for fetching first image:  ${apiEndpoint}`);
    
            const response = await axios.get(apiEndpoint);          
            const imageUrl = response.data.image_url;          
              
            if (isMultiple) {
                // Instead of setting the state here, just return the URL
                return { imageUrl, modelId };
            } else {
                setImageURL(imageUrl);
                console.log("Set Image URL:", imageUrl);
            }
        } catch (error) {
            console.error('Error fetching first image:', error);
        }
    };
  
    
    const years = Array.from({ length: new Date().getFullYear() - 1944 }, (_, i) => 1945 + i);

    // Load makes when the component mounts
    useEffect(() => {
      const fetchMakes = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/car_makes`);     
          setMakes(response.data);
        } catch (error) {
          console.error('Error fetching makes:', error);
          alert('Error fetching car makes. Please try again later.');
        }
      };
  
      fetchMakes();
    }, [apiUrl]);
  
    // Load models whenever a make is selected
    useEffect(() => {
    const fetchModels = async () => {
        if (formData.make) {
            try {
            // Use the correct API endpoint for fetching models
            const response = await axios.get(`${apiUrl}/api/car_models/${formData.make}`);
            setModels(response.data);
            } catch (error) {
            console.error('Error fetching models:', error);
            }
        }
    };
    fetchModels();
  }, [formData.make, apiUrl]);
  

  // Load model variants whenever a model is selected
  useEffect(() => {

    if (formData.model) {
      const fetchModelVariants = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/car_years_and_trims/${formData.model}`);
          console.log("URL:", `${apiUrl}/api/car_years_and_trims/${formData.model}`);
          setModelVariants(response.data);
          console.log("Model Variants:", response.data);

        } catch (error) {
          console.error('Error fetching model variants:', error);
        }
      };
    
      fetchModelVariants();
    } else {
      // Clear the gallery when the model is not selected
      setImageURLs([]);
    }
  }, [formData.model, apiUrl]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (value === "custom-option") {
      if (name === "make" || name === "model" || name === "variant") {
        setShowCustomCarFields(true);
      }
    }

    // Update formData and reset dependent fields as needed
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
      // Reset model, variant, and images when make changes
      ...(name === 'make' && { model: '', variant: '', year: '', rating: '', memories: '' }),
      // Reset variant and images when model changes
      ...(name === 'model' && { variant: '', year: '', rating: '', memories: '' }),
    }));
  
    // If make changes, reset models and modelVariants as well
    if (name === 'make') {
      setModels([]);
      setModelVariants([]);
    }
  
    // Clear image URLs if the make or model changes
    if (name === 'make' || name === 'model') {
      setImageURL(null); // Clear single image URL
      setImageURLs([]);  // Clear all image URLs in the gallery
    }
    // If the year & trim dropdown is selected, fetch the first image
    if (name === 'variant') {
        const variantData = JSON.parse(value);
        const { model_id, is_generic_model } = variantData;
        
        console.log("Variant Data:", variantData, "Model ID:", model_id, "Is Generic Model:", is_generic_model);  
        if (model_id) {          
            await fetchFirstImage(model_id);
        }
    }   

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that rating and year purchased have been selected
    if (formData.rating === '') {
      alert("Please select a rating before submitting.");
      return;
    }
    if (formData.year === '') {
      alert("Please select a year before submitting.");
      return;
    }
    if (formData.variant === '') {
      alert("Please select a Year & Trim or enter generic/custom Year & Trim before submitting.");
      return;
    }  
    
    const user_id = localStorage.getItem("user_id");
    console.log("User ID:", user_id);
  
    // Including model_id and other details in the payload
    let payload = {
    ...formData,
    user_id,
    year_purchased: formData.year,
    };

    if (formData.variant) {
      const variantData = JSON.parse(formData.variant);
      payload = { ...payload, model_id: variantData.model_id };
    }

    // Append all the existing form data to FormData object
    const formDataObj = new FormData();
    Object.keys(payload).forEach((key) => {
      formDataObj.append(key, payload[key]);
    });
  
    // Append the file, if there is one
    if (selectedFile) {
      formDataObj.append('file', selectedFile, selectedFile.name);
    }
  
    try {
      console.log("Submitting form data:", formDataObj);
      for (var pair of formDataObj.entries()) {
        console.log(pair[0] + ', ' + pair[1]); 
      }
      const response = await axios.post(`${apiUrl}/api/add_car`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        console.log("Successfully added car:", response.data);
        // Update the cars in the context
        fetchCarsForUser();
  
        let successMessage = '';
        if (formData.custom_make && formData.custom_model) {
          successMessage = `${formData.custom_make} ${formData.custom_model}`;
        } else {
          successMessage = `${formData.make} ${formData.model}`;
        }
        // give option to add another car or navigate to the chart      
        successMessage += ` ${response.data.message}, please add the next one or go to your chart to see your cars!`;
        // Append the suggestion if it exists in the response
        if (response.data.suggestion) {
          successMessage += `\nSuggestion: ${response.data.suggestion}`;
        }

        // Set the complete message and open the modal
        setModalMessage(successMessage);
        setIsModalOpen(true);
        console.log("Modal Message:", modalMessage, "Is Modal Open:", isModalOpen);

        setFormData({
            make: '',
            model: '',
            year: '',
            variant: '',
            rating: '',
            memories: '',
        });
      }
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };
  
  return (
    
  <div className={"add-car-container"}>
  <form onSubmit={handleSubmit} className="car-form">
    {showCustomCarFields ? (
      <div className="custom-car-fields">
        <div className="row">
          <div className="col">
            <label>
              Make:              
              <input 
                className="custom-input"
                type="text"
                name="custom_make"
                placeholder="Enter make"
                value={formData.custom_make} 
                onChange={handleInputChange} 
              />
            </label>
          </div>
          <div className="col">
            <label>
                Model:          
              <input 
                className="custom-input"
                type="text"
                name="custom_model"
                placeholder="Enter model"
                value={formData.custom_model} 
                onChange={handleInputChange} 
              />
            </label>
          </div>
          <div className="col">
            <label>
                Year & Trim:  
              <input 
                className="custom-input"
                type="text"
                name="custom_variant"
                placeholder="Enter year and trim"
                value={formData.custom_variant} 
                onChange={handleInputChange} 
              />
            </label>
          </div>      
        </div>
      </div>
    ) : (
      <div className="standard-car-fields">
        <div className="row">
          <div className="col">
            <label>
              Make:
              <select
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
              >
                  <option value="" disabled>Select make</option>
                  {makes.map((make, index) => (
                  <option key={index} value={make}>{make}</option>
                  ))}
                  <option value="custom-option">Add Custom Make</option>
              </select>
              </label>
            </div>
            <div className="col">
              <label>
                  Model:
                  <select
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="select-width"
                  >
                      <option value="" disabled>Select model</option>
                      {models.map((model, index) => (
                      <option key={index} value={model.name}>{model.name}</option>
                      ))}
                      <option value="custom-option">Add Custom Model</option>
                  </select>
              </label>
            </div>
            <div className="col">
              <label>
                  Year & Trim:
                  <select
                      key={formData.variant}
                      name="variant"
                      value={formData.variant}
                      onChange={handleInputChange}
                      className="select-width"
                  >
                      <option value="" disabled>Select Year and Trim</option>
                      {modelVariants.map((variant, index) => (                    
                      <option key={index} value={JSON.stringify({ model_id: variant.model_id, year: variant.year, trim: variant.trim, is_generic_model: variant.is_generic_model })}>
                          {variant.year} {variant.trim ? `- ${variant.trim}` : ''}
                      </option>
              
                      ))}
                      <option value="custom-option">Add Custom Year & Trim</option>
                  </select>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Only show Gallery when not custom and make/model set */}
      {!showCustomCarFields && formData.make && formData.model && (
          <div className="row">          
            <div className="slick-col-container">      
              {imageURLs.length > 0 && (
                <>
                  <h3>{formData.make && formData.model ? `${formData.make} ${formData.model} Gallery` : 'Gallery'}</h3> 
                  {
                  console.log('Image URLs:', imageURLs)
                  }             
                  <CarCarousel
                    key={formData.model}
                    images={imageURLs} // Pass the array of image URLs
                    onSlideChange={handleSlideChange} // You need to define this function to handle slide changes
                    onSelect={onSelectThumbnail} // Pass the callback for image selection
                  />
                </>
              )}
            </div>
          </div>          
        )}  
      { formData.make && formData.model &&
      (          
        <div className="row">
          <div className="col-full">
            {imageURL && (
              <>
                <h4>{
                  (() => {
                    const { year, trim } = formData.variant ? JSON.parse(formData.variant) : {};
                    return `${year || ''} ${trim || 'Selected Model'}`.trim();
                  })()
                }</h4>
                <img className='add-car-preview' src={imageURL} alt="Car" />
              </>
            )}
          </div>
        </div>
      )}
      {(formData.make && formData.model) || (formData.custom_make && formData.custom_model) ? (                
        <div className="row">        
          <div className="col-full">  
            <div>
              <h3>Or add own Photo</h3>
              <label>
                Upload from Device:
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
              <button type="button" onClick={() => {}}>Capture from Camera</button>
            </div>
          </div>
        </div>                
      ) : null }       
      <div className="row">        
        <div className="col">
          <label>
              Year Purchased:
              <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              >
              <option value="" disabled>Select Year</option>
              {years.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
              ))}
              </select>
          </label>
        </div>        
        <div className="col">
          <label>
              Rating:
              <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
              >
                  <option value="" disabled>Select Rating</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((rating, index) => (
                  <option key={index} value={rating}>{rating}</option>
                  ))}
              </select>
          </label>
        </div>
        <div className="col"></div>
      </div>      
      <div className="row">
        <div className="col-full">
          <label>
              Memories:
              <textarea
                  name="memories"
                  value={formData.memories}
                  onChange={handleInputChange}
                  placeholder="What are your memories?"                
              />
          </label>
        </div>
      </div>
      <button type="submit" className="get-started-button">Add Car</button>
    </form>
    <SuccessModal
        isOpen={isModalOpen}
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
    />
     
    </div>
  );
};

export default AddCar;
