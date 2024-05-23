import React, { useState, useEffect } from 'react';

import Btn from '../../common/btn';
import { useAlert } from '../../common/message';

import { Course, dbCollections } from '../../../Database/tables';
import { UpdateData, SelectDataById, InsertData } from '../../../Database/db_helper';
import { IsEmpty, IsNumber, IsNegativeNum } from '../../../Database/validation';
import { GetEnumName, eCourse, eMsg } from '../../enums';
import Cookies from 'js-cookie';

export default function PopupCourse({ Type, ParentId, CourseId, CourseType, onClose }) {
    const showMsg = useAlert();

    const [Name, setName] = useState('');
    const [serialNo, setSerialNo] = useState('');

    const updateName = (e) => { setName(e.target.value); }
    const updateSerialNo = (e) => { setSerialNo(e.target.value); }

    const IsValid = () => {
        if (IsEmpty(Name)) {
            showMsg(eMsg.Info, 'Name is Required.');
            return false;
        }

        if (IsEmpty(serialNo)) {
            showMsg(eMsg.Info, 'SerialNo is Required.');
            return false;
        }
        else if (!IsNumber(serialNo)) {
            showMsg(eMsg.Info, 'SerialNo must be number.');
            return false;
        }
        else if (IsNegativeNum(serialNo)) {
            showMsg(eMsg.Info, 'SerialNo must be Positive Number.');
            return false;
        }

        return true;
    }

    const SaveData = async () => {
        if (!IsValid()) {
            return;
        }

        const objCourse = { ...Course };

        objCourse.Name = Name;
        objCourse.SerialNo = serialNo;
        objCourse.InstituteId = Cookies.get('InstituteId');

        if (Type === 'Edit') {
            await UpdateData(dbCollections.Course, CourseId, objCourse);

            showMsg(eMsg.Success, 'Course Updated Successfully.');
        }
        else {
            objCourse.eCourseType = CourseType;
            objCourse.ParentId = ParentId;
            await InsertData(dbCollections.Course, objCourse);
            
            showMsg(eMsg.Success, 'Course Inserted Successfully.');
        }

        onClose();
    }

    useEffect(() => {
        if (Type === 'Edit') {
            const fetchData = async () => {
                try {
                    const objCourse = await SelectDataById(dbCollections.Course, CourseId);

                    if (objCourse !== undefined && objCourse !== null) {
                        setName(objCourse.Name);
                        setSerialNo(objCourse.SerialNo);
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
                            <h3 className='mt-0'>{Type} {GetEnumName(eCourse, CourseType)}</h3>
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
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>SerialNo<i className='text-denger'>&nbsp;*</i></label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={serialNo} onChange={updateSerialNo} className='form-control'></input>
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
