import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";

const EmblaCarousel = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ...options });

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  // ✅ autoplay
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (!emblaApi.canScrollNext()) {
        emblaApi.scrollTo(0);
      } else {
        emblaApi.scrollNext();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="embla">
      <div className="embla__viewport relative" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <div
              className="embla__slide h-[50vh]"
              key={index}
              style={{ position: "relative" }}
            >
              <img
                src={slide.fileName}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* ✅ dot overlay แบบ inline */}
        <div
          style={{
            position: "absolute",
            bottom: ".5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            display: "flex",
            gap: "0.5rem",
          }}
        >
          {scrollSnaps.map((_, index) => (
            <>
              <button
                key={index}
                onClick={() => onDotButtonClick(index)}
                style={{

                  borderRadius: "9999px",
                  backgroundColor:
                    index === selectedIndex ? "#22c55e" : "white",
                  opacity: index === selectedIndex ? 1 : 0.5,
                  transition: "opacity 0.3s",
                  transform: index === selectedIndex ? "scale(0.9)" : "scale(0.6)",
                  cursor: "pointer",
                }}
              />
            </>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
