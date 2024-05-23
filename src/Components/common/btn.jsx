import React, { useState } from 'react';

export default function Btn({ Class, Name, onClick, children }) {

    const [IsLoad, setIsLoad] = useState(false);

    const btnClick = async () => {
        setIsLoad(true);
        try {
            await onClick();
            setIsLoad(false);
        }
        catch {
            setIsLoad(false);
        }
    }

    return (
        <button className={Class} onClick={() => btnClick()} disabled={IsLoad}>
            {IsLoad ? (<i className='fa fa-circle-o-notch fa-spin mr-5px'></i>) : (children)}
            {Name}
        </button>
    )
}