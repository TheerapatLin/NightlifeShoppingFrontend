// App.jsx

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './public/css/App.css';
import './public/css/Animation.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import TopNavigation from './components/TopNavigation';
import Footer from './components/Footer';
import Home from './views/Home'
import Event from './views/Event';
import Nightclub from './views/ManageProfile';
import Venues from './views/Venues';
import Deals from './views/Deals';
import News from './views/News';
import InfoEvent from './views/info_event';
import InfoVenues from './views/info_venues';
import InfoDeals from './views/info_deals';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import CartProvider from './context/CartContext';
import SignUpForm from './views/SignUp';
import Profile from './views/Profile';
import ManageProfile from './views/ManageProfile';
import MyPurchase from './views/MY_PURCHASE';
import MyTicket from './views/MY_TICKET';
import MyVoucher from './views/MY_VOUCHER'
import MyBooking from './views/MY_BOOKING';
import MyCoin from './views/MY_COIN';
import React from 'react';
import ElfsightWidget from './views/ElfsightWidget';
import Videotextnightlife from './components/Videotextnightlife';

function App() {
  return (
    <><div className="App">
      <Videotextnightlife/>
    </div><><CartProvider>
      <Router>
        <TopNavigation duration='.6s' />
        <RouteContainer />
      </Router>
    </CartProvider><div>
          <ElfsightWidget />
        </div></></>
  );
}

const MotionPage = ({ children }) => {
  useEffect (() =>{
    window.scrollTo(0, 0);
  }, []);
  return (  
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3, type:'tween'}}  >
      {children}
    </motion.div>
  );
};

function RouteContainer() {
  const location = useLocation();
  return (
    < AnimatePresence mode='wait' >
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MotionPage><Home /></MotionPage>} />
        <Route path="/event" element={<MotionPage><Event /></MotionPage>} />
        <Route path="/info_event" element={<MotionPage><InfoEvent /></MotionPage>} />
        <Route path="/nightclub" element={<MotionPage><Nightclub /></MotionPage>} />
        <Route path="/venues" element={<MotionPage><Venues /></MotionPage>} />
        <Route path="/info_venues" element={<MotionPage><InfoVenues /></MotionPage>} />
        <Route path="/deals" element={<MotionPage><Deals /></MotionPage>} />
        <Route path="/info_deals" element={<MotionPage><InfoDeals /></MotionPage>} />
        <Route path="/news" element={<MotionPage><News /></MotionPage>} />
        <Route path="/signup" element={<MotionPage><SignUpForm /></MotionPage>} />
        <Route path="/profile" element={<MotionPage><Profile /></MotionPage>}/>
        <Route path="/ManageProfile" element={<MotionPage><ManageProfile /></MotionPage>}/>
        <Route path="/MyPurchase" element={<MotionPage><MyPurchase /></MotionPage>}/>
        <Route path="/MyTicket" element={<MotionPage><MyTicket /></MotionPage>}/>
        <Route path="/MyVoucher" element={<MotionPage><MyVoucher /></MotionPage>}/>
        <Route path="/MyBooking" element={<MotionPage><MyBooking /></MotionPage>}/>
        <Route path="/MyCoin" element={<MotionPage><MyCoin /></MotionPage>}/>
      </Routes>
    </AnimatePresence >
  );
}

export default App;