import React, { useState, useEffect } from 'react'
import { useLoginDetails } from '../Login/login';
import Btn from '../common/btn';

import { eDesignation } from '../enums';
import { DeleteData, SelectData, sortByField } from '../../Database/db_helper';
import { dbCollections, Person } from '../../Database/tables';

import PopupFaculty from './popup/popup_faculty';
import PopupLogin from './popup/popupLogin';

export default function Faculty() {
  const { loginDetails } = useLoginDetails();

  const [popupFaculty, setPopupFaculty] = useState(false);
  const [dataFaculties, setFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');

  const AddFaculty = () => {
    setPopupFaculty(<PopupFaculty Type='Add' onClose={closePopup} Id={0} />);
  };

  const EditFaculty = (id) => {
    setPopupFaculty(<PopupFaculty Type='Edit' onClose={closePopup} Id={id} />);
  };

  const DeleteFaculty = async (PersonId, LoginId) => {
    await DeleteData(dbCollections.Person, PersonId);

    if (LoginId !== null) {
      DeleteData(dbCollections.Login, LoginId);
    }
  };

  const setLogin = (id) => {
    setPopupFaculty(<PopupLogin onClose={closePopup} PersonId={id} />);
  };

  const onSearch = (e) => { setSearchText(e.target.value); }

  const closePopup = () => {
    setPopupFaculty('');
    refreshData();
  }

  const refreshData = async () => {
    try {
      const objPerson = { ...Person };
      objPerson.eDesignation = eDesignation.Faculty;
      objPerson.InstituteId = loginDetails.InstituteId;

      const dtFaculty = await SelectData(dbCollections.Person, objPerson);
      const dtLogin = await SelectData(dbCollections.Login, {});

      const combinedData = dtFaculty.map(person => ({
        ...person,
        login: dtLogin.find(login => login.PersonId === person.id) || null
      }));

      sortByField(combinedData, 'Name');
      setFaculties(combinedData);
    } catch (error) {

    }
  }

  useEffect(() => { refreshData(); }, [loginDetails.InstituteId]);

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
                <button className='btn-edit' onClick={() => EditFaculty(item.id)}><i className='fa fa-edit'></i>&nbsp;Edit</button>
                <button className='btn-delete ml-10px' onClick={() => DeleteFaculty(item.id, item.login ? item.login.id : null)}><i className='fa fa-trash-o'></i>&nbsp;Delete</button>
                <button className='btn-login ml-20px' onClick={() => setLogin(item.id)}>
                  <i className='fa fa-eye-slash'></i>
                  <label className='ml-10px'>Login</label>
                </button>
              </div>
            </td>
          </tr>
        );
      } else {
        return null;
      }
    });
  };

  return (
    <>
      <div className='divInstitute'>
        <div className='breadcrumb mb-30px'>
          <h3 className='m-0'>Faculties</h3>
        </div>
        <div className='inst-content'>
          <div className='divtitle mb-30px'>
            <button className='btn btn-add' onClick={() => AddFaculty()}>
              <i className='fa fa-plus'></i>
              <label className='lblbtn ml-10px'>Add Faculty</label>
            </button>
            <Btn Class='btn ml-10px btn-refresh' onClick={refreshData} Name='Refresh'>
              <i className='fa fa-refresh mr-10px'></i>
            </Btn>
            {/* <button className='btn ml-10px btn-refresh' onClick={() => refreshData()}>
              <i className='fa fa-refresh'></i>
              <label className='lblbtn ml-10px'>Refresh</label>
            </button> */}
            <div className='align-right mt-5px d-flex'>
              {/* <div className='w-full my-auto'>
                <span>&lt;</span>
                <label> 5 to 20 </label>
                <span>&gt;</span>
              </div> */}
              <input type='text' className='form-control ml-10px' placeholder='Search...' onChange={onSearch}></input>
            </div>
          </div>
          <div className='div-table'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>username</th>
                  <th>Password</th>
                  {/* <th>Allow Login?</th> */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {renderData(dataFaculties)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {popupFaculty}
    </>
  )
}
