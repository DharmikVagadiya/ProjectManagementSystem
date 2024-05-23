import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';

import Btn from '../common/btn';
import { useLoginDetails } from '../Login/login';
import { useAlert } from '../common/message';
import { eMsg } from '../enums';

import { dbCollections, Team, TeamStudent, Notifications } from '../../Database/tables';
import { DataFetch, InsertData, SelectData, SelectDataById, UpdateData } from '../../Database/db_helper';
import { serverTimestamp } from '@firebase/firestore';


export default function Notificationbar() {
    const navigate = useNavigate();
    const { loginDetails } = useLoginDetails();
    const showMsg = useAlert();

    const [ShowNotify, setShowNotify] = useState(false);

    const [lstNoti, setlstNoti] = useState([]);

    const JoinTeam = async (NotificationId, LeaderPersonId, GroupId) => {
        try {
            const objGroup = await SelectDataById(dbCollections.ProjectGroup, GroupId);
            if (objGroup) {

                const tmpTeam = { ...Team };
                tmpTeam.LeaderPersonId = LeaderPersonId;
                tmpTeam.ProjectGroupId = GroupId;

                const objTeam = await SelectData(dbCollections.Team, tmpTeam);
                if (objTeam.length > 0) {
                    if (parseInt(objGroup.MaxStudent) > objTeam[0].TotalStudents) {
                        // Add Student in Team
                        const objTeamStud = { ...TeamStudent };
                        objTeamStud.TeamId = objTeam[0].id;
                        objTeamStud.PersonId = loginDetails.PersonId;
                        objTeamStud.InsertPersonId = loginDetails.PersonId;
                        objTeamStud.ProjectGroupId = GroupId;
                        objTeamStud.InsertTime = serverTimestamp();

                        await InsertData(dbCollections.TeamStudent, objTeamStud);

                        // Update Team Data
                        const objTeam2 = { ...Team };
                        objTeam2.TotalStudents = objTeam[0].TotalStudents + 1;
                        await UpdateData(dbCollections.Team, objTeam[0].id, objTeam2);

                        showMsg(eMsg.Success, 'Join Team Successfully.');
                    }
                    else {
                        showMsg(eMsg.Error, 'Team already reach at Max Student limit, So you can not join this Team.');
                    }
                }
                else {
                    showMsg(eMsg.Error, 'Team is not created, So you can not join this team.');
                }
            }
            else {
                showMsg(eMsg.Error, 'Project Group Not Found.');
            }

            Cancel(NotificationId);
        } catch (error) {

        }
    }

    const Cancel = async (Id) => {
        await UpdateData(dbCollections.Notifications, Id, { IsReceived: true });
    }

    const CancleNotify = async (Id, LeaderPersonId) => {

        const objNoti = { ...Notifications };
        objNoti.ReceiverPersonId = LeaderPersonId;
        objNoti.IsReceived = false;
        objNoti.SenderPersonId = loginDetails.PersonId;
        objNoti.Message = loginDetails.Name + ' Rejected your Request.';
        objNoti.InsertTime = serverTimestamp();

        await UpdateData(dbCollections.Notifications, Id, { IsReceived: true });

        await InsertData(dbCollections.Notifications, objNoti);
    }

    const getTime = (Time) => {
        const time = Time.toDate();
        const hours = time.getHours();
        const minutes = time.getMinutes();

        // const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

        const ampm = hours >= 12 ? 'pm' : 'am';

        const displayHours = hours % 12 || 12;

        const formattedTime = `${displayHours}:${formattedMinutes} ${ampm}`;
        return formattedTime;
    }

    useEffect(() => {
        DataFetch(dbCollections.Notifications, { ReceiverPersonId: loginDetails.PersonId, IsReceived: false }, setlstNoti);
    }, []);

    const logout = () => {
        loginDetails.IsLogin = false;
        loginDetails.Name = '';
        loginDetails.Designation = '0';
        loginDetails.PersonId = '';

        Cookies.set('IsLogin', false);

        navigate('../login');
    }

    return (
        <div className='notification'>
            <div className='d-flex'>
                <i className='fa fa-bell icon-notification' onClick={() => setShowNotify(!ShowNotify)}></i>
                <label className='counter'>{lstNoti.length}</label>
                <i className='fa fa-power-off ml-10px' onClick={logout}></i>
            </div>
            <div className={`notifications ${ShowNotify ? '' : 'hidden'}`}>
                <h3 className='m-0' style={{ color: 'gray' }}>Notification</h3>
                <hr style={{ width: '100%', color: 'gray' }} />
                {lstNoti.map((item, index) => (
                    <div key={index}>
                        <div>
                            <div className='d-flex w-full'>
                                <h4 className='mb-10px'>{item.Message}</h4>
                                {/* <label className='align-right lbl-close' onClick={() => CancleNotify(item.id, null, null)}>x</label> */}
                                {!item.GroupId && (<Btn Class='align-right lbl-close' onClick={() => Cancel(item.id)}>x</Btn>)}
                            </div>
                            <label>{getTime(item.InsertTime)}</label>
                            {item.GroupId && (
                                <>
                                    <Btn Class='align-right btn-join' onClick={() => JoinTeam(item.id, item.SenderPersonId, item.GroupId)} Name='Join'></Btn>
                                    <Btn Class='align-right btn-cancel-join mr-10px' onClick={() => CancleNotify(item.id, item.SenderPersonId)} Name='Cancel'></Btn>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
