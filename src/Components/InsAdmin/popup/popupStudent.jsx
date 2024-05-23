import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { serverTimestamp } from '@firebase/firestore';

import Btn from '../../common/btn';
import { useAlert } from '../../common/message';

import { Person, Student, dbCollections } from '../../../Database/tables';
import { eDesignation, eMsg } from '../../enums';
import { InsertData, SelectDataById, UpdateData } from '../../../Database/db_helper';
import { IsEmail, IsEmpty, IsPhone } from '../../../Database/validation';

export default function PopupStudent({ Type, onClose, PersonId, SectionId, StudentId }) {
    const showMsg = useAlert();

    const [Name, setName] = useState('');
    const [RollNo, setRollNo] = useState('');
    const [Email, setEmail] = useState('');
    const [Phone, setPhone] = useState('');

    const updateName = (e) => { setName(e.target.value); }
    const updateRollNo = (e) => { setRollNo(e.target.value); }
    const updateEmail = (e) => { setEmail(e.target.value); }
    const updatePhone = (e) => { setPhone(e.target.value); }

    const IsValid = () => {
        if(IsEmpty(Name)){
            showMsg(eMsg.Info, 'Name is Required.');
            return false;
        }

        if(IsEmpty(RollNo)){
            showMsg(eMsg.Info, 'RollNo is Required.');
            return false;
        }

        if(Email && !IsEmail(Email)){
            showMsg(eMsg.Info, 'Email is Invalid.');
            return false;
        }

        if(Phone && !IsPhone(Phone)){
            showMsg(eMsg.Info, 'Phone number is Invalid.');
            return false;
        }

        return true;
    }

    const SaveData = async () => {
        if(!IsValid()){
            return;
        }

        const objPerson = { ...Person };
        objPerson.Name = Name;
        objPerson.Email = Email;
        objPerson.ContactNo = Phone;
        objPerson.UpdateTime = serverTimestamp();

        const objStud = { ...Student };
        objStud.CourseId = SectionId;
        objStud.RollNo = RollNo;
        objStud.UpdateTime = serverTimestamp();

        if (Type === 'Edit') {
            await UpdateData(dbCollections.Person, PersonId, objPerson);
            await UpdateData(dbCollections.Student, StudentId, objStud);

            showMsg(eMsg.Success, 'Student Updated Successfully.');
        }
        else {
            objPerson.InstituteId = Cookies.get('InstituteId');
            objPerson.eDesignation = eDesignation.Student;
            objPerson.InsertTime = serverTimestamp();
            
            const newPersonId = await InsertData(dbCollections.Person, objPerson);
            
            objStud.PersonId = newPersonId;
            await InsertData(dbCollections.Student, objStud);

            showMsg(eMsg.Success, 'Student Inserted Successfully.');
        }

        onClose();
    }

    useEffect(() => {
        if (Type === 'Edit') {
            const fetchData = async () => {
                try {
                    const objPerson = await SelectDataById(dbCollections.Person, PersonId);

                    if (objPerson !== undefined && objPerson !== null) {
                        setName(objPerson.Name);
                        setEmail(objPerson.Email);
                        setPhone(objPerson.ContactNo);
                    }

                    const objStudent = await SelectDataById(dbCollections.Student, StudentId);

                    if (objStudent !== undefined && objStudent !== null) {
                        setRollNo(objStudent.RollNo);
                    }
                } catch (error) {
                    
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
                            <h3 className='mt-0'>{Type} Student</h3>
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
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>RollNo<i className='text-denger'>&nbsp;*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={RollNo} onChange={updateRollNo} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Email</label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={Email} onChange={updateEmail} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Phone</label>
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
