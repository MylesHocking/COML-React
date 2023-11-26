// dispaly_utils.js
import axios from 'axios';

export const fetchHighResImage = async (car, apiUrl) => {
  try {
    let apiUrlToUse = null;
    if (car.has_custom_image) {
      apiUrlToUse = `${apiUrl}/api/get_custom_photo/${car.user_car_association_id}`;
    } else {
      apiUrlToUse = `${apiUrl}/api/get_first_photo/${car.model_id}`;
    }
    console.log('Fetching high-res image from:', apiUrlToUse);
    const response = await axios.get(apiUrlToUse);
    console.log('Received response:', response);
    return response.data.image_url;
  } catch (error) {
    console.error('Error fetching high-res image:', error);
    return null;
  }
};
