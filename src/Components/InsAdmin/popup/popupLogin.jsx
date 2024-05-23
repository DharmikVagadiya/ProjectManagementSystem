import React, { useState, useEffect } from 'react'
import { InsertData, SelectData, UpdateData } from '../../../Database/db_helper';
import { serverTimestamp } from '@firebase/firestore';
import { Login, dbCollections } from '../../../Database/tables';

import Btn from '../../common/btn';
import { IsEmpty } from '../../../Database/validation';
import { eMsg } from '../../enums';
import { useAlert } from '../../common/message';

export default function PopupLogin({ onClose, PersonId }) {
    const showMsg = useAlert();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginId, setLoginId] = useState(0);

    const updateUsername = (e) => { setUsername(e.target.value); }
    const updatePassword = (e) => { setPassword(e.target.value); }

    const IsValid = async () => {
        if (IsEmpty(username)) {
            showMsg(eMsg.Info, 'username is Required.');
            return false;
        }
        else {
            let objLogin = await SelectData(dbCollections.Login, { username: username });
            objLogin = objLogin.filter(Log => Log.PersonId !== PersonId);
            if (objLogin.length > 0) {
                showMsg(eMsg.Info, 'username Already Exist.');
                return false;
            }
        }

        if (IsEmpty(password)) {
            showMsg(eMsg.Info, 'Password is Required.');
            return false;
        }

        return true;
    }

    const SaveData = async () => {
        if (!await IsValid()) {
            return;
        }

        const objLogin = { ...Login };
        objLogin.username = username;
        objLogin.password = password;
        objLogin.UpdateTime = serverTimestamp();

        if (loginId !== 0) {
            UpdateData(dbCollections.Login, loginId, objLogin);
        }
        else {
            objLogin.IsAllowLogin = true;
            objLogin.PersonId = PersonId;
            objLogin.InsertTime = serverTimestamp();

            InsertData(dbCollections.Login, objLogin);
        }

        onClose();
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const objLogin = { ...Login };
                objLogin.PersonId = PersonId;

                const dtLogin = await SelectData(dbCollections.Login, objLogin);
                if (dtLogin.length > 0) {
                    setLoginId(dtLogin[0].id);
                    setUsername(dtLogin[0].username);
                    setPassword(dtLogin[0].password);
                }
            } catch (error) {

            }
        };

        fetchData();
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
                            <h3 className='mt-0'>Set Login</h3>
                        </div>
                    </div>
                </div>
                <div className='form-group'>
                    <div className='col-lg-3 col-md-3 col-sm-6 col-xs-12 my-auto'>
                        <label className='control-label'>username</label>
                    </div>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={username} onChange={updateUsername} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>password</label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={password} onChange={updatePassword} className='form-control'></input>
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
