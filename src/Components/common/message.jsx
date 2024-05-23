import React, { useContext, createContext, useState } from 'react';
import '../../CSS/common/message.css';
import { eMsg } from '../enums';

const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

export default function Message({ children }) {
    const [message, setMessage] = useState(null);
    const [Show, setShow] = useState(false);
    const [Icon, setIcon] = useState('');
    const [Type, setType] = useState('');

    const showMsg = (Type, message) => {
        if (Type === eMsg.Success) {
            setMessage(message);
            setShow(true);
            setIcon('fa-check-circle');
            setType('success');
        }
        else if (Type === eMsg.Info) {
            setMessage(message);
            setShow(true);
            setIcon('fa-info-circle');
            setType('info')
        }
        else {
            setMessage(message);
            setShow(true);
            setIcon('fa-exclamation-triangle');
            setType('error');
        }

        setTimeout(() => {
            setShow(false);
            setMessage('');
            setIcon('');
        }, 5000);
    }

    return (
        <>
            <AlertContext.Provider value={showMsg}>
                {children}
            </AlertContext.Provider>

            <div className={`alert col-lg-2 col-md-2 col-sm-4 col-xs-6 d-flex ${Show ? 'alert-' + Type : 'hidden'}`} onClick={() => setShow(false)}>
                <i className={`icon-alert fa ${Icon}`}></i>
                <label className='ml-10px'>{message}</label>
            </div>
        </>
    )
}
