import React, { useState, useEffect, useContext } from 'react';
import './AddCar.css';
import axios from 'axios';
import { CarContext } from '../App.js';

const AddCar = ({ cars }) => {
    
    const { fetchCarsForUser } = useContext(CarContext);
    const apiUrl = process.env.REACT_APP_FLASK_API_URL;
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
    
    const [imageURL, setImageURL] = useState(null);
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
    

    const fetchFirstImage = async (modelId) => {
        console.log("Fetching first image for model:", modelId);     
        try {
            console.log(`API URL for fetching first image: ${apiUrl}/api/get_first_photo/${modelId}`);

            const response = await axios.get(`${apiUrl}/api/get_first_photo/${modelId}`);          
            const imageUrl = response.data.image_url;          
              
            setImageURL(imageUrl);
            console.log("Set Image URL:", imageUrl);
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
        }
      }, [formData.model, apiUrl]);
      

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    console.log("Field Changed:", name, "Value:", value);  // Log the name and value of the changed field
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'model') {
      setImageURL(null);
    }
    // If the year & trim dropdown is selected, fetch the first image
    if (name === 'variant') {
        const variantData = JSON.parse(value);
        const { model_id } = variantData;
        console.log("Variant Data:", variantData, "Model ID:", model_id);  
        if (model_id) {
            await fetchFirstImage(model_id);
        }
    }
    
  };

  const [successMessage, setSuccessMessage] = useState(null);

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
  
    const formDataObj = new FormData();
  
    // Parsing the variant to get the model_id
    const variantData = JSON.parse(formData.variant);
    const { model_id } = variantData;
    const user_id = localStorage.getItem("user_id");
    console.log("User ID:", user_id);
  
    // Including model_id and other details in the payload
    const payload = {
      ...formData,
      model_id,
      user_id,
      year_purchased: formData.year,
    };
  
    // Append all the existing form data to FormData object
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
  
        const successMessage = `${formData.make} ${formData.model} ${response.data.message}, please add next`;
        setSuccessMessage(successMessage);
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
              >
                  <option value="" disabled>Select model</option>
                  {models.map((model, index) => (
                  <option key={index} value={model.name}>{model.name}</option>
                  ))}
              </select>
          </label>
        </div>
        <div className="col">
          <label>
              Year and Trim:
              <select
                  name="variant"
                  value={formData.variant}
                  onChange={handleInputChange}
              >
                  <option value="" disabled>Select Year and Trim</option>
                  {modelVariants.map((variant, index) => (                    
                  <option key={index} value={JSON.stringify({ model_id: variant.model_id, year: variant.year, trim: variant.trim })}>
                      {variant.year} {variant.trim ? `- ${variant.trim}` : ''}
                  </option>
          
                  ))}
              </select>
          </label>
        </div>
      </div>
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
      <div className="row">
        <div className="col-full">  
          <div className="image-section">
            <h3>Add a Photo</h3>
            <label>
              Upload from Device:
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
            <button type="button" onClick={() => {}}>Capture from Camera</button>
          </div>
        </div>
      </div>

      <button type="submit" className="get-started-button">Add Car</button>
    </form>
      {successMessage && <p>{successMessage}</p>}
      {/* Image preview section */}
      {(formData.make && formData.model) && (
        <div className="image-preview">
          <h3>That Make and Model looked like?</h3>
          {imageURL && <img src={imageURL} alt="Car" />}
        </div>
      )}
    </div>
  );
};

export default AddCar;
