import React, { useEffect, useState } from 'react';
import '../index.css';
import axios from 'axios';
import html2canvas from 'html2canvas';

const CarChart = ({ cars }) => {  
  const apiUrl = process.env.REACT_APP_FLASK_API_URL;
  console.log("Cars in CarChart:", cars);
  const [points, setPoints] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);

  const chartWidth = 750;
  const chartHeight = 400;

  const [selectedCar, setSelectedCar] = useState(null);

  const handlePointClick = async (car) => {
    console.log("Clicked on:", car);  
    // Fetch the high-res image
    const imageUrl = await fetchHighResImage(car.model_id);  
    setSelectedCar({...car, imageUrl});
  };
  
  const fetchHighResImage = async (modelId) => {
    try {
        const response = await axios.get(`${apiUrl}/api/get_first_photo/${modelId}`);
        return response.data.image_url;
    } catch (error) {
        console.error('Error fetching high-res image:', error);
        return null;
    }
  };


  useEffect(() => {
    const yAxisLabels = [0, 2, 4, 6, 8, 10];
    if (cars && cars.length > 0) {
      const earliestYear = cars.length ? Math.min(...cars.map(car => car.year_purchased || 0)) : 0;
      const latestYear = cars.length ? Math.max(...cars.map(car => car.year_purchased || 0)) : 0;
      const rangeOfYears = latestYear - earliestYear;

      const newPoints = cars.map(car => ({
        left: ((car.year_purchased - earliestYear) / rangeOfYears) * chartWidth,
        bottom: (car.rating / 10) * chartHeight,
      }));

      setPoints(newPoints);
      const uniqueYears = Array.from(new Set(cars.map(car => car.year_purchased))).sort((a, b) => a - b);
      const newLabels = uniqueYears.map(year => ({
        year,
        left: ((year - earliestYear) / rangeOfYears) * chartWidth,
      }));

      setXLabels(newLabels);

      setYLabels(yAxisLabels.map(label => ({
        label,
        bottom: (label / 10) * chartHeight,
      })));  
      
      const fetchImages = async () => {
        const fetchImagePromises = cars.map(async (car) => {
          const left = ((car.year_purchased - earliestYear) / rangeOfYears) * chartWidth;
          const bottom = (car.rating / 10) * chartHeight;
          let imageUrl = null;
      
          try {
            const response = await axios.get(`${apiUrl}/api/get_first_thumb/${car.model_id}`);
            imageUrl = response.data.image_url;
          } catch (error) {
            // handle error
          }
          return {left, bottom, imageUrl};
        });
      
        const newPointsWithImages = await Promise.all(fetchImagePromises);
        setPoints(newPointsWithImages);
      };
    
      fetchImages();
    }
  }, [cars, apiUrl]);

  const downloadChart = () => {
    const chartElement = document.getElementsByClassName('chart-container')[0];

    html2canvas(chartElement).then((canvas) => {
      const pngUrl = canvas.toDataURL("image/png");
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'chart.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  return (
    <>
    
  
    <div className="chart-container">
      <button className="download-button" onClick={downloadChart}>Download Chart</button>
      {(!cars || cars.length === 0) ? (
          <div className="no-cars-message">
            <a href="/add-car">Please Add Your First Car!</a>
          </div>
        ) : (
      <div id="chart" className="chart">
        <div className="axis" id="x-axis"></div>
        <div className="axis" id="y-axis"></div>
        <svg className="line-container" width={chartWidth} height={chartHeight}>
          {points.map((point, index, arr) => {
            if (index === 0) return null;  // Skip the first point
            return (
              <line 
                key={index} 
                x1={arr[index - 1].left+25} y1={chartHeight - arr[index - 1].bottom} 
                x2={point.left+25} y2={chartHeight - point.bottom} 
                stroke="black"
              />
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
        {points.map((point, index) => {
          const car = cars[index];
          return (
            <React.Fragment key={index}>
              <div 
                key={`${index}-point`} 
                onClick={() => handlePointClick(car, point.imageUrl)}
                className={`point ${!point.imageUrl ? 'grey-placeholder' : ''}`}
                style={{ 
                  left: `${point.left}px`, 
                  bottom: `${point.bottom - (point.imageUrl ? -25 : 25)}px` // Conditional bottom positioning
                }}
              >
                {point.imageUrl ? <img src={point.imageUrl} alt="car" /> : null}
              </div>
              <div 
                key={`${index}-label`} 
                className="car-label"
                style={{ 
                  left: `${point.left -5}px`, 
                  bottom: `${car.rating < 2 ? point.bottom + 20 : point.bottom - 60}px`
                }}
              >
                <span className="make">{car.make}</span><br />
                <span className="model">{car.model}</span>
              </div>
            </React.Fragment>
          );
        })}
        {selectedCar && (
          <div className="modal">
            <div className="modal-content">          
              <span className="close" onClick={() => setSelectedCar(null)}>&times;</span>
              <h1>{selectedCar.make} {selectedCar.model}</h1>
              {selectedCar.imageUrl ? <img src={selectedCar.imageUrl} alt={`${selectedCar.make} ${selectedCar.model}`} /> : <p>No image available</p>}
              <p>Memories: {selectedCar.memories}</p>
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


            </div>
          </div>
        )}
      </div>      
      )}
    </div>   

    </>
  );
};

export default CarChart;
