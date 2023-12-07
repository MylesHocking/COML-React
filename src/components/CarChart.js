import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import '../index.css';
import axios from 'axios';
import { CarContext } from '../App.js';
import './CarChart.css';
import { fetchHighResImage } from '../utils/display_utils.js';

const CarChart = ({ cars, userId }) => {   
  const { userId: urlUserId } = useParams();
  const { fetchCarsForUser } = useContext(CarContext);
  const sessionUserId = localStorage.getItem("user_id");
  const isCurrentUser = urlUserId === sessionUserId;

  useEffect(() => {
    // Use the userId from URL if available, otherwise default to the prop userId
    const idToUse = urlUserId || userId;
    console.log("idToUse", idToUse);
    fetchCarsForUser(idToUse);
    return () => {
      setCars([]); // Clear cars
      setPoints([]); // Clear points
    };
  }, [urlUserId, userId, fetchCarsForUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const { setCars } = useContext(CarContext);
  const apiUrl = process.env.REACT_APP_FLASK_API_URL;
  //console.log("Cars in CarChart:", cars);
  const [points, setPoints] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);

  const [chartWidth, setChartWidth] = useState(0); 
  const [chartHeight, setChartHeight] = useState(0);

  function debounce(func, wait) {
    let timeout;
  
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  useEffect(() => {
    const updateChartDimensions = () => {
      const chartContainer = document.querySelector('.chart-container');
      if (chartContainer) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const deviceRatio = viewportHeight / viewportWidth;

        const subtractionValue = chartContainer.offsetWidth < 450 ? 75 : 100;
        const newWidth = chartContainer.offsetWidth - subtractionValue; 
        const newHeight = newWidth * deviceRatio * 0.8;
        console.log('deviceRatio:', deviceRatio, 'newWidth:', newWidth, 'newHeight:', newHeight, 'subtractionValue:', subtractionValue);

        setChartWidth(newWidth); 
        setChartHeight(newHeight);
      }
    };

    const debouncedUpdateChartDimensions = debounce(updateChartDimensions, 250); // 250 ms

    window.addEventListener('resize', debouncedUpdateChartDimensions);

    // Initial call
    updateChartDimensions();

    return () => {
      window.removeEventListener('resize', debouncedUpdateChartDimensions);
    };
  }, []);


  const [selectedCar, setSelectedCar] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMemories, setEditedMemories] = useState('');

  const handleEditButtonClick = () => {
    // If we're about to enter edit mode, set the memories
    if (!isEditMode) {
      setEditedMemories(selectedCar.memories);
    }
    setIsEditMode(!isEditMode); // Toggle edit mode
  };

  const updateCarData = (carId, newMemories) => {
    const updatedCars = cars.map(car => 
      car.id === carId ? { ...car, memories: newMemories } : car
    );
    setCars(updatedCars);
    //set selected car memories to new memories
    setSelectedCar({...selectedCar, memories: newMemories});
  };

  const handleEditCar = async (e) => {
    e.preventDefault();

    let formData = new FormData();
    formData.append('memories', editedMemories);
    // Append image file if a new one was chosen
    // ...

    try {
      console.log('In handleEditCar', selectedCar.id );
      const response = await fetch(`${apiUrl}/api/edit_car/${selectedCar.id}`, {
        method: 'POST',
        body: formData,
        // Include headers, credentials, etc., as needed
      });
      const result = await response.json();
      console.log(result);
      // give result to user via popup
      alert('Car updated successfully!');
      updateCarData(selectedCar.id, editedMemories);

      setEditedMemories('');
      // Close the edit mode
      setIsEditMode(false);

    } catch (error) {
      console.error('Error updating car:', error);
    }
  };

  const handleImageChange = (e) => {
    // Logic to handle image file selection
    // You might need to set the state of a new image file here
    console.log('In handleImageChange');
  };

  const handleDeleteButtonClick = async (carId) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        console.log('In handleEditCar', selectedCar.id );
        const response = await fetch(`${apiUrl}/api/delete_car/${selectedCar.id}`, {
          method: 'DELETE',
          // Include any necessary headers
        });
        if (response.ok) {
          alert('Car deleted successfully!');
          deleteCarData(selectedCar.id);
        } else {
          console.error("Failed to delete the car");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const deleteCarData = (carId) => {
    const updatedCars = cars.filter(car => car.id !== carId);
    setCars(updatedCars);
    
    console.log('deleted cars:', updatedCars);
    // Close the modal if the deleted car was selected
    if (selectedCar && selectedCar.id === carId) {
      setSelectedCar(null);
    }
  };
  
  
  const handlePointClick = async (car) => {
    console.log("Clicked on:", car);  
    // Fetch the high-res image
    const imageUrl = await fetchHighResImage(car, apiUrl);
    setSelectedCar({...car, imageUrl});
  };

  useEffect(() => {
    const yAxisLabels = [0, 2, 4, 6, 8, 10];
    if (cars && cars.length > 0) {
      const earliestYear = cars.length ? Math.min(...cars.map(car => car.year_purchased || 0)) : 0;
      const latestYear = cars.length ? Math.max(...cars.map(car => car.year_purchased || 0)) : 0;
      const rangeOfYears = latestYear - earliestYear;

      const newPoints = cars.map(car => ({
        left: (((car.year_purchased - earliestYear) / rangeOfYears) * chartWidth),
        bottom: (car.rating / 10) * chartHeight,
      }));

      setPoints(newPoints);
      const uniqueYears = Array.from(new Set(cars.map(car => car.year_purchased))).sort((a, b) => a - b);
      const newLabels = uniqueYears.map((year, index) => {
      // Check if the year is the first or last in the array
      const isEdgeYear = index === 0 || index === uniqueYears.length - 1;
      const displayYear = isEdgeYear ? year : year.toString().substr(-2); // Only use last two digits unless it's an edge year

      return {
        year: displayYear,
        left: (((year - earliestYear) / rangeOfYears) * chartWidth)-10,
      };
    });

    setXLabels(newLabels);

      setYLabels(yAxisLabels.map(label => ({
        label,
        bottom: (label / 10) * chartHeight,
      })));  
      
      const fetchImages = async () => {
        const fetchImagePromises = cars.map(async (car) => {
          const left = (((car.year_purchased - earliestYear) / rangeOfYears) * chartWidth);
          const bottom = (car.rating / 10) * chartHeight;
          let imageUrl = null;
      
          try {
            // Conditionally set the API endpoint to fetch the image
            let apiEndpoint;
            if (car.has_custom_image) {
              apiEndpoint = `${apiUrl}/api/get_custom_thumb/${car.user_car_association_id}`;
            } else {
              apiEndpoint = `${apiUrl}/api/get_first_thumb/${car.model_id}`;
            }
      
            const response = await axios.get(apiEndpoint);
            imageUrl = response.data.image_url;
          } catch (error) {
            // handle error
          }
          return { left, bottom, imageUrl };
        });
      
        const newPointsWithImages = await Promise.all(fetchImagePromises);
        setPoints(newPointsWithImages);
      };      
    
      fetchImages();
    }
  }, [cars, apiUrl, chartWidth, chartHeight]);

  return (
    <>    
      <div className="landscape-message">
          For the best experience, please rotate your device to landscape mode.
      </div>
      <div className="chart-container">
        {(!cars || cars.length === 0) ? (
            <div className="no-cars-message">
              <a href="/add-car">Please Add Your First Car!</a>
            </div>
          ) : (
            <div id="chart" className="chart">
              <div className="axis" id="x-axis"></div>
              <div className="axis" id="y-axis"></div>
              <svg className="line-container" width={chartWidth+50} height={chartHeight+25}>
                {points.map((point, index, arr) => {
                  const animationDelay = index * 0.2; // 0.2-second delay per point/line
                  const car = cars[index];
              
                  // Only calculate and render lines for points after the first
                  let adjustedX1, adjustedY1, adjustedX2, adjustedY2;
                  if (index > 0) {
                    const dx = point.left - arr[index - 1].left;
                    const dy = (chartHeight - point.bottom) - (chartHeight - arr[index - 1].bottom);
                    const magnitude = Math.sqrt(dx * dx + dy * dy);
                    const unitX = dx / magnitude;
                    const unitY = dy / magnitude;
              
                    adjustedX1 = (arr[index - 1].left+25) + unitX * 25;
                    adjustedY1 = (chartHeight - arr[index - 1].bottom+25) + unitY * 25;
                    adjustedX2 = (point.left+25) - unitX * 25;
                    adjustedY2 = (chartHeight - point.bottom+25) - unitY * 25;               
                  }
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <line
                          className="line"
                          style={{ animationDuration: '0.5s', animationDelay: `${animationDelay}s` }}
                          x1={adjustedX1} y1={adjustedY1}
                          x2={adjustedX2} y2={adjustedY2}
                          stroke="black"
                        />
                      )}
                      <foreignObject 
                        className='foreign-object'
                        x={point.left} y={chartHeight - point.bottom}
                        width="150" height="150"
                        style={{ animationDuration: '1s', animationDelay: `${animationDelay}s` }}
                      >
                        <div className="car-label">
                          <span className="make">{car?.make}</span><br />
                          <span className="model">{car?.model}</span>
                        </div>
                        <div 
                          onClick={() => handlePointClick(car, point.imageUrl)}
                          className={`point ${!point.imageUrl ? 'grey-placeholder' : ''}`}
                        >
                          {point.imageUrl ? <img src={point.imageUrl} alt="car" /> : null}
                        </div>
                      </foreignObject>
                    </React.Fragment>
                  );
                })}
              </svg>
          
              {xLabels.map((xLabel, index) => (
                <div key={index} className="x-label" style={{ left: `${xLabel.left}px` }}>
                  {xLabel.year}
                </div>
              ))}
              {yLabels.map((yLabel, index) => (
                <div key={index} className="y-label" style={{ bottom: `${yLabel.bottom}px` }}>
                  {yLabel.label}
                </div>
              ))}
            </div>
          )}
          {selectedCar && (
            <div className="modal-backdrop">
              <div className="modal">
                <div className="modal-content">          
                  <span className="close" onClick={() => setSelectedCar(null)}>&times;</span>
                  <h1>{selectedCar.make} {selectedCar.model}</h1>
                  {selectedCar.imageUrl ? <img src={selectedCar.imageUrl} alt={`${selectedCar.make} ${selectedCar.model}`} /> : <p>No image available</p>}
                  
                  {isEditMode ? (
                    // Edit form for updating memories and image
                    <form onSubmit={handleEditCar}>
                      <textarea value={editedMemories} onChange={(e) => setEditedMemories(e.target.value)} />
                      <input type="file" onChange={handleImageChange} />
                      <button type="submit">Save Changes</button>
                    </form>
                  ) : (
                    <p>Memories: {selectedCar.memories}</p>
                  )}
                  <div className="smaller-font">
                    {selectedCar.model_trim && <p>Trim: {selectedCar.model_trim}</p>}                
                    {selectedCar.model_year && <p>Made: {selectedCar.model_year}</p>}
                    {selectedCar.model_engine_cc && <p>Engine CC: {selectedCar.model_engine_cc}</p>}
                    {selectedCar.model_sold_in_us !== undefined && <p>Sold in US: {selectedCar.model_sold_in_us ? 'Yes' : 'No'}</p>}
                    {selectedCar.model_engine_type && <p>Engine Type: {selectedCar.model_engine_type}</p>}
                    {selectedCar.model_engine_position && <p>Engine Position: {selectedCar.model_engine_position}</p>}
                    {selectedCar.model_engine_cyl && <p>Engine Cylinders: {selectedCar.model_engine_cyl}</p>}
                    {selectedCar.model_drive && <p>Drive: {selectedCar.model_drive}</p>}
                    {selectedCar.model_engine_power_ps && <p>Engine Power (PS): {selectedCar.model_engine_power_ps}</p>}
                    {selectedCar.model_engine_torque_nm && <p>Engine Torque (Nm): {selectedCar.model_engine_torque_nm}</p>}
                    {selectedCar.model_engine_fuel && <p>Engine Fuel: {selectedCar.model_engine_fuel}</p>}
                    {selectedCar.model_weight_kg && <p>Weight (kg): {selectedCar.model_weight_kg}</p>}
                    {selectedCar.model_transmission_type && <p>Transmission Type: {selectedCar.model_transmission_type}</p>}
                    {selectedCar.model_doors && <p>Doors: {selectedCar.model_doors}</p>}
                    {selectedCar.model_body && <p>Body: {selectedCar.model_body}</p>}
                    {selectedCar.model_engine_valves_per_cyl && <p>Engine Valves Per Cylinder: {selectedCar.model_engine_valves_per_cyl}</p>}
                    {selectedCar.model_engine_power_rpm && <p>Engine Power RPM: {selectedCar.model_engine_power_rpm}</p>}
                    {selectedCar.model_engine_torque_rpm && <p>Engine Torque RPM: {selectedCar.model_engine_torque_rpm}</p>}
                    {selectedCar.model_engine_bore_mm && <p>Engine Bore (mm): {selectedCar.model_engine_bore_mm}</p>}
                    {selectedCar.model_engine_stroke_mm && <p>Engine Stroke (mm): {selectedCar.model_engine_stroke_mm}</p>}
                    {selectedCar.model_engine_compression && <p>Engine Compression: {selectedCar.model_engine_compression}</p>}
                    {selectedCar.model_seats && <p>Seats: {selectedCar.model_seats}</p>}
                    {selectedCar.model_lkm_mixed && <p>Mixed L/KM: {selectedCar.model_lkm_mixed}</p>}
                    {selectedCar.model_lkm_hwy && <p>Highway L/KM: {selectedCar.model_lkm_hwy}</p>}
                    {selectedCar.model_lkm_city && <p>City L/KM: {selectedCar.model_lkm_city}</p>}
                    {selectedCar.model_top_speed_kph && <p>Top Speed (KPH): {selectedCar.model_top_speed_kph}</p>}
                    {selectedCar.model_0_to_100_kph && <p>0 to 100 KPH: {selectedCar.model_0_to_100_kph}</p>}
                    {selectedCar.model_co2 && <p>CO2: {selectedCar.model_co2}</p>}
                  </div>
                  {/* Conditionally render Edit and Delete buttons depending on if it's user's own chart */}
                  {console.log("isCurrentUser", isCurrentUser, "userId", userId)}
                  {isCurrentUser && (
                    <div className="edit-delete-buttons">
                      <button onClick={handleEditButtonClick}>Edit</button>
                      
                      <button onClick={handleDeleteButtonClick}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div> 
    </>
  );
};

export default CarChart;
