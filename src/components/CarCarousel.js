import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CarCarousel = React.memo(({ images, onSlideChange, onSelect }) => {
  const settings = {
    afterChange: currentSlide => onSlideChange(currentSlide),
    dots: images?.length > 6, // Only show dots if there are more than 5 images
    infinite: images?.length > 5, // Only set to infinite if more than 5 images
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