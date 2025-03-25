import { useEffect, useState } from 'react'
import '../public/css/App.css'
import "bootstrap-icons/font/bootstrap-icons.css"
import Nightlife from '../img/NightLife_logo_1.png'
import Nightlife2 from '../img/NightLife_logo_2.png'
import EventSlider from '../components/EventSlider'

function News() {
  const [eventData, setEventData] = useState([]);
  const [eventData2, setEventData2] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/data.json');
        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      try {
        const response = await fetch('/data/data2.json');
        const data = await response.json();
        setEventData2(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  // ตั้งค่าระยะเวลาในการเปลี่ยนการเลือกรายการ (ms)

  return (
    <div>
        <div className='container' style={{ paddingTop: '70px' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'center' }}>
            <div className='EventSlideHeaderText1'>Recommended Events</div>
            <div className='EventSlideHeaderText2'>view all &gt;</div>
          </div>
        </div>

        <EventSlider
          data={eventData2}
          intervalTime={4000}
          cardShadow={'0 0 20px 0px rgba(0,0,0,.15)'}
          cardWidth={450}
          imageHeight={247}
          cardShadowHover={'0 0 20px 1px rgba(255,52,210,1)'}
          showDot={true}
          onCardClick={(data, index) => {
            alert(`คุณคลิกการ์ดที่ ${index}`);
            alert(`คุณคลิกการ์ดที่ ${JSON.stringify(data, null, 2)}`);
          }}
        />

        <EventSlider
          data={eventData}
          intervalTime={2000}
          bottomPadding={20}
          // cardShadow={'0 0 20px 0px rgba(0,0,0,.45)'}
          cardShadowHover={'0 0 20px 1px rgba(255,255,255,1)'}
          showDot={true}
          onCardClick={(data, index) => {
            alert(`คุณคลิกการ์ดที่ ${index}`);
            //...เขียนการทำงานเพิ่มเติมตรงนี้ได้เลย
          }}
          detailElement={(data, index) => (
            <div
              style={{ backdropFilter: 'blur(40px)', backgroundColor: 'rgba(20,0,20,0.2)' }}
              key={index}
            >
              <h3 className='item03' style={{ color: 'white', padding: '5px 0px 5px 20px' }}><b>{data?.caption ?? ""}</b></h3>
              <p className='item03' style={{ color: '#31ff64', padding: '0px 0px 0px 20px', fontSize: '12px' }}><i className="bi bi-calendar3"></i> {data?.date ?? ""}</p>
              <p className='item03' style={{ color: '#31ff64', padding: '0px 0px 0px 20px', fontSize: '12px' }}><i className="bi bi-clock"></i> {data?.time ?? ""}</p>
              <p className='item03' style={{ color: '#31ff64', padding: '0px 0px 15px 20px', fontSize: '12px' }}><i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}</p>
            </div>
          )}
        />
    </div>
  )
}

export default News
