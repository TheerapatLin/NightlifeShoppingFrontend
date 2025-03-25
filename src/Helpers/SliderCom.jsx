import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

export default function SimpleSlider(props) {
  const { className, settings, children, selector, bannerHeight } = props;
  const sliderStyle = {
    //height: (200 + 'px'),
    //backgroundColor: 'red'
  };

  return (
    <Slider ref={selector} className={`${className || ""}`} style={sliderStyle} {...settings} >

      {children}



    </Slider>
  );
}
