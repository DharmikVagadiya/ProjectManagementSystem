import React, { useEffect, useState } from 'react'
import { SelectData, SelectDataById } from '../../Database/db_helper';
import { dbCollections } from '../../Database/tables';
import { eDesignation } from '../enums';

import Dropdown from '../common/dropdown';
import Cookies from 'js-cookie';

export default function LoadTeamStudents({ ProjectGroupId, setEndTime, getTeamId, ProjectName, setProjectName, selectedStud, setSelectedStud, lstStudents, setlstStudents }) {

    const [ReloadStud, setReload] = useState(true);
    const [MaxStud, setMaxStud] = useState(0);
    const [lstAllStudent, setlstAllStudent] = useState([]);
    const [lstClassStudent, setlstClassStudent] = useState([]);
    const [lstTeamStudent, setlstTeamStudent] = useState([]);

    useEffect(() => {
        LoadData();
    }, [lstClassStudent, ProjectGroupId]);

    useEffect(() => {
        const fun = async () => {
            const dtStuds = await LoadStudents();
            setlstStudents(dtStuds);
        }

        fun();
    }, [ReloadStud]);

    const onChangeStud = async (Id, i) => {
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
        const dtStuds = await LoadStudents();
        setlstStudents(dtStuds);
    };

    const LoadStudents = async () => {
        const elements = [];

        if (lstTeamStudent.length === 0) {
            const arrStuds = lstAllStudent.map(stud => [stud.person.Name, stud.person.id]);

            for (let i = 0; i < MaxStud; i++) {
                const objtmpstud = selectedStud.find(itm => itm[0] === i);
                elements.push(
                    <div className='d-flex mb-10px' key={i}>
                        <div className='col-lg-3 col-md-4 col-sm-6 col-xs-12 my-auto'>
                            <h5 className='control-label m-10px'>{i === 0 ? 'Team Leader' : 'Student ' + (i + 1)}</h5>
                        </div>
                        {i === 0 ?
                            (<div className='col-lg-9 col-md-8 col-sm-6 col-xs-12 d-flex'>
                                <label className='form-control w-full disable'>{arrStuds.find(stud => stud[1] === objtmpstud[1])[0]}</label>
                            </div>)
                            :
                            (<div className='col-lg-9 col-md-8 col-sm-6 col-xs-12'>
                                <Dropdown Name={i === 0 ? 'Team Leader' : 'Student ' + (i + 1)} items={arrStuds} Value={objtmpstud ? objtmpstud[1] : '0'} onSelectChange={(id) => onChangeStud(id, i)} />
                            </div>)}
                    </div>
                )
            }
        }
        else {
            const arrStuds = lstAllStudent.filter(stud => lstTeamStudent.find(item => item.PersonId === stud.person.id));

            arrStuds.forEach((item, index) => (
                elements.push(
                    <div className='d-flex mb-10px' key={index}>
                        <div className='col-lg-3 col-md-4 col-sm-6 col-xs-12 my-auto'>
                            <h5 className='control-label m-10px'>{index === 0 ? 'Team Leader' : 'Student ' + (index + 1)}</h5>
                        </div>
                        <div className='col-lg-9 col-md-8 col-sm-6 col-xs-12 d-flex'>
                            <label className='form-control'>{item.person.Name}</label>
                        </div>
                    </div>
                ))
            )
        }

        return elements;
    };

    const LoadData = async () => {
        setProjectName('');
        const objGroup = await SelectDataById(dbCollections.ProjectGroup, ProjectGroupId);
        if (objGroup) {
            setMaxStud(parseInt(objGroup.MaxStudent));
            setEndTime(objGroup.EndDate);

            const TeamId = await getTeamId();

            let dtStudents = lstClassStudent;
            const dtAllTeamStudents = await SelectData(dbCollections.TeamStudent, { ProjectGroupId: ProjectGroupId });
            const dtOtherTeamStuds = dtAllTeamStudents.filter(Tstud => Tstud.TeamId !== TeamId);
            const dtTeamStudent = dtAllTeamStudents.filter(Tstud => Tstud.TeamId === TeamId);
            setlstTeamStudent(dtTeamStudent);

            dtOtherTeamStuds.forEach(Tstud => {
                let objStud = dtStudents.find(stud => stud.person.id === Tstud.PersonId);
                if (objStud) {
                    let i = dtStudents.indexOf(objStud);
                    dtStudents.splice(i, 1);
                }
            });

            if (TeamId !== '0') {
                const objTeam = await SelectDataById(dbCollections.Team, TeamId);
                if (objTeam) {
                    setProjectName(objTeam.ProjectName);
                    const objStud = dtStudents.find(itm => itm.person.id === objTeam.LeaderPersonId);
                    if (objStud) {
                        const index = dtStudents.indexOf(objStud);
                        dtStudents.splice(index, 1);
                        dtStudents.unshift(objStud);
                    }
                }
            }

            setlstAllStudent(dtStudents);
            setReload(!ReloadStud);
        }
        else {
            setMaxStud(0);
            setEndTime('');
            setReload(!ReloadStud);
        }
    }

    const setAllStudents = async () => {
        const objStud = await SelectData(dbCollections.Student, { PersonId: Cookies.get('PersonId') });
        if (objStud) {
            let dtStudents = await SelectData(dbCollections.Student, { CourseId: objStud[0].CourseId });
            const dtPerson = await SelectData(dbCollections.Person, { eDesignation: eDesignation.Student, InstituteId: Cookies.get('InstituteId') });

            dtStudents = dtStudents.map(stud => ({
                id: stud.id,
                person: dtPerson.find(p => p.id === stud.PersonId) || null
            }));

            setlstClassStudent(dtStudents);
        }
    }

    useEffect(() => {
        setAllStudents();
    }, []);

    return (
        <div>{lstStudents}</div>
    )
}
