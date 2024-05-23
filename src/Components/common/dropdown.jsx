import React from 'react'

export default function dropdown({ className, Name, items, onSelectChange, Value }) {
    const handleSelectChange = (event) => {
        onSelectChange(event.target.value);
    };

    const loadItems = (item) => {
        return (item ? item.map(([itm, value], index) => (
            <option key={index} value={value}>{itm}</option>
        )) : '');
    };

    return (
        <select className={`list-box form-control ${className}`} value={Value} onChange={handleSelectChange}>
            <option value={0}>Select {Name}</option>
            {loadItems(items)}
        </select>
    )
}