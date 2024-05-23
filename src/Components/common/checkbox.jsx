import React from 'react'

import '../../CSS/common/checkbox.css';

export default function checkbox({ onClick, IsChecked, Name }) {
    return (
        <div onClick={onClick}>
            <label className={`toggle ${IsChecked ? 'checked' : ''}`}>
                <input type="checkbox" />
                <span className="slider"></span>
            </label>
            <label className='ml-10px' style={{ fontSize: '11px' }}>{Name}</label>
        </div>
    )
}
