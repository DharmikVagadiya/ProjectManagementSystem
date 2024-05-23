import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { serverTimestamp } from '@firebase/firestore';

import { eFieldType, eMsg } from '../../enums';
import { useAlert } from '../../common/message';

import Dropdown from '../../common/dropdown';
import Checkbox from '../../common/checkbox';
import Btn from '../../common/btn';

import { ProjectField, dbCollections } from '../../../Database/tables';
import { SelectDataById, InsertData, UpdateData } from '../../../Database/db_helper';
import { IsEmpty, IsNegativeNum, IsNumber, IsSelected } from '../../../Database/validation';

export default function PopupField({ Type, FieldId, onClose, GroupId }) {
    const showMsg = useAlert();

    const [Name, setName] = useState('');
    const [SerialNo, setSerialNo] = useState('');
    const [fieldType, setFieldType] = useState('');
    const [EndDate, setEndDate] = useState('');
    const [IsCompulsory, setIsCompulsory] = useState(false);
    const [lstFieldType, setlstFieldType] = useState([]);

    const updateName = (e) => { setName(e.target.value); }
    const updateSerialNo = (e) => { setSerialNo(e.target.value); }
    const updateEndDate = (e) => { setEndDate(e.target.value); }
    const updateCompulsory = () => { setIsCompulsory(!IsCompulsory); }

    const IsValid = () => {
        if (IsEmpty(Name)) {
            showMsg(eMsg.Info, 'Name is Required.');
            return false;
        }

        if (!IsSelected(fieldType)) {
            showMsg(eMsg.Info, 'Type is Required.');
            return false;
        }

        if (IsEmpty(SerialNo)) {
            showMsg(eMsg.Info, 'SerialNo is Required.');
            return false;
        }
        else if (!IsNumber(SerialNo)) {
            showMsg(eMsg.Info, 'SerialNo must be Number.');
            return false;
        }
        else if (IsNegativeNum(SerialNo)) {
            showMsg(eMsg.Info, 'SerialNo must be Positive Number.');
            return false;
        }

        if (IsEmpty(EndDate)) {
            showMsg(eMsg.Info, 'Expire Time is Required.');
            return false;
        }

        return true;
    }

    const SaveData = async () => {
        if (IsValid()) {
            const PersonId = Cookies.get('PersonId');
            const objField = { ...ProjectField };

            objField.FieldName = Name;
            objField.SerialNo = SerialNo;
            objField.eFieldType = fieldType;
            objField.IsCompulsory = IsCompulsory;
            objField.EndTime = EndDate;
            objField.UpdatePersonId = PersonId;
            objField.UpdateTime = serverTimestamp();

            if (Type === 'Edit') {
                await UpdateData(dbCollections.ProjectField, FieldId, objField);
                showMsg(eMsg.Success, 'Field Updated Successfully.');
            }
            else {
                objField.ProjectGroupId = GroupId;
                objField.InsertPersonId = PersonId;

                await InsertData(dbCollections.ProjectField, objField);
                showMsg(eMsg.Success, 'Field Inserted Successfully.');
            }

            onClose();
        }
    }

    useEffect(() => {
        if (Type === 'Edit') {
            const fetchData = async () => {
                try {
                    const objFields = await SelectDataById(dbCollections.ProjectField, FieldId);

                    if (objFields !== undefined && objFields !== null) {
                        setName(objFields.FieldName);
                        setSerialNo(objFields.SerialNo);
                        setFieldType(objFields.eFieldType);
                        setEndDate(objFields.EndTime);
                        setIsCompulsory(objFields.IsCompulsory);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchData();
        }

        setlstFieldType(Object.entries(eFieldType).map(([fieldName, fieldValue]) => [fieldName, fieldValue]));
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
                            <h3 className='mt-0'>{Type} Field</h3>
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
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Type<i className='text-denger'>*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <Dropdown Name='FieldType' items={lstFieldType} Value={fieldType} onSelectChange={setFieldType} />
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>SerialNo<i className='text-denger'>*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={SerialNo} onChange={updateSerialNo} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Expire Time<i className='text-denger'>*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='datetime-local' value={EndDate} onChange={updateEndDate} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Is Compulsory<i className='text-denger'>*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <Checkbox Name='' IsChecked={IsCompulsory} onClick={updateCompulsory} />
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