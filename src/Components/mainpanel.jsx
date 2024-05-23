import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Cookies from 'js-cookie';

import '../CSS/Content/mainpanel.css';
import './functions';

import logo from '../Images/smo_logo.png'

import Sidebar from './sidebar';
import Content from './content';
import Header from './header';
import { useLoginDetails } from './Login/login';
import { SelectDataById } from '../Database/db_helper';
import { dbCollections } from '../Database/tables';

export default function Mainpanel() {
    const { loginDetails, setLoginDetails } = useLoginDetails();

    const [InstituteName, setInstituteName] = useState('');

    const navigate = useNavigate();

    const checkLogin = () => {
        if (!loginDetails.IsLogin) {
            let IsLogin = Cookies.get('IsLogin');
            IsLogin = IsLogin ? IsLogin.toLowerCase() : '';
            const Designation = Cookies.get('Designation');
            let Name = Cookies.get('Name');
            Name = Name ? Name.replace(/%20/g, ' ') : Name;
            const PersonId = Cookies.get('PersonId');
            const InstituteId = Cookies.get('InstituteId');

            if (IsLogin !== 'true' && !loginDetails.IsLogin) {
                navigate('/login');
            }
            else if (!loginDetails.IsLogin) {
                setLoginDetails({
                    IsLogin: IsLogin.toLowerCase() === 'true',
                    Designation: parseInt(Designation),
                    Name: Name,
                    PersonId: PersonId,
                    InstituteId: InstituteId
                });
            }
        }
    }

    useEffect(() => {
        checkLogin();
    });

    useEffect(() => {
        const setInstitute = async () => {
            try {
                const objInstitute = await SelectDataById(dbCollections.Institute, loginDetails.InstituteId);
                if (objInstitute) {
                    const objPerson = await SelectDataById(dbCollections.Person, objInstitute.PersonId);
                    if (objPerson) {
                        setInstituteName(objPerson.Name);
                    }
                }
            }
            catch {

            }
        }

        setInstitute();
    }, [loginDetails.InstituteId]);

    return (
        <div className='main-panel' style={{ display: 'flex' }}>
            <div className='side-panel col-lg-2 col-md-2'>
                <div className='mb-50px' style={{ alignItems: 'center', display: 'flex' }}>
                    <img src={logo} className='mr-5px' alt='img' style={{ width: '100%', height: 'auto' }} />
                </div>
                <Sidebar Designation={loginDetails.Designation} />
            </div>
            <div className='body-panel col-lg-10 col-md-10 col-sm-12 col-xs-12' style={{ height: '100vh' }}>
                <div className='header-panel' style={{ alignItems: 'center' }}>
                    <Header />
                    <h4 className='m-0'>{InstituteName}</h4>
                    <div className='mono-sidebar'>
                        <i className='fa fa-bars'></i>
                    </div>
                </div>
                <div className='content-panel'>
                    <Content />
                </div>
            </div>
        </div>
    )
}
