import React, { useEffect, useState } from 'react';
import { serverTimestamp } from '@firebase/firestore';

import Dropdown from '../../common/dropdown';
import { DeleteData, InsertData, SelectData, SelectDataById, UpdateData } from '../../../Database/db_helper';
import { dbCollections, Team, TeamStudent } from '../../../Database/tables';
import { eDesignation, eMsg } from '../../enums';
import Cookies from 'js-cookie';
import { IsEmpty } from '../../../Database/validation';
import { useAlert } from '../../common/message';
import Btn from '../../common/btn';

export default function PopupTeam({ Type, TeamId, onClose, GroupId }) {
    const showMsg = useAlert();

    const [ProjectName, setProjectName] = useState('');
    const [selectedStud, setSelectedStud] = useState([]);
    const [GuideId, setGuideId] = useState('');
    const [divStuds, setdivStuds] = useState([]);
    const [lstGuide, setlstGuide] = useState([]);

    const [objGroup, setGroup] = useState([]);
    const [lstStudents, setlstStudents] = useState([]);
    const [lstTeamStudent, setlstTeamStudent] = useState([]);

    //#region LoadData

    const onChangeStud = (Id, i) => {
        const updatedStud = selectedStud;
        const objtmpstud = updatedStud.find(itm => itm[0] === i);
        if (objtmpstud) {
            const index = updatedStud.indexOf(objtmpstud);
            updatedStud[index] = [i, Id];
        }
        else {
            updatedStud.push([i, Id]);
        }

        setSelectedStud(updatedStud);
        const dt = LoadStudents();
        setdivStuds(dt);
    };

    const LoadStudents = () => {
        let arrStuds = lstStudents.map(stud => (
            lstTeamStudent.filter(item => item.StudentId === stud.id).length === 0 ? [stud.person.Name, stud.person.id] : null
        ));

        const elements = [];

        for (let i = 0; i < parseInt(objGroup.MaxStudent); i++) {
            const objtmpstud = selectedStud.find(itm => itm[0] === i);
            elements.push(
                <div className='form-group' key={i}>
                    <div className='col-lg-3 col-md-3 col-sm-6 col-xs-12 my-auto'>
                        <label className='control-label'>{i === 0 ? 'Team Leader' : 'Student ' + (i + 1)}</label>
                    </div>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <Dropdown Name={i === 0 ? 'Team Leader' : 'Student ' + (i + 1)} items={arrStuds} Value={objtmpstud ? objtmpstud[1] : '0'} onSelectChange={(id) => onChangeStud(id, i)} />
                    </div>
                </div>
            )
        }

        return elements;
    };

    const loadData = async () => {
        if(!GroupId){
            onClose();
        }

        const objGroup = await SelectDataById(dbCollections.ProjectGroup, GroupId);
        setGroup(objGroup);

        let dtStudents = await SelectData(dbCollections.Student, { CourseId: objGroup.SectionId });
        const dtPerson = await SelectData(dbCollections.Person, { eDesignation: eDesignation.Student });
        const dtAllTeamStudent = await SelectData(dbCollections.TeamStudent, { ProjectGroupId: GroupId });
        const dtTeamStudent = dtAllTeamStudent.filter(item => item.TeamId === TeamId);
        setlstTeamStudent(dtTeamStudent);
        
        const dtOtherTeams = dtAllTeamStudent.filter(stud => stud.TeamId !== TeamId);
        dtOtherTeams.forEach(TStud => {
            const objstud = dtStudents.find(stud => stud.PersonId === TStud.PersonId);
            if (objstud) {
                const index = dtStudents.indexOf(objstud);
                dtStudents.splice(index, 1);
            }
        })

        dtStudents = dtStudents.map(stud => ({
            id: stud.id,
            person: dtPerson.find(p => p.id === stud.PersonId) || null
        }));
        setlstStudents(dtStudents);
    }

    useEffect(() => {
        const fun = async () => {
            const dt = LoadStudents();
            setdivStuds(dt);
        }

        fun();
    }, [lstStudents]);

    const loadGuide = async () => {
        const dtGuide = await SelectData(dbCollections.Person, { eDesignation: eDesignation.Faculty });

        const dt = [];
        dtGuide.forEach(obj => { dt.push([obj.Name, obj.id]) });
        setlstGuide(dt);
    };

    const setEditMode = async () => {
        const objTeam = await SelectDataById(dbCollections.Team, TeamId);
        const dtTeamStuds = await SelectData(dbCollections.TeamStudent, { TeamId: TeamId });


        const tmpselectedStuds = [];
        tmpselectedStuds.push([0, objTeam.LeaderPersonId]);
        let i = 1;
        dtTeamStuds.forEach(item => {
            if (item.PersonId !== objTeam.LeaderPersonId) {
                tmpselectedStuds.push([i, item.PersonId]);
                i++;
            }
        });

        setProjectName(objTeam.ProjectName);
        setGuideId(objTeam.GuidePersonId);
        setSelectedStud(tmpselectedStuds);
    }

    useEffect(() => {
        loadData();
        loadGuide();

        if (Type === 'Edit') {
            setEditMode();
        }

    }, []);

    //#endregion

    //#region SaveData

    const IsValid = () => {
        if (IsEmpty(ProjectName)) {
            showMsg(eMsg.Info, 'Project Name is Required.');
            return false;
        }

        return true;
    }

    const SaveData = async () => {
        selectedStud.sort((a, b) => a[0] - b[0]);

        if (IsValid()) {
            const PersonId = Cookies.get('PersonId');

            const objTeam = { ...Team };
            objTeam.ProjectName = ProjectName;
            objTeam.LeaderPersonId = selectedStud[0][1];
            objTeam.GuidePersonId = GuideId;
            objTeam.UpdatePersonId = PersonId;
            objTeam.UpdateTime = serverTimestamp();

            if (Type === 'Edit') {
                const dtTeamStuds = await SelectData(dbCollections.TeamStudent, { TeamId: TeamId });

                let TotalStud = dtTeamStuds.length;
                dtTeamStuds.forEach(item => {
                    const objStud = selectedStud.find(itm => itm[1] === item.PersonId);
                    if (objStud) {//Student exist in team then it remove from selectedStud.
                        selectedStud.splice(selectedStud.indexOf(objStud), 1);
                    }
                    else {// Stud not exist in new team then delete from table.
                        DeleteData(dbCollections.TeamStudent, item.id);
                        TotalStud--;
                    }
                });

                selectedStud.forEach(item => {
                    if (item[1] !== '0' && item[1] !== 0) {
                        const objTeamStud = { ...TeamStudent };
                        objTeamStud.PersonId = item[1];
                        objTeamStud.TeamId = TeamId;
                        objTeamStud.ProjectGroupId = GroupId;
                        objTeamStud.InsertPersonId = PersonId;
                        objTeamStud.InsertTime = serverTimestamp();

                        InsertData(dbCollections.TeamStudent, objTeamStud);
                        TotalStud++;
                    }
                });

                objTeam.TotalStudents = TotalStud;
                await UpdateData(dbCollections.Team, TeamId, objTeam);

                showMsg(eMsg.Success, 'Team Updated Successfully.');
            }
            else {
                objTeam.TotalStudents = selectedStud.length;
                objTeam.ProjectGroupId = GroupId;
                objTeam.InsertPersonId = PersonId;
                objTeam.InsertTime = serverTimestamp();

                const newTeamId = await InsertData(dbCollections.Team, objTeam);

                selectedStud.forEach(item => {
                    const objTeamStud = { ...TeamStudent };
                    objTeamStud.PersonId = item[1];
                    objTeamStud.TeamId = newTeamId;
                    objTeamStud.ProjectGroupId = GroupId;
                    objTeamStud.InsertPersonId = PersonId;
                    objTeamStud.InsertTime = serverTimestamp();

                    InsertData(dbCollections.TeamStudent, objTeamStud);
                });

                showMsg(eMsg.Success, 'Team Inserted Successfully.');
            }

            onClose();
        }
    };

    //#endregion

    return (
        <div className='popup-bg'>
            <div className='popup-body my-auto row mx-auto col-lg-3 col-md-4 col-sm-6 col-xs-12'>
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
                {divStuds}
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Project Name</label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <input type='text' value={ProjectName} onChange={(e) => setProjectName(e.target.value)} className='form-control'></input>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-lg-3 col-md-3 col-sm-6 col-xs-12'>Guide</label>
                    <div className='col-lg-9 col-md-9 col-sm-6 col-xs-12'>
                        <Dropdown Name='Guide' items={lstGuide} Value={GuideId} onSelectChange={setGuideId} />
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
