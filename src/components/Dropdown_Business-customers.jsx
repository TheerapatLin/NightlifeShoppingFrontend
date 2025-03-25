import React from 'react'
import "bootstrap-icons/font/bootstrap-icons.css"

const Dropdown = () => {
  return (
    <div className="dropdown">
        <button className='item01'>
        Business customers
        <i className="bi bi-chevron-down"></i>
        </button>
        <div className="dropdown-content">
            <ul>
            <li style={{padding:20}}><i className="bi bi-plus-circle"></i> Create a page with nightlife</li>
            <li style={{padding:20}}><i className="bi bi-clipboard-check"></i> Our services</li>
            <li style={{padding:20}}><i className="bi bi-credit-card-fill"></i> Service fee</li>
            <li style={{padding:20}}><i className="bi bi-person-plus-fill"></i> Apply for service</li>
            </ul>
        </div>
    </div>
  );
};

export default Dropdown;
