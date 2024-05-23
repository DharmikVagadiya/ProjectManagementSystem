import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { serverTimestamp } from '@firebase/firestore';
import Cookies from 'js-cookie';

import { useLoginDetails } from '../Login/login';
import { SelectData, InsertData, UploadFile, GetDownloadURL } from '../../Database/db_helper';
import { Team, Notifications, TeamData, TeamStudent, dbCollections } from '../../Database/tables';
import { useAlert } from '../common/message';

import Header from '../header';
import Dropdown from '../common/dropdown';
import GroupFields from './groupFields';
import LoadTeamStudents from './loadTeamStudents';
import { eMsg } from '../enums';
import Btn from '../common/btn';

export default function Dashboard() {
  const showMsg = useAlert();
  const navigate = useNavigate();

  const { loginDetails, setLoginDetails } = useLoginDetails();
  const [ProjectName, setProjectName] = useState('');
  const [ProjectGroupId, setProjectGroupId] = useState('0');
  const [lstStudents, setlstStudents] = useState('');
  const [lstFields, setlstFields] = useState('');
  const [lstProjectGroups, setlstProjectGroups] = useState([]);
  const [lstAnswers, setlstAnswers] = useState([]);
  const [selectedStud, setSelectedStud] = useState([]);
  const [TeamId, setTeamId] = useState('0');

  const [EndTime, setEndTime] = useState('');

  const updateProjectName = (e) => { setProjectName(e.target.value); }

  const checkLogin = () => {
    let IsLogin = Cookies.get('IsLogin');
    IsLogin = IsLogin ? IsLogin.toLowerCase() : '';
    const Designation = Cookies.get('Designation');
    let Name = Cookies.get('Name');
    Name = Name ? Name.replace('%20', ' ') : Name;
    const PersonId = Cookies.get('PersonId');

    if (IsLogin !== 'true' && !loginDetails.IsLogin) {
      navigate('/login');
    }
    else if (!loginDetails.IsLogin) {
      setLoginDetails({
        IsLogin: IsLogin.toLowerCase() === 'true',
        Designation: parseInt(Designation),
        Name: Name,
        PersonId: PersonId
      });
    }
  }

  useEffect(() => {
    checkLogin();
    loadProjectGroup();
  }, []);

  useEffect(() => {
    if (loginDetails.PersonId) {
      selectedStud.push([0, loginDetails.PersonId]);
    }
  }, [loginDetails]);

  const getTeamId = async () => {
    try {
      let tmpTeamId = '0';
      const objStudTeam = await SelectData(dbCollections.TeamStudent, { ProjectGroupId: ProjectGroupId, PersonId: loginDetails.PersonId });
      if (objStudTeam.length > 0) {
        tmpTeamId = objStudTeam[0].TeamId;
      }

      setTeamId(tmpTeamId);
      return tmpTeamId;
    }
    catch {
      setTeamId('0');
      return '0';
    }
  }

  const loadProjectGroup = async () => {
    const objStud = await SelectData(dbCollections.Student, { PersonId: Cookies.get('PersonId') });
    const dtProjectGroups = await SelectData(dbCollections.ProjectGroup, { SectionId: objStud[0].CourseId });
    const lstGroups = dtProjectGroups.map(item => [item.GroupName, item.id]);
    setlstProjectGroups(lstGroups);
  }

  const IsValid = () => {
    lstAnswers.forEach(Ans => {
      if (Ans[3] === true && !Ans[1]) {
        showMsg(eMsg.Info, 'Please fill all Required Field.');
        return false;
      }
    })

    return true;
  }

  const updateProjectGroup = (id) => {
    setProjectGroupId(id);
    setTeamId('0');
  }

  const SaveData = async () => {

    if (!IsValid()) {
      return;
    }

    let tmpTeamId = TeamId;
    if (tmpTeamId || tmpTeamId === '0') {
      tmpTeamId = await getTeamId();
    }

    // Insert Team if Team not exist.
    if (tmpTeamId === '0') {
      selectedStud.sort((a, b) => a[0] - b[0]);

      const objTeam = { ...Team };
      objTeam.LeaderPersonId = selectedStud[0][1];
      objTeam.ProjectName = ProjectName;
      objTeam.ProjectGroupId = ProjectGroupId;
      objTeam.TotalStudents = 1;
      objTeam.InsertPersonId = loginDetails.PersonId;
      objTeam.InsertTime = serverTimestamp();
      objTeam.UpdatePersonId = loginDetails.PersonId;
      objTeam.UpdateTime = serverTimestamp();

      tmpTeamId = await InsertData(dbCollections.Team, objTeam);

      selectedStud.forEach(item => {

        if (item[1] === loginDetails.PersonId) {
          const objTeamStud = { ...TeamStudent };
          objTeamStud.TeamId = tmpTeamId;
          objTeamStud.PersonId = item[1];
          objTeamStud.InsertPersonId = loginDetails.PersonId;
          objTeamStud.ProjectGroupId = ProjectGroupId;
          objTeamStud.InsertTime = serverTimestamp();

          InsertData(dbCollections.TeamStudent, objTeamStud);
        }
        else {
          const objNotification = { ...Notifications };
          objNotification.SenderPersonId = loginDetails.PersonId;
          objNotification.ReceiverPersonId = item[1];
          objNotification.GroupId = ProjectGroupId;
          const GroupName = lstProjectGroups.find(item => item[1] === ProjectGroupId)[0];
          objNotification.Message = `${loginDetails.Name} Send Request to join there "${GroupName}" Project Group.`;
          objNotification.IsReceived = false;
          objNotification.InsertTime = serverTimestamp();

          InsertData(dbCollections.Notifications, objNotification);
        }
      });
    }

    // Insert answers of students.
    lstAnswers.forEach(async (item) => {
      const objTeamdata = { ...TeamData };
      objTeamdata.FieldId = item[0];
      objTeamdata.TeamId = tmpTeamId;
      objTeamdata.InsertPersonId = loginDetails.PersonId;
      objTeamdata.InsertTime = serverTimestamp();
      objTeamdata.UpdatePersonId = loginDetails.PersonId;
      objTeamdata.UpdateTime = serverTimestamp();

      // if Answer is in file formate.
      if (item[2] === 'file') {
        const GroupName = lstProjectGroups.find(itm => itm[1] === ProjectGroupId)[0];
        const Path = `GroupFiles/${GroupName}`;
        const URL = await UploadFile(item[1], Path);

        if (URL !== '') {
          objTeamdata.FilePath = await GetDownloadURL(URL);
        }
        console.log(URL);
      }
      // if Answer is in text formate.
      else {
        objTeamdata.Answer = item[1];
      }

      InsertData(dbCollections.TeamData, objTeamdata);
    });

    showMsg(eMsg.Success, 'Data Saved Successfully.');
    setProjectGroupId(0);
  }

  return (
    <div className='main-panel' style={{ display: 'flex' }}>
      <div className='body-panel w-full' style={{ height: '100vh' }}>
        <div className='header-panel' style={{ alignItems: 'center' }}>
          <Header />
        </div>
        <div className='content-panel'>
          <div className='student-title mb-30px'>
            {EndTime !== null && EndTime !== '' ? (
              <div className='align-right d-flex'>
                <h4 className='m-10px'>End Date : </h4> <label className='m-10px'>{EndTime}</label>
              </div>
            ) : ''}
            <div className='col-lg-2 col-md-3 col-sm-4 col-xs-12'>
              <Dropdown Name='Project Group' items={lstProjectGroups} Value={ProjectGroupId} onSelectChange={updateProjectGroup} />
            </div>
          </div>
          <div className='mb-20px'>
            <div className='table' style={{ overflow: 'auto', height: '64vh' }}>

              <LoadTeamStudents
                ProjectGroupId={ProjectGroupId}
                setEndTime={setEndTime}
                getTeamId={getTeamId}
                ProjectName={ProjectName}
                setProjectName={setProjectName}
                selectedStud={selectedStud}
                setSelectedStud={setSelectedStud}
                lstStudents={lstStudents}
                setlstStudents={setlstStudents}
              />

              {ProjectGroupId !== '0' && ProjectGroupId !== null ?
                <div className='d-flex mb-10px'>
                  <div className='col-lg-3 col-md-4 col-sm-6 col-xs-12'>
                    <h5 className='control-label m-10px'>Project Name</h5>
                  </div>
                  <div className='col-lg-9 col-md-8 col-sm-6 col-xs-12 pt-10px'>
                    {TeamId && TeamId !== '0' ?
                      <label className='form-control d-block'>{ProjectName}</label>
                      :
                      <input type='text' className='form-control' placeholder='Enter Project Name...' value={ProjectName} onChange={updateProjectName}></input>
                    }
                  </div>
                </div> : ''}

              <GroupFields
                ProjectGroupId={ProjectGroupId}
                getTeamId={getTeamId}
                lstAnswers={lstAnswers}
                setlstAnswers={setlstAnswers}
                lstFields={lstFields}
                setlstFields={setlstFields} />

            </div>
          </div>
          <div className='w-full d-flex'>
            {ProjectGroupId !== '0' && ProjectGroupId !== null ? <Btn Class='btn-save mx-auto' onClick={() => SaveData()} Name='Save'></Btn> : ''}
          </div>
        </div>
      </div>
    </div>
  )
}