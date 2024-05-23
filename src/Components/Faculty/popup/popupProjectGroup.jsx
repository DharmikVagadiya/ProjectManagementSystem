import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { serverTimestamp } from '@firebase/firestore';

import { InsertData, UpdateData, SelectDataById } from '../../../Database/db_helper';
import { dbCollections, ProjectGroup } from '../../../Database/tables';
import { IsEmpty, IsNumber, IsNegativeNum } from '../../../Database/validation';
import { useAlert } from '../../common/message';
import { eMsg } from '../../enums';
import Btn from '../../common/btn';

export default function PopupProjectGroup({ Id, SectionId, onClose, Type }) {

    const showMsg = useAlert();

    const [Name, setName] = useState('');
    const [SerialNo, setSerialNo] = useState('');
    const [MaxStudent, setMaxStudent] = useState('');
    const [EndDate, setEndDate] = useState('');

    const updateName = (e) => { setName(e.target.value); }
    const updateSerialNo = (e) => { setSerialNo(e.target.value); }
    const updateMaxStudent = (e) => { setMaxStudent(e.target.value); }
    const updateEndDate = (e) => { setEndDate(e.target.value); }

    const IsValid = () => {
        if (IsEmpty(Name)) {
            showMsg(eMsg.Info, 'Name is Required.');
            return false;
        }

        if (IsEmpty(SerialNo)) {
            showMsg(eMsg.Info, 'SerialNo is Required.');
            return false;
        }
        else if (!IsNumber(SerialNo)) {
            showMsg(eMsg.Info, 'SerialNo is Number.');
            return false;
        }
        else if (IsNegativeNum(SerialNo)) {
            showMsg(eMsg.Info, 'SerialNo must be positive.');
            return false;
        }

        if (IsEmpty(MaxStudent)) {
            showMsg(eMsg.Info, 'Max Student is Required.');
            return false;
        }
        else if (!IsNumber(MaxStudent)) {
            showMsg(eMsg.Info, 'Max Student is Number.');
            return false;
        }
        else if (IsNegativeNum(MaxStudent)) {
            showMsg(eMsg.Info, 'MaxStudent must be positive.');
            return false;
        }

        return true;
    }

    const SaveData = async () => {
        if (IsValid()) {
            const objGroup = { ...ProjectGroup };
            const PersonId = Cookies.get('PersonId');

            objGroup.GroupName = Name;
            objGroup.SerialNo = SerialNo;
            objGroup.MaxStudent = MaxStudent;
            objGroup.EndDate = EndDate;
            objGroup.UpdatePersonId = PersonId;
            objGroup.UpdateTime = serverTimestamp();

            if (Type === 'Edit') {
                UpdateData(dbCollections.ProjectGroup, Id, objGroup);
                showMsg(eMsg.Success, 'Group Updated Successfully.');
            }
            else {
                objGroup.SectionId = SectionId;
                objGroup.InsertPersonId = PersonId;

                InsertData(dbCollections.ProjectGroup, objGroup);
                showMsg(eMsg.Success, 'Group Inserted Successfully.');
            }

            onClose();
        }
    }

    useEffect(() => {
        if (Type === 'Edit') {
            const fetchData = async () => {
                try {
                    const objGroup = await SelectDataById(dbCollections.ProjectGroup, Id);

                    if (objGroup !== undefined && objGroup !== null) {
                        setName(objGroup.GroupName);
                        setSerialNo(objGroup.SerialNo);
                        setMaxStudent(objGroup.MaxStudent);
                        setEndDate(objGroup.EndDate);
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
            <div className='popup-body my-auto row mx-auto col-lg-4 col-md-4 col-sm-6 col-xs-12'>
                <div className='form-group'>
                    <div className='popup-header w-full'>
                        <div className='align-right'>
                            <button onClick={() => onClose()} className='btn-close'>x</button>
                        </div>
                        <div className='popup-title'>
                            <h3 className='mt-0'>{Type} Group</h3>
                        </div>
                    </div>
                </div>
                <div className='form-group'>
                    <div className='col-lg-3 col-md-3 col-sm-6 col-xs-12 my-auto'>
                        <label className='control-label'>Name<i className='text-denger'>*</i></label>
                    </div>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={Name} onChange={updateName} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>SerialNo<i className='text-denger'>*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={SerialNo} onChange={updateSerialNo} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Max Students<i className='text-denger'>*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={MaxStudent} onChange={updateMaxStudent} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>End Time</label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='datetime-local' value={EndDate} onChange={updateEndDate} className='form-control'></input>
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
