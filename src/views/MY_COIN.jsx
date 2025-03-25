//MY_COIN.jsx

import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../public/css/App.css';
import '../public/css/My_coin.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import userData from '../../public/data/data_user.json';
import eventData from '../../public/data/data_event.json';
import imgCoin from '../img/Profile/coin.png';
import imgExchange from '../img/Profile/Exchange_money_for_coins.png';
import imgQrcode from '../img/Profile/qrcode.png';
import imgChampagne from '../img/Profile/champagne-glass.png';
import MenuLeft from '../components/MenuLeft';
import coinHistoryData from '../../public/data/data_coinHistory.json';

function MyCoin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [deals, setDeals] = useState([]);

  // เพิ่ม state สำหรับการควบคุมการแสดงผลของประวัติการใช้เหรียญแต่ละประเภท
  const [showHistory, setShowHistory] = useState(true); 
  const [showEarnings, setShowEarnings] = useState(true);
  const [showSpendings, setShowSpendings] = useState(true);
  
  // ตัวแปร state เพื่อเก็บข้อมูลประวัติการใช้ coins
  const [coinHistory, setCoinHistory] = useState([]);

  useEffect(() => {
    setShowHistory(true);
    setShowEarnings(false);
    setShowSpendings(false);
  
  }, []);
  
  
  useEffect(() => {
    const userId = "U00005";
    const currentUser = userData.find(user => user.userID === userId);
    setUser(currentUser);

    if (currentUser && currentUser.myEvent) {
      const userEventIds = Array.isArray(currentUser.myEvent.eventId) ? currentUser.myEvent.eventId : [currentUser.myEvent.eventId];
      const userEvents = eventData.filter(event => userEventIds.includes(event.eventId));
      setEvents(userEvents);
    }
  
    if (currentUser && currentUser.myVenues) {
      const userVenueIds = Array.isArray(currentUser.myVenues.venueId) ? currentUser.myVenues.venueId : [currentUser.myVenues.venueId];
      const userVenues = venueData.filter(venue => userVenueIds.includes(venue.venueId));
      setVenues(userVenues);
    }

    if (currentUser && currentUser.myDeals) {
      const userDealIds = Array.isArray(currentUser.myDeals.dealsId) ? currentUser.myDeals.dealsId : [currentUser.myDeals];
      const userDeals = dealsData.filter(deals => userDealIds.includes(deals.deals))
    }

    if (coinHistoryData) {
      setCoinHistory(coinHistoryData.history);
    }

  }, []);

  // เพิ่มฟังก์ชันสำหรับเปลี่ยนสถานะการแสดงผลของประวัติการใช้เหรียญแต่ละประเภท
  const handleHistoryChange = () => {
    if (!showHistory) {
      setShowHistory(true);
      setShowEarnings(false);
      setShowSpendings(false);
    }
  };
  const handleEarningsChange = () => {
    if (!showEarnings) {
      setShowHistory(false); 
      setShowEarnings(true); 
      setShowSpendings(false);
    }
  };
  const handleSpendingsChange = () => {
    if (!showSpendings) {
      setShowHistory(false); 
      setShowEarnings(false);
      setShowSpendings(true);
    }
  };
  

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div>
      <div className="container" style={{ paddingTop: "150px", maxWidth: "90%"  }}>
        <div className="EventSlideHeaderText1">MY ACCOUNT</div>
        <div
          style={{
            color: "white",
            textShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
            fontSize: "25px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <i className="bi bi-chevron-left" style={{ fontStyle: "normal" }} onClick={handleBack}>
            {" "}
            MY COIN
          </i>
          <div style={{ marginLeft: "auto" }}></div>
        </div>

        <div className='container-menuLeft' style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 25, marginTop: 30, height: 1400 }}>
          <MenuLeft/>
          <div>
            <div className="popup-content Coin" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap:25, background: 'rgba(206, 206, 206, 0.5)', width:'100%', marginBottom:15 }}>
              <div style={{ width:'100%', flex: 1, overflow: 'auto',padding: 'inherit', backgroundColor: 'rgb(43,43,43)', borderRadius:'100px', display:'flex', justifyContent: 'space-around', boxShadow: 'rgb(5, 5, 38) 0px -20px 60px -12px inset, rgba(0, 0, 0, 0.63) 0px -20px 36px -18px inset'}}>
                <div style={{width:'90%'}}>
                  <h3 style={{color:'#fff', marginBottom:10}}><img src={imgCoin} style={{width:15}}/>{' '}REMAINING BALANCE</h3>
                  {user && (
                    <div style={{ border:'1px solid #fff', borderRadius:25, marginBottom:10 }}>
                      <h2 style={{color:'#E2346E'}}>{user.myCoin.total}{' '}</h2>
                    </div>
                  )}
                  <div style={{ display:'flex', alignItems:'end', justifyContent:'center' }}>
                    <h3 style={{ color:'#fff' }}>VALUE ฿0</h3>
                    <h4 style={{ color:'#E2346E' }}>*Coins(100 Coins = ฿1)</h4>
                  </div>
                </div>
              </div>
              <div style={{display:'flex', alignItems: 'end', justifyContent:'space-between', padding: 'inherit', borderLeft:'2px solid'}}>
                <div className="Add_Coin"><img src={imgCoin}  style={{width:50}}/><p>Add Coin</p></div>
                <div className="Scan"><img src={imgQrcode} style={{width:50}}/><p>Scan</p></div>
                <div className="Widthdraw"><img src={imgExchange} style={{width:50}}/><p>Widthdraw</p></div>
              </div>
            </div>
            <div className="popup-content coin-menu" style={{ display: 'grid', gridTemplateColumns: '1fr', gap:25, background: 'rgba(206, 206, 206, 0.5)', width:'100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap:25 }}>
                <h3 onClick={handleHistoryChange} style={{ backgroundColor: showHistory ? '#E2346E' : '', display:'flex', justifyContent:'center', paddingBlock:10, color:'#fff', borderRadius:25}}>All History</h3>
                <h3 onClick={handleEarningsChange} style={{ backgroundColor: showEarnings ? '#E2346E' : '', display:'flex', justifyContent:'center', paddingBlock:10, color:'#fff', borderRadius:25}}>Earnings</h3>
                <h3 onClick={handleSpendingsChange} style={{ backgroundColor: showSpendings ? '#E2346E' : '', display:'flex', justifyContent:'center', paddingBlock:10, color:'#fff', borderRadius:25}}>Spendings</h3>
              </div>
              {showHistory && (
                <div>
                  <div className="HisstoryCoin">
                    {/* ตรวจสอบว่ามีข้อมูลประวัติการใช้ coins หรือไม่ */}
                    {coinHistory.length > 0 ? (
                      <div>
                        {/* แสดงข้อมูลประวัติการใช้ coins */}
                        {coinHistory.map((historyItem, index) => (
                          <div key={index} className='history-item'>
                            <div style={{ display:'grid', gridTemplateColumns:'0.5fr 1fr 0.5fr' }}>
                              <p style={{ display:'flex', justifyContent:'start' , fontSize:18, marginLeft:20}}>{historyItem.date}</p>
                              {historyItem.detail && (
                                <span style={{ marginLeft:10, fontSize: 14, color: '#fff' }}>
                                  {historyItem.detail.type === 'purchase' ? 'Purchased' : 'Refunded'} at {historyItem.detail.store} for {historyItem.detail.item}
                                </span>
                              )}
                              <p style={{ display:'flex', alignItems:'center', justifyContent:'end', fontSize:18, fontWeight:'bold', marginRight:20 }}>{historyItem.amount}<img src={imgCoin} style={{ marginLeft:10,width:20,height:20 }}/></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // ถ้าไม่มีข้อมูลประวัติการใช้ coins
                      <div>No History Coin</div>
                    )}
                  </div>
                </div>
              )}
              {showEarnings && (
                <div className="EarningsCoin">
                  <div style={{color: '#fff', textAlign: 'center', padding:100 }}>No Earnings Coin</div>
                </div>
              )}
              {showSpendings && (
                <div className="EarningsCoin">
                  <div style={{color: '#fff', textAlign: 'center', padding:100 }}>No Spendings Coin</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCoin
