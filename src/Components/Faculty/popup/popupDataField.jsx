import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { serverTimestamp } from '@firebase/firestore';

import Btn from '../../common/btn';

import { eFieldType, eMsg } from '../../enums';
import { GetDownloadURL, InsertData, UpdateData, UploadFile } from '../../../Database/db_helper';
import { TeamData, dbCollections } from '../../../Database/tables';
import { IsEmpty } from '../../../Database/validation';
import { useAlert } from '../../common/message';

export default function PopupDataField({ FieldDataId, FieldType, FieldName, GroupName, TeamId, FieldId, Ans, onClose }) {

    const showMsg = useAlert();
    const [Answer, setAnswer] = useState('');
    const [IsCompulsory, setIsCompulsory] = useState(false);

    const updateAnswer = (e) => {
        if (FieldType === eFieldType.Fileupload) {
            setAnswer(e.target.files[0]);
        }
        else {
            setAnswer(e.target.value);
        }
    }

    const IsValid = () => {
        if (IsEmpty(Answer)) {
            if (FieldType === eFieldType.Fileupload) {
                showMsg(eMsg.Info, 'File is Required.');
            }
            else {
                showMsg(eMsg.Info, 'Answer Required.');
            }
            return false;
        }

        return true;
    }

    const SaveData = async () => {
        if (!IsValid()) {
            return;
        }

        const PersonId = Cookies.get('PersonId');
        const objTeamData = { ...TeamData };
        objTeamData.UpdatePersonId = PersonId;
        objTeamData.UpdateTime = serverTimestamp();

        if (FieldType === eFieldType.Fileupload) {
            const Path = `GroupFiles/${GroupName}`;
            const URL = await UploadFile(Answer, Path);

            if (URL !== '') {
                objTeamData.FilePath = await GetDownloadURL(URL);
                if (FieldDataId === null) {
                    objTeamData.TeamId = TeamId;
                    objTeamData.FieldId = FieldId;
                    objTeamData.InsertPersonId = PersonId;
                    objTeamData.InsertTime = serverTimestamp();

                    await InsertData(dbCollections.TeamData, objTeamData);
                }
                else {
                    await UpdateData(dbCollections.TeamData, FieldDataId, objTeamData);
                }

                showMsg(eMsg.Success, 'File Uploaded Successfully.');
            }
        }
        else {
            objTeamData.Answer = Answer;
            if (FieldDataId === null) {
                objTeamData.TeamId = TeamId;
                objTeamData.FieldId = FieldId;
                objTeamData.InsertPersonId = PersonId;
                objTeamData.InsertTime = serverTimestamp();

                await InsertData(dbCollections.TeamData, objTeamData);
            }
            else {
                await UpdateData(dbCollections.TeamData, FieldDataId, objTeamData);
            }
            showMsg(eMsg.Success, 'Data Updated Successfully.');
        }

        onClose();
    }

    useEffect(() => {
        if (FieldType !== eFieldType.Fileupload && FieldDataId !== null) {
            setAnswer(Ans);
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
                            <h3 className='mt-0'>Edit Field</h3>
                        </div>
                    </div>
                </div>
                <div className='form-group'>
                    <div className='col-lg-3 col-md-3 col-sm-6 col-xs-12 my-auto'>
                        <label className='control-label'>{FieldName}{IsCompulsory && <i className='text-denger'>*</i>}</label>
                    </div>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        {
                            FieldType === eFieldType.Fileupload ? <input type='file' onChange={updateAnswer} className='form-control'></input>
                                : <input type='text' value={Answer} onChange={updateAnswer} className='form-control'></input>
                        }
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
