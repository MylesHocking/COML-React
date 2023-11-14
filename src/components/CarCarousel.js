import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './CarCarousel.css';

const CarCarousel = React.memo(({ images, onSlideChange, onSelect }) => {
  /*console.log('num gallery images:', images?.length);
  console.log('images:', images);
  console.log('onSlideChange:', onSlideChange);
  console.log('onSelect:', onSelect);
  console.log('images?.length > 5:', images?.length > 5);*/
  const settings = {
    afterChange: currentSlide => onSlideChange(currentSlide),
    dots: images?.length > 5, 
    infinite: images?.length > 5, 
    
    arrows: images?.length > 5,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 5,
    lazyLoad: 'ondemand',
    initialSlide: 0,
    responsive: [
      // ...your responsive settings
    ],
  };

  return (
    <Slider {...settings}>
    {images.map((imageDetail, index) => (
        <div key={index} onClick={() => onSelect(imageDetail)} className="thumbnail-container">
            <img src={imageDetail.imageUrl} alt={`Car ${imageDetail.year} ${imageDetail.trim}`} />
            <div className="image-caption">
                {imageDetail.year}{imageDetail.trim ? ` ${imageDetail.trim}` : ''}
            </div>
        </div>
    ))}
    </Slider>
  );
});

export default CarCarousel;