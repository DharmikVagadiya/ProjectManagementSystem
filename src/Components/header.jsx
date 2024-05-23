import React from 'react';

import { useLoginDetails } from './Login/login';

import { eDesignation } from './enums';
import NotificationBar from './Student/notificationbar';

export default function Header() {
    const { loginDetails } = useLoginDetails();

    return (
        <div className='align-right d-flex'>
            {loginDetails.Designation === eDesignation.Student && (<NotificationBar />)}
            <div className='header-profile ml-30px d-flex'>
                <h4 className='profile-name ml-10px my-auto'>{loginDetails.Name}</h4>
            </div>
        </div>
    )
}
