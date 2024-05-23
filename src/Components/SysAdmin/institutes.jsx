import React, { useEffect, useState } from 'react';

import Btn from '../common/btn';

import { SelectData } from '../../Database/db_helper';
import { eDesignation } from '../enums';

import PopupInstitute from './popup/popup_institute';
import PopupLogin from '../InsAdmin/popup/popupLogin';

export default function Institutes() {

  const [popupInstitute, setPopupInstitute] = useState(false);
  const [InstituteData, setInstituteData] = useState([]);
  const [searchText, setSearchText] = useState('');

  const InsertInstitute = () => {
    setPopupInstitute(<PopupInstitute Type='Add' onClose={closePopup} Id={0} />);
  }

  const EditInstitute = (id) => {
    setPopupInstitute(<PopupInstitute Type='Edit' onClose={closePopup} Id={id} />);
  };

  const closePopup = () => {
    setPopupInstitute('');
    refreshData();
  }

  const refreshData = async () => {
    const dtPerson = await SelectData('Person', { eDesignation: eDesignation.Admin });
    const dtLogin = await SelectData('login', {});

    const combinedData = dtPerson.map(person => ({
      ...person,
      login: dtLogin.find(login => login.PersonId === person.id) || null
    }));

    setInstituteData(combinedData);
  }

  useEffect(() => { refreshData(); }, []);

  const setLogin = (id) => {
    setPopupInstitute(<PopupLogin onClose={closePopup} PersonId={id} />);
  }

  const renderData = (data) => {
    return data.map(item => {
      if (searchText === '' || item.Name.toLowerCase().includes(searchText.toLowerCase())) {
        return (
          <tr key={item.id}>
            <td>{item.Name}</td>
            <td>{item.Email}</td>
            <td>{item.ContactNo}</td>
            <td>{item.login ? item.login.username : ''}</td>
            <td>{item.login ? item.login.password : ''}</td>
            <td>
              <div className='d-flex'>
                <button className='btn-edit' onClick={() => EditInstitute(item.id)}>
                  <i className='fa fa-edit'></i>
                  <label className='ml-10px'>Edit</label>
                </button>
                <button className='ml-20px d-flex btn-login' onClick={() => setLogin(item.id)}>
                  <i className='fa fa-eye-slash'></i>
                  <label className='ml-10px'>Login</label>
                </button>
              </div>
            </td>
          </tr>
        )
      }
    });
  };

  return (
    <>
      <div className='divInstitute'>
        <div className='breadcrumb mb-30px'>
          <h3 className='m-0'>Institutes</h3>
        </div>
        <div className='inst-content'>
          <div className='divtitle mb-30px'>
            <button className='btn-add' onClick={() => InsertInstitute()} style={{ padding: '10px', borderRadius: '5px', border: '1px solid' }}>
              <i className='fa fa-plus'></i>
              <label className='lblbtn ml-10px'>Add Institute</label>
            </button>
            <Btn Class='btn ml-10px btn-refresh' onClick={refreshData} Name='Refresh'>
              <i className='fa fa-refresh mr-10px'></i>
            </Btn>
            {/* <button className='btn-refresh ml-10px' onClick={() => refreshData()} style={{ padding: '10px', borderRadius: '5px', border: '1px solid' }}>
              <i className='fa fa-refresh'></i>
              <label className='lblbtn ml-10px'>Refresh</label>
            </button> */}
            <div className='align-right mt-5px d-flex'>
              {/* <div className='w-full my-auto'>
                <span>&lt;</span>
                <label> 5 to 20 </label>
                <span>&gt;</span>
              </div> */}
              <input type='text' className='form-control ml-10px' value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder='Search...'></input>
            </div>
          </div>
          <div className='div-table'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>username</th>
                  <th>password</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className='tbody'>
                {renderData(InstituteData)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {popupInstitute}
    </>
  )
}
