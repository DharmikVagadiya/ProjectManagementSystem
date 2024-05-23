import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';

import '../CSS/sidebar/sidebar.css';

import { useLoginDetails } from './Login/login';
import { eDesignation } from './enums';

export default function Sidebar(prop) {
    const navigate = useNavigate();
    const { loginDetails } = useLoginDetails();

    const [ActiveIndex, setActiveIndex] = useState(0);

    const Admin = [
        ['Faculty', '/admin/faculty', 'fa fa-users'],
        ['Courses', '/admin/course', 'fa fa-th-large'],
        ['Students', '/admin/student', 'fa fa-user']
    ];

    const Faculty = [
        ['Project Group', '/admin/projectgroup', 'fa fa-sitemap'],
        ['Guided Teams', '/admin/guidedteams', 'fa fa-users'],
        ['Students Reports', '/admin/reports', 'fa fa-users']
    ];

    const SupAdmin = [
        ['Institute', '/admin/institutes', 'fa fa-users']
    ];

    const [menus, setMenus] = useState([]);

    useEffect(() => {
        if (prop.Designation === eDesignation.SupAdmin)
            setMenus(SupAdmin);
        else if (prop.Designation === eDesignation.Admin)
            setMenus(Admin);
        else if (prop.Designation === eDesignation.Faculty)
            setMenus(Faculty);
        else
            setMenus([]);
    }, [prop.Designation]);

    const logout = () => {
        loginDetails.IsLogin = false;
        loginDetails.Name = '';
        loginDetails.Designation = '0';
        loginDetails.PersonId = '';

        Cookies.set('IsLogin', false);

        navigate('../login');
    }

    return (
        <>
            <div>
                {menus.map(([Name, url, icon], index) => (
                    // <div key={index} className={`${ActiveIndex === index ? 'active' : 'deactive'} mb-5px`} onClick={() => setActiveIndex(index)} style={{ padding: '12px', borderRadius: '5px', backgroundColor: 'lightgray' }}>
                    <Link key={index} to={url} className={`${ActiveIndex === index ? 'active' : 'deactive'} mb-5px tab`} onClick={() => setActiveIndex(index)}>
                        <label className='ml-10px menu-titles'>{Name}</label>
                        <i className={`align-right ${icon}`} style={{ fontSize: '15px' }}></i>
                    </Link>
                    // </div>
                ))}
                <a className='mb-5px tab' onClick={() => logout()}>
                    <label className='ml-10px menu-titles'>Logout</label>
                    <i className={`align-right fa fa-sign-out`} style={{ fontSize: '15px' }}></i>
                </a>
            </div>
        </>
    )
}
