import React from 'react'
import GooglePlay from '../img/google_play.png'
import AppStore from '../img/app_store.png'
import '../public/css/Footer.css'

function Footer() {
  return (
    <footer className="footer" style={{ padding: '0px', margin: '0px' }}>
      <center>
        <div className='container' style={{ padding: '0px', margin: '0px', maxWidth: 'min(1280px,90%)' }}>
          <div className="footer-service" style={{ padding: '0px', margin: '0px' }}>
            <div className='container col' style={{ maxWidth:'150%'}}>
              <h4>HealWorld.me</h4>

            </div>
            <div className='container col'>
              <h4>Main item</h4>
              <p href="#" style={{ display: 'block', marginBlock: 20 }}>News Events</p>
              <p href="#" style={{ display: 'block', marginBlock: 20 }}>All Events</p>
              <p href="#" style={{ display: 'block', marginBlock: 20 }}>Activity Gallery</p>
            </div>
            <div className='container col'>
              <h4>About us</h4>
              <p href="#" style={{ display: 'block', marginBlock: 20 }}>About us</p>
              <p href="#" style={{ display: 'block', marginBlock: 20 }}>Terms of service</p>
              <p href="#" style={{ display: 'block', marginBlock: 20 }}>Privacy Policy</p>
            </div>
            <div className='container col'>
              <h4>Customer Relations Department</h4>
              <p style={{ display: 'block', marginBlock: 20 }}>Tel. 085-514-3211</p>
              <p style={{ display: 'block', marginBlock: 20 }}>Line : @healworld_me</p>
              <p style={{ display: 'block', marginBlock: 20 }}>Mon - Sat 10 a.m. - 6 p.m.</p>
            </div>
          </div>
          <div className="footer-container">
            <p>&copy; 2024 HealWorld.me All rights reserved.</p>
          </div>
        </div>
      </center>
    </footer>
  )
}

export default Footer;
