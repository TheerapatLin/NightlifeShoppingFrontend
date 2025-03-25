import React from 'react';
import { useEffect, useState, useRef } from 'react'
import "../public/css/App.css";

const EventSlider2 = (
    { data,
        isStartAtRim = false,
        intervalTime = 2000,
        isFullWidthCard = false,
        width = '100%',
        ratio = 0,
        maxWidth = "1280px",
        cardWidth = 250,
        imageHeight = '550px',
        cardBorderRadius = 15,
        cardMargin = 10,
        cardShadowHover = 'none',
        cardShadow = 'none',
        showDetail = true,
        dotColorSelected = "white",
        dotColorUnselected = "rgba(255,255,255,.4)",
        bottomPadding = 20,
        topPadding = 20,
        allMargin = '0',
        allPadding = '0',
        showDot = false,
        onCardClick = (item, index) => { },
        detailElement = (item, index) => { <></> },
        windowSize = { width: window.innerWidth, height: window.innerHeight }
        //children
    }) => {
    const targetRef = useRef();
    const desiredLength = 25;
    const [currentEvent, setCurrentEvent] = useState(1);
    const [extendedArray, setExtendedArray] = useState([]);
    const [mainWidth, setMainWidth] = useState(0);

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
        if (currentEvent && data) {
            const newExtendedArray = [];
            for (let i = 0; i < desiredLength; i++) {
                newExtendedArray.push(data[Math.abs((i + currentEvent) % data.length)]);
            }
            setExtendedArray(newExtendedArray);
        }
    }, [data]);

    useEffect(() => {
        intervalId = setInterval(() => { nextEvent(); }, intervalTime);
        return () => clearInterval(intervalId);
    }, [currentEvent, data]);

    const recreateArray = (delta) => {
        clearInterval(intervalId);
        const newExtendedArray = [];
        for (let i = 0; i < (desiredLength); i++) {
            newExtendedArray.push(data[(((i + currentEvent + delta) % data.length) + data.length) % data.length]);
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
                                overflow: "hidden", width: isFullWidthCard ? mainWidth : cardWidth, marginInline: cardMargin,
                                boxShadow: cardShadow, flexShrink: 0, borderRadius: cardBorderRadius,
                                transform: `translateX(${(currentEvent - 1 - (isStartAtRim ? 0 : desiredLength / 2)) * ((isFullWidthCard ? mainWidth : cardWidth) + cardMargin * 2)}px)`
                            }}>
                            <div style={{
                                width: '100%', height: ratio == 0 ? imageHeight : isFullWidthCard ? mainWidth * ratio : cardWidth * ratio , backgroundColor: 'transparent',
                                backgroundImage: `url(${event?.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center center', padding: '0px', margin: '0px'
                            }} />
                            {showDetail && (detailElement(event, index) ?? null)}
                        </div>
                    ))}
                </div>
            </div>
            {showDot &&
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
                                        newExtendedArray.push(data[t1]);
                                    }
                                    setExtendedArray(newExtendedArray);
                                    setCurrentEvent((prev) => (prev + delta))
                                }
                            }}>
                            <div style={{
                                ...cB, margin: '4px',
                                backgroundColor: ((((currentEvent + 1) % data.length) + data.length) % data.length) == index ? dotColorSelected : dotColorUnselected
                            }} />
                        </button>
                    ))}
                </div>
            }
            <div style={{ ...prev_next_button, left: `0px` }} onClick={prevEvent}>&#10094;</div>
            <div style={{ ...prev_next_button, right: `0px` }} onClick={nextEvent}>&#10095;</div>
        </div >
    );
};

export default EventSlider2;