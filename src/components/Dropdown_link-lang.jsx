import React from 'react'
import Th from '../img/th_icon.png'
import Uk from '../img/uk_icon.png'
import Cn from '../img/cn_icon.png'


const Dropdown = () => {
  return (
    <div className="dropdown">
        <button className='item01'>
        <img
            src={Th}
            alt="Thailand"
            style={{ width: 'auto', height: '18px', marginRight: '5px', border: '1px solid #fff', borderRadius: '10px' }}
        />
        TH
        <i className="bi bi-chevron-down"></i>
        </button>
        <div className="dropdown-content">
            <ul>
            <li>
                <img
                    src={Uk}
                    alt="United Kingdom"
                    style={{ width: 'auto', height: '18px', marginRight: '5px', border: '1px solid #fff', borderRadius: '10px' }}
                />
                UK
            </li>
            <li>
                <img
                    src={Cn}
                    alt="CN"
                    style={{ width: 'auto', height: '18px', marginRight: '5px', border: '1px solid #fff', borderRadius: '10px' }}
                />
                CN
            </li>
            </ul>
        </div>
    </div>
  );
};

export default Dropdown;
