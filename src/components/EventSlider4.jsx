// EventSlider4.jsx

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import "../public/css/App.css";
import "../public/css/Animation.css";

// ... props remain the same ...

const EventSlider4 = ({
    data,
    isStartAtRim = false,
    intervalTime = 2000,
    isFullWidthCard = false,
    width = '100%',
    ratio = 0,
    maxWidth = "1280px",
    cardWidth = 250,
    detailHeight = '100%',
    imageHeight = '550px',
    cardBorderRadius = 15,
    cardMargin = 10,
    cardShadowHover = 'none',
    cardShadow = 'none',
    showDetail = false,
    showInnerDetail = false,
    showRightDetail = false,
    showTopDetail = false,
    dotColorSelected = "white",
    dotColorUnselected = "rgba(255,255,255,.4)",
    bottomPadding = 20,
    topPadding = 20,
    autoplay = false,
    allMargin = '0',
    allPadding = '0',
    showDot = false,
    showPrevNextButtons = false, 
    prevNextButtonStyle = {},
    onCardClick = (item, index) => { },
    detailElement = (item, index) => { <></> },
    detailInnerElement = (item, index) => { <></> },
    detailRightElement = (item, index) => { <></> },
    detailTopElement = (item, index) => { <></> },
    windowSize = { width: window.innerWidth, height: window.innerHeight }
}) => {
    const targetRef = useRef();
    const desiredLength = 25;
    const [currentEvent, setCurrentEvent] = useState(-1); // Set initial value to -1
    const [extendedArray, setExtendedArray] = useState([]);
    const [mainWidth, setMainWidth] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const elementRef = useRef();
    var intervalId;
    const cB = { width: '9px', height: '9px', backgroundColor: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' };
    const cC = { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0px 0px 20px 0px' };
    const prev_next_button = {
        position: `absolute`, top: `50%`, transform: `translateY(-50%)`, fontSize: `24px`, background: `#000000`,
        border: `none`, color: `#ffffff`, cursor: `pointer`, padding: `10px`, zIndex: `2`
    };

    useEffect(() => {
        if (targetRef.current) {
            setMainWidth(targetRef.current.offsetWidth);
        }
    }, [windowSize]);

    useEffect(() => {
        if (data && data.length > 0) {
            const newExtendedArray = [];
            for (let i = 0; i < desiredLength; i++) {
                newExtendedArray.push({
                    ...data[Math.abs((i + currentEvent) % data.length)],
                    currentImageIndex: 0,
                    nextImageIndex: 0,
                    opacity: 0
                });
            }
            setExtendedArray(newExtendedArray);
        }
    }, [data, currentEvent]);

    useEffect(() => {
        if (autoplay) {
            intervalId = setInterval(() => {
                recreateArray(1);
            }, intervalTime);
        }
        return () => clearInterval(intervalId);
    }, [currentEvent, data]);

    useEffect(() => {
        const interval = setInterval(() => {  
            if (!isTransitioning) {
                setIsTransitioning(true);
                
                // Start transition
                setExtendedArray(prevArray =>
                    prevArray.map(event => ({
                        ...event,
                        nextImageIndex: (event.currentImageIndex + 1) % event.gallery.length,
                        opacity: 1
                    }))
                );

                // After transition completes
                setTimeout(() => {
                    setExtendedArray(prevArray =>
                        prevArray.map(event => ({
                            ...event,
                            currentImageIndex: event.nextImageIndex,
                            opacity: 0
                        }))
                    );
                    setIsTransitioning(false);
                }, 1000);
            }
        }, 5000);

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [isTransitioning]);

    const recreateArray = (delta) => {
        clearInterval(intervalId);
        const newExtendedArray = [];
        for (let i = 0; i < (desiredLength); i++) {
            newExtendedArray.push({
                ...data[(((i + currentEvent + delta) % data.length) + data.length) % data.length],
                currentImageIndex: 0,
                nextImageIndex: 0,
                opacity: 0
            });
        }
        setExtendedArray(newExtendedArray);
        setCurrentEvent((prev) => (prev + delta));
    };

    const nextEvent = () => { recreateArray(1); };
    const prevEvent = () => { recreateArray(-1); };

    return (
        <div className='container eventslide' style={{ maxWidth: maxWidth, width: width, padding: '0px', cursor: 'pointer' }} >
            <div ref={targetRef} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', overflow: 'hidden', paddingTop: `${topPadding}px`, paddingBottom: `${bottomPadding}px`,
            }}>
                <div id='cardDiv' ref={elementRef}
                    style={{
                        display: `flex`, alignItems: `center`, width: `100%`, transition: `transform 0.5s ease-in-out`,
                        transform: `translateX(${-(currentEvent + 1) * ((isFullWidthCard ? mainWidth : cardWidth) + cardMargin * 2)}px)`
                    }}>
                    {extendedArray.map((event, index) => (
                        <div
                            key={index}
                            onMouseOver={(e) => { e.currentTarget.style.boxShadow = cardShadowHover; }}
                            onMouseOut={(e) => { e.currentTarget.style.boxShadow = cardShadow; }}
                            onClick={() => onCardClick(event, index)}
                            style={{
                                overflow: "hidden",
                                width: isFullWidthCard ? mainWidth : cardWidth,
                                marginInline: cardMargin,
                                boxShadow: cardShadow,
                                flexShrink: 0,
                                borderRadius: cardBorderRadius,
                                transform: `translateX(${(currentEvent - 1 - (isStartAtRim ? 0 : desiredLength / 2)) * ((isFullWidthCard ? mainWidth : cardWidth) + cardMargin * 2)}px)`
                            }}>
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                height: ratio == 0 ? imageHeight : isFullWidthCard ? mainWidth * ratio : cardWidth * ratio,
                                overflow: 'hidden'
                            }}>
                                {/* Current Image (Bottom Layer) */}
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${event.gallery[event.currentImageIndex].url})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center center',
                                }} />
                                
                                {/* Next Image (Top Layer) */}
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${event.gallery[event.nextImageIndex].url})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center center',
                                    opacity: event.opacity,
                                    transition: 'opacity 1s ease-in-out'
                                }} />
                            </div>

                            {/* Detail sections remain the same */}
                            {showDetail && (
                                <div style={{ height: detailHeight, backdropFilter: "blur(40px)", backgroundColor: "rgba(20,0,20,0.2)" }} key={index}>
                                    {detailElement(event, index) ?? null}
                                </div>
                            )}

                            {showInnerDetail && (
                                <div style={{ height: detailHeight, backdropFilter: "blur(40px)", background: "linear-gradient(0deg, rgba(20,0,20,0.8) 10%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0, 0, 0, 0.00) 100%)", marginTop: -100 }} key={index}>
                                    {detailInnerElement(event, index) ?? null}
                                </div>
                            )}

                            {showRightDetail && (
                                <div style={{ height: detailHeight, backdropFilter: "blur(40px)", marginTop: '-30%', marginRight: '35%', borderRadius: '0 25px 0 0' }} key={index}>
                                    {detailRightElement(event, index) ?? null}
                                </div>
                            )}

                            {showTopDetail && (
                                <div style={{ height: detailHeight, backdropFilter: "blur(40px)", marginTop: '-55%', marginRight: '35%', marginBottom: '25%', borderRadius: '0 0 25px 0' }} key={index}>
                                    {detailTopElement(event, index) ?? null}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots and navigation buttons remain the same */}
            {showDot && (
                <div style={cC}>
                    {data.map((event, index) => (
                        <button
                            key={index}
                            style={{ backgroundColor: 'transparent', border: 'none', margin: '0px', padding: '0px' }}
                            onClick={() => {
                                var currentAb = (((currentEvent + 1) % data.length) + data.length) % data.length;
                                var delta = index - currentAb;
                                if (delta != 0) {
                                    clearInterval(intervalId);
                                    const newExtendedArray = [];
                                    for (let i = 0; i < (desiredLength); i++) {
                                        var t1 = (((i + currentEvent + delta) % data.length) + data.length) % data.length;
                                        newExtendedArray.push({
                                            ...data[t1],
                                            currentImageIndex: 0,
                                            nextImageIndex: 0,
                                            opacity: 0
                                        });
                                    }
                                    setExtendedArray(newExtendedArray);
                                    setCurrentEvent((prev) => (prev + delta));
                                }
                            }}>
                            <div style={{
                                ...cB,
                                margin: '4px',
                                backgroundColor: ((((currentEvent + 1) % data.length) + data.length) % data.length) == index ? dotColorSelected : dotColorUnselected
                            }} />
                        </button>
                    ))}
                </div>
            )}
            {showPrevNextButtons && (
                <>
                    <div  style={{ ...prev_next_button, left: '0px',  ...prevNextButtonStyle }} onClick={prevEvent}> &#10094;</div>
                    <div  style={{ ...prev_next_button, right: '0px', ...prevNextButtonStyle }} onClick={nextEvent}>&#10095;</div>
                </>
            )}
        </div>
    );
};

export default EventSlider4;