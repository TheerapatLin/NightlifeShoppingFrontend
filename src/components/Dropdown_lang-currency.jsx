import React from 'react'
import '../public/css/Dropdown.css'

const Dropdown = () => {
  return (
    <div className="dropdown">
        <button className='item01'>
        ฿THB
        <i className="bi bi-chevron-down"></i>
        </button>
        <div className="dropdown-content">
            <ul>
            <li>$USD</li>
            </ul>
        </div>
    </div>
  );
};

export default Dropdown;
