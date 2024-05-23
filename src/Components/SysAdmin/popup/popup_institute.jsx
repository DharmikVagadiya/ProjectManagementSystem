import React, { useEffect, useState } from 'react';
import { serverTimestamp } from '@firebase/firestore';

import '../../../CSS/common/popup.css';

import { useAlert } from '../../common/message';
import Btn from '../../common/btn';
import { eDesignation, eMsg } from '../../enums';

import { InsertData, SelectDataById, UpdateData } from '../../../Database/db_helper';
import { IsEmpty, IsEmail, IsPhone } from '../../../Database/validation';
import { Person, Institute, dbCollections } from '../../../Database/tables';

export default function PopupInstitute({ Type, onClose, Id }) {
  const showMsg = useAlert();

  const [Name, setName] = useState('');
  const [Email, setEmail] = useState('');
  const [Phone, setPhone] = useState('');

  const updateName = (e) => { setName(e.target.value); }
  const updateEmail = (e) => { setEmail(e.target.value); }
  const updatePhone = (e) => { setPhone(e.target.value); }

  const IsValid = () => {
    if (IsEmpty(Name)) {
      showMsg(eMsg.Info, 'Name is Required.');
      return false;
    }

    if (IsEmpty(Email)) {
      showMsg(eMsg.Info, 'Email is Required.');
      return false;
    }
    else if (!IsEmail(Email)) {
      showMsg(eMsg.Info, 'Email is invalid.');
      return false;
    }

    if (IsEmpty(Phone)) {
      showMsg(eMsg.Info, 'Phone is Required.');
      return false;
    }
    else if (!IsPhone(Phone)) {
      showMsg(eMsg.Info, 'Phone Number is Invalid.');
      return false;
    }

    return true;
  }

  const SaveData = async () => {
    if (!IsValid()) {
      return;
    }

    const person = { ...Person };
    person.Email = Email;
    person.ContactNo = Phone;
    person.Name = Name;
    person.UpdateTime = serverTimestamp();

    if (Type === 'Edit') {
      await UpdateData(dbCollections.Person, Id, person);

      showMsg(eMsg.Success, 'Institute Updated Successfully.');
    }
    else {

      person.eDesignation = eDesignation.Admin;
      person.InsertTime = serverTimestamp();

      const PersonId = await InsertData(dbCollections.Person, person);

      const inst = { ...Institute };
      inst.PersonId = PersonId;
      inst.InsertTime = serverTimestamp();

      const InstituteId = await InsertData(dbCollections.Institute, inst);
      person.InstituteId = InstituteId;
      await UpdateData(dbCollections.Person, PersonId, person);

      showMsg(eMsg.Success, 'Institute Inserted Successfully.');
    }
    onClose();
  }

  useEffect(() => {
    if (Type === 'Edit') {
      const fetchData = async () => {
        try {
          const objIntitute = await SelectDataById('Person', Id);

          if (objIntitute !== undefined && objIntitute !== null) {
            setName(objIntitute.Name);
            setEmail(objIntitute.Email);
            setPhone(objIntitute.ContactNo);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, []);

  return (
    <div className='popup-bg'>
      <div className='popup-body my-auto row mx-auto col-lg-3 col-md-4 col-sm-6 col-xs-12'>
        <div className='form-group'>
          <div className='popup-header w-full'>
            <div className='align-right'>
              <button onClick={() => onClose()} className='btn-close'>x</button>
            </div>
            <div className='popup-title'>
              <h3 className='mt-0'>{Type} Institute</h3>
            </div>
          </div>
        </div>
        <div className='form-group'>
          <div className='col-lg-3 col-md-3 col-sm-6 col-xs-12 my-auto'>
            <label className='control-label'>Name<i className='text-denger'>&nbsp;*</i></label>
          </div>
          <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
            <input type='text' value={Name} onChange={updateName} className='form-control'></input>
          </div>
        </div>
        <div className='form-group'>
          <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Email<i className='text-denger'>&nbsp;*</i></label>
          <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
            <input type='text' value={Email} onChange={updateEmail} className='form-control'></input>
          </div>
        </div>
        <div className='form-group'>
          <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Phone<i className='text-denger'>&nbsp;*</i></label>
          <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
            <input type='text' value={Phone} onChange={updatePhone} className='form-control'></input>
          </div>
        </div>
        <div className='mt-20px'>
          {/* <button className='btn-save' onClick={() => SaveData()}>Save</button> */}
          <Btn Class='btn-save' onClick={SaveData} Name='Save'></Btn>
          <button className='btn-cancel ml-10px' onClick={() => onClose()}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
