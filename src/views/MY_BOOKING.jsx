//MY_BOOKING.jsx

import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../public/css/App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import userData from '../../public/data/data_user.json';
import eventData from '../../public/data/data_event.json';
import imgCoin from '../img/Profile/coin.png';
import imgExchange from '../img/Profile/Exchange_money_for_coins.png';
import imgQrcode from '../img/Profile/qrcode.png';
import imgChampagne from '../img/Profile/champagne-glass.png';
import MenuLeft from '../components/MenuLeft';

function MyBooking() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [deals, setDeals] = useState([]);

  const [showPopup, setShowPopup] = useState(true);

   // สร้าง state เพื่อเก็บค่าของ input
   const [inputValue, setInputValue] = useState('');

   // function เมื่อมีการเปลี่ยนแปลงค่าของ input
  //  const handleChange = (event) => {
  //    setInputValue(event.target.value);
  //  }

  // State for first name, last name, email
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userGender, setUserGender] = useState('');

  // State for date of birth
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
   
   useEffect(() => {
     if (user) {
       setFirstName(user.firstName || '');
       setLastName(user.lastName || '');
       setUserEmail(user.userEmail || '');
       setUserGender(user.userGender || '');
     }
   }, [user]);
   
  // Function to handle changes in first name, last name, and email
  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };
  
  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };
  
  const handleUserEmailChange = (event) => {
    setUserEmail(event.target.value);
  };

  const handleUserGender = (event) => {
    setUserGender(event.target.value);
  };

  // Function to handle changes in day, month, and year
  const handleDayChange = (event) => {
    setDay(event.target.value);
  };
  
  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };
  
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  
  useEffect(() => {
    const userId = "U00005";
    const currentUser = userData.find(user => user.userID === userId);
    setUser(currentUser);

    if (currentUser) {
      const [userDay, userMonth, userYear] = currentUser.userBirthDay.split("/");
      setDay(userDay || ''); 
      setMonth(userMonth.trim() || ''); 
      setYear(userYear || '');
    }

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

  }, []);

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
            MY BOOKING
          </i>
          <div style={{ marginLeft: "auto" }}></div>
        </div>
        <div className='container-menuLeft' style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 25, marginTop: 30, height: 1400 }}>
          <MenuLeft/>
          <div>
            <div className="popup-content Profile" style={{ display:'flex', background: 'rgba(206, 206, 206, 0.5)', width:'100%' }}>
              <div>
                <div className="EventSlideHeaderText1">MY PROFILE</div>
                <div className="photo-profile" style={{ position:'relative', zIndex:'999',paddingBlock:10}}>
                  {user && (<img
                    src={user.profileImage}
                    alt="Profile"
                    className="profile-image col66"
                    style={{ width:'100px', height: '100px', borderRadius:'50%',boxShadow: 'rgb(38, 57, 77) 0px 20px 30px -10px' }}
                  />)}
                  <p className="edit-imgPhoto">
                    <i className="bi bi-pencil-square"></i>
                  </p>
                </div>
                {user && (
                  <div>
                    <p style={{ padding: 10 }}>Phone</p>
                    <p>0{user.userPhone}</p>
                  </div>
                )}
              </div>
              <div className="profile-user" style={{ flex: 1, paddingLeft:'5%'}}>
                {user && (
                  <div>
                    <h2 style={{display:'flex', paddingTop: '5px'}}>First name</h2>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={handleFirstNameChange} 
                      placeholder="Enter text here" 
                      style={{
                        color: '#31ff64', 
                        fontSize: 20, 
                        backgroundColor: 'rgb(43, 43, 43)', 
                        boxShadow: '0px 30px 60px -12px rgb(5 5 38) inset, 0px 18px 36px -18px rgba(0, 0, 0, 0.63) inset', // เงา
                        border: 'none', 
                        padding: '10px', 
                        borderRadius: '25px', 
                        width: '100%', 
                        boxSizing: 'border-box',
                        marginBottom:25,
                      }}
                    />
                    <h2 style={{display:'flex'}}>Last name</h2>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={handleLastNameChange} 
                      placeholder="Enter text here" 
                      style={{
                        color: '#31ff64', 
                        fontSize: 20, 
                        backgroundColor: 'rgb(43, 43, 43)', 
                        boxShadow: '0px 30px 60px -12px rgb(5 5 38) inset, 0px 18px 36px -18px rgba(0, 0, 0, 0.63) inset', // เงา
                        border: 'none', 
                        padding: '10px', 
                        borderRadius: '25px', 
                        width: '100%', 
                        boxSizing: 'border-box',
                        marginBottom:25,
                      }}
                    />
                    <h2 style={{display:'flex'}}>Email</h2>
                    <input 
                      type="text" 
                      value={userEmail} 
                      onChange={ handleUserEmailChange} 
                      placeholder="Enter text here" 
                      style={{
                        color: '#31ff64', 
                        fontSize: 20, 
                        backgroundColor: 'rgb(43, 43, 43)', 
                        boxShadow: '0px 30px 60px -12px rgb(5 5 38) inset, 0px 18px 36px -18px rgba(0, 0, 0, 0.63) inset', // เงา
                        border: 'none', 
                        padding: '10px', 
                        borderRadius: '25px', 
                        width: '100%', 
                        boxSizing: 'border-box',
                        marginBottom:25,
                      }}
                    />
                    {/* Dropdowns for day, month, and year */}
                    <h2 style={{display:'flex'}}>Date of Birth</h2>
                    <div style={{display:'flex'}}>
                      <select 
                        value={day} 
                        onChange={handleDayChange}  
                        style={{
                          color: '#31ff64', 
                          fontSize: 20, 
                          backgroundColor: 'rgb(43, 43, 43)', 
                          boxShadow: '0px 30px 60px -12px rgb(5 5 38) inset, 0px 18px 36px -18px rgba(0, 0, 0, 0.63) inset', // เงา
                          border: 'none', 
                          padding: '10px', 
                          borderRadius: '25px', 
                          width: '50%', 
                          boxSizing: 'border-box',
                          marginBottom:25,
                        }}
                      >
                        {/* Options for day */}
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day}>{day}</option>
                        ))}
                      </select>
                      <select 
                        value={month} 
                        onChange={handleMonthChange} 
                        style={{
                          color: '#31ff64', 
                          fontSize: 20, 
                          backgroundColor: 'rgb(43, 43, 43)', 
                          boxShadow: '0px 30px 60px -12px rgb(5 5 38) inset, 0px 18px 36px -18px rgba(0, 0, 0, 0.63) inset', // เงา
                          border: 'none', 
                          padding: '10px', 
                          borderRadius: '25px', 
                          width: '100%', 
                          boxSizing: 'border-box',
                          marginBottom:25,
                          marginInline:20,
                        }}
                      >
                        {/* Options for month */}
                        {[
                          "January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"
                        ].map((month) => (
                          <option key={month}>{month}</option>
                        ))}
                      </select>
                      <select 
                        value={year} 
                        onChange={handleYearChange} 
                        style={{
                          color: '#31ff64', 
                          fontSize: 20, 
                          backgroundColor: 'rgb(43, 43, 43)', 
                          boxShadow: '0px 30px 60px -12px rgb(5 5 38) inset, 0px 18px 36px -18px rgba(0, 0, 0, 0.63) inset', // เงา
                          border: 'none', 
                          padding: '10px', 
                          borderRadius: '25px', 
                          width: '50%', 
                          boxSizing: 'border-box',
                          marginBottom:25,
                        }}
                      >
                        {/* Options for year */}
                        {Array.from({ length: 100 }, (_, i) => 1925 + i).map((year) => (
                          <option key={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dropdowns for gender*/}
                    <h2 style={{display:'flex'}}>Gender</h2>
                    <select 
                      value={userGender} 
                      onChange={handleUserGender} 
                      style={{
                        color: '#31ff64', 
                        fontSize: 20, 
                        backgroundColor: 'rgb(43, 43, 43)', 
                        boxShadow: '0px 30px 60px -12px rgb(5 5 38) inset, 0px 18px 36px -18px rgba(0, 0, 0, 0.63) inset', // เงา
                        border: 'none', 
                        padding: '10px', 
                        borderRadius: '25px', 
                        width: '100%', 
                        boxSizing: 'border-box',
                        marginBottom:25,
                      }}
                    >
                      {/* Options for gender */}
                      {[
                        "Unknown", "Male", "Female", "LGBTQIA+",
                      ].map((userGender) => (
                        <option key={userGender}>{userGender}</option>
                      ))}
                    </select>

                    {/* Save */}
                    <div>
                      <button
                        style={{
                          width:'50%',
                          borderRadius:'25px'
                        }}>
                          Save
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default MyBooking
