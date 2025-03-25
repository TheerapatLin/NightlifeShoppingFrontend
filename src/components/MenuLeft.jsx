// MenuLeft.jsx

import React, { useEffect, useState, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import userData from '../../public/data/data_user.json'
import venueData from "../../public/data/data_venue.json";
import eventData from "../../public/data/data_event.json"
import dealsData from "../../public/data/data_deal.json";
import { useGlobalEvent } from "../context/GlobalEventContext";

const MenuLeft = forwardRef((props, ref) => {
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [deals, setDeals] = useState([]);
    const location = useLocation();
  
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
        setDeals(userDeals);
      }
    }, []);

  return (
    <div ref={ref} className="popup-container menu-left" style={{ position: 'relative', marginBottom: '-180px' }}>
        <div className="popup-content Manage-profile" style={{ flex: 1, overflow: 'auto',padding: 'inherit',background: 'rgba(206, 206, 206, 0.5)', width:'100%' }}>
            <div>
                <h3 style={{ backgroundColor: location.pathname === "/ManageProfile" ? '#E2346E' : '', color: '#FFF', borderRadius: '10px 10px 0 0', display:'flex', justifyContent:'start',flexGrow: 1, paddingBlock:10, borderBottom: 'none' }}>
                    <Link to="/ManageProfile" className={`background:'#E2346E' ${location.pathname === "/ManageProfile" ? "active" : ""}`} style={{ width: '100%', display: 'flex', alignItems: 'center', marginInline:20 }}>
                        <i className="bi bi-person-fill" style={{ fontStyle:'normal'}}>{' '}Manage Profile</i>
                    </Link>
                </h3>
                <h3 style={{ display: 'flex', alignItems: 'center', backgroundColor: location.pathname === "/MyPurchase" ? '#E2346E' : '', paddingBlock: 10, color: '#fff' }}>
                    <Link to="/MyPurchase" className={`background:'#E2346E' ${location.pathname === "/MyPurchase" ? "active" : ""}`} style={{ width: '100%', display: 'flex', alignItems: 'center', marginInline:20 }}>
                        <i className="bi bi-handbag-fill" style={{ fontStyle: 'normal' }}>{' '}MY PURCHASE</i>
                        <i className="bi bi-chevron-right" style={{ marginBlock: 0, marginLeft: 'auto' }}></i>
                    </Link>
                </h3>
                <h3 style={{backgroundColor: location.pathname === "/MyTicket" ? '#E2346E' : '', display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff'}}>
                    <Link to="/MyTicket" className={`background:'#E2346E' ${location.pathname === "/MyTicket" ? "active" : ""}`} style={{ width: '100%', display: 'flex', alignItems: 'center', marginInline:20 }}>
                        <i className="bi bi-ticket-detailed-fill" style={{ fontStyle:'normal'}}>{' '}MY TICKET</i>
                        <i className="bi bi-chevron-right" style={{ marginBlock: 0, marginLeft: 'auto' }}></i>
                    </Link>
                </h3>
                <h3 style={{ backgroundColor: location.pathname === "/MyVoucher" ? '#E2346E' : '', display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff'}}>
                    <Link to="/MyVoucher" className={`background:'#E2346E' ${location.pathname === "/MyVoucher" ? "active" : ""}`} style={{ width: '100%', display: 'flex', alignItems: 'center', marginInline:20 }}>
                        <i className="bi bi-ticket-perforated-fill" style={{ fontStyle:'normal'}}>{' '}MY VOUCHER</i>
                        <i className="bi bi-chevron-right" style={{ marginBlock: 0, marginLeft: 'auto' }}></i>
                    </Link>
                </h3>
                <h3 style={{ backgroundColor: location.pathname === "/MyBooking" ? '#E2346E' : '', display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff'}}>
                    <Link to="/MyBooking" className={`background:'#E2346E' ${location.pathname === "/MyBooking" ? "active" : ""}`} style={{ width: '100%', display: 'flex', alignItems: 'center', marginInline:20 }}>
                        <i className="bi bi-journal-bookmark" style={{ fontStyle:'normal'}}>{' '}MY BOOKING</i>
                        <i className="bi bi-chevron-right" style={{ marginBlock: 0, marginLeft: 'auto' }}></i>
                    </Link>
                </h3>
                <h3 style={{ backgroundColor: location.pathname === "/MyCoin" ? '#E2346E' : '', display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff', borderBottom: 'none'}}>
                    <Link to="/MyCoin" className={`background:'#E2346E' ${location.pathname === "/MyCoin" ? "active" : ""}`} style={{ width: '100%', display: 'flex', alignItems: 'center', marginInline:20 }}>
                        <i className="bi bi-coin" style={{ fontStyle:'normal'}}>{' '}MY COIN</i>
                        <i className="bi bi-chevron-right" style={{ marginBlock: 0, marginLeft: 'auto' }}></i>
                    </Link>
                </h3>
            </div>
        </div>
        <div className="popup-content My-Venues" style={{ flex: 1, overflow: 'auto', padding: 'inherit', background: 'rgba(206, 206, 206, 0.5)', width:'100%', display: 'flex', flexDirection: 'column'}}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#2B2B2B' }}>
                <h3 style={{ color: '#FFF', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'start', flexGrow: 1, paddingBlock: 10, borderBottom: 'none' }}>
                <i className="bi bi-geo-alt-fill" style={{ marginInline: 20 }}></i>My Venue
                </h3>
                <h3 style={{ display: 'flex', justifyContent: 'start', paddingBlock: 10, borderBottom: 'none', paddingRight: 20 }}>
                <i className="bi bi-plus-lg" style={{ fontStyle: 'normal',color: 'rgb(49, 255, 100)'}}>{' '}Create Venue</i>
                </h3>
            </div>
        <div style={{ flex: 1 }}>
            {venues.length > 0 ? (
            venues.map(venue => (
                <div key={venue.venueId} className="myvenue" style={{ display:'flex', alignItems:'center', justifyContent:'flex-start'}}>
                <div
                    style={{
                    backgroundImage: `url(${venue.imageUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    width:100,
                    height:100
                    }}
                ></div>
                <h4 style={{color:'#fff', paddingInline:20}}>{venue.name}</h4>
                {/* เพิ่มข้อมูลเพิ่มเติมที่ต้องการแสดง เช่น รายละเอียดของ venues เป็นต้น */}
                </div>
            ))
            ) : (
            <div style={{ paddingInline: 25, color:'#fff' }}>No venue found</div>
            )}
        </div>
        </div>
        <div className="popup-content My-Event" style={{ flex: 1, overflow: 'auto', padding: 'inherit', background: 'rgba(206, 206, 206, 0.5)', width:'100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#2B2B2B'}}>
            <h3 style={{ color: '#FFF', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'start', flexGrow: 1, paddingBlock: 10, borderBottom: 'none' }}>
            <i className="bi bi-house-add-fill" style={{ marginInline: 20 }}></i>My Event
            </h3>
            <h3
            style={{ display: 'flex', justifyContent: 'start', paddingBlock: 10, borderBottom: 'none', paddingRight: 20, cursor: 'pointer' }}
            onClick={() => {
                // เพิ่มโค้ดสำหรับสร้างเหตุการณ์ใหม่ที่นี่
                // โดยสามารถใช้ Popup หรือ Modal เพื่อให้ผู้ใช้กรอกรายละเอียดเหตุการณ์
            }}
            >
            <i className="bi bi-plus-lg" style={{ fontStyle: 'normal', color: 'rgb(49, 255, 100)' }}>{' '}Create Event</i>
            </h3>
        </div>
        <div style={{ flex: 1 }}>
            {events.length > 0 ? (
            events.map(event => (
                <div key={event.eventId} className="myevent" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 'auto' }}>
                <div
                    style={{
                    backgroundImage: `url(${event.imageUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    width:70,
                    height:'6rem'
                    }}
                ></div>
                <h4 style={{color:'#fff', paddingInline:20}}>{event.caption}</h4>
                {/* เพิ่มข้อมูลเพิ่มเติมที่ต้องการแสดง เช่น รายละเอียดตั๋ว เป็นต้น */}
                <div>
                    <button style={{ marginRight: '10px' , backgroundColor:'#E8E100' }}><i className="bi bi-pencil-square" style={{fontStyle:'normal', color:'#000'}}> {' '}Edit </i></button>
                    <button style={{ marginRight: '10px' , backgroundColor:'#ff0000' }}><i className="bi bi-x-lg" style={{fontStyle:'normal'}}></i></button>
                </div>
                </div>
            ))
            ) : (
            <div style={{ paddingInline: 25, color:'#fff' }}>No event found</div>
            )}
        </div>
        </div>
        <div className="popup-content My-Deal" style={{ flex: 1, overflow: 'auto', padding: 'inherit', background: 'rgba(206, 206, 206, 0.5)', width:'100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#2B2B2B' }}>
            <h3 style={{ color: '#FFF', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'start', flexGrow: 1, paddingBlock: 10, borderBottom: 'none' }}>
            <i className="bi bi-house-add-fill" style={{ marginInline: 20 }}></i>My Deal
            </h3>
            <h3
            style={{ display: 'flex', justifyContent: 'start', paddingBlock: 10, borderBottom: 'none', paddingRight: 20, cursor: 'pointer' }}
            onClick={() => {
                // เพิ่มโค้ดสำหรับสร้างเหตุการณ์ใหม่ที่นี่
                // โดยสามารถใช้ Popup หรือ Modal เพื่อให้ผู้ใช้กรอกรายละเอียดเหตุการณ์
            }}
            >
            <i className="bi bi-plus-lg" style={{ fontStyle: 'normal', color: 'rgb(49, 255, 100)' }}>{' '}Create Deal</i>
            </h3>
        </div>
        <div style={{ flex: 1 }}>
            {deals.length > 0 ? (
            deals.map(deal => (
                <div key={deal.dealId} className="myvenue" style={{ display:'flex', alignItems:'center', justifyContent:'flex-start'}}>
                <div
                    style={{
                    backgroundImage: `url(${deal.imageUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    width:100,
                    height:100
                    }}
                ></div>
                <h4 style={{color:'#fff', paddingInline:20}}>{deal.name}</h4>
                </div>
            ))
            ) : (
            <div style={{ paddingInline: 25, color:'#fff' }}>No venue found</div>
            )}
        </div>
        </div>
        <div className="popup-content About-Us" style={{ flex: 1, overflow: 'auto',padding: 'inherit',background: 'rgba(206, 206, 206, 0.5)', width:'100%' }}>
        <div>
            <h3 style={{ backgroundColor: '#2B2B2B', color: '#FFF', borderRadius: '10px 10px 0 0', display:'flex', justifyContent:'start',flexGrow: 1, paddingBlock:10, borderBottom: 'none'}}><i className="bi bi-chat-dots-fill" style={{marginInline:20}}></i>About Us</h3>
            <h3 style={{display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff'}}><i className="bi bi-shield-fill-exclamation" style={{marginInline:20}}></i>PRIVACY</h3>
            <h3 style={{display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff'}}><i className="bi bi-headset" style={{marginInline:20}}></i>Contact Us</h3>
            <h3 style={{display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff', borderBottom: 'none'}}><i className="bi bi-journal-album" style={{marginInline:20}}></i>Terms of Service</h3>
            {/* <h3 style={{display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff', borderBottom: 'none'}}><i className="bi bi-box-arrow-right" style={{marginInline:20}}></i>LOG OUT</h3> */}
        </div>
        </div>
        <div className="popup-content LOG-OUT" style={{ flex: 1, overflow: 'auto',padding: 'inherit',background: 'rgba(206, 206, 206, 0.5)', width:'100%' }}>
        <div>
            <h3 style={{ backgroundColor: '#FF0000 ', color: '#FFF', borderRadius: '10px 10px 0 0', display:'flex', justifyContent:'start',flexGrow: 1, paddingBlock:10, borderBottom: 'none'}}><i className="bi bi-box-arrow-right" style={{marginInline:20}}></i>LOG OUT</h3>
        </div>
        </div>
    </div>
  );
});

export default MenuLeft;
