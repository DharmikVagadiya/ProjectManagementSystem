import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { dbCollections, Team } from '../../Database/tables';
import { SelectData, sortByField } from '../../Database/db_helper';

import PopupTeam from './popup/popupTeam';

export default function Teams() {

    const location = useLocation();
    const navigate = useNavigate();

    const [State, setState] = useState(location.state);
    const [dataTeams, setTeamsData] = useState([]);
    const [popupTeam, setPopupTeam] = useState('');
    const [searchText, setSearchText] = useState('');

    const renderData = (data) => {
        return data.map(item => {
            if (searchText === '' || item.ProjectName.toLowerCase().includes(searchText.toLowerCase())) {
                return (
                    <tr key={item.id} onDoubleClick={() => loadTeamData(item.id, item.ProjectName)}>
                        <td>{item.ProjectName}</td>
                        <td>{item.TotalStudents}</td>
                        <td>{item.stud ? item.stud.Name : ''}</td>
                        <td>{item.guide ? item.guide.Name : ''}</td>
                        <td>
                            <div className='d-flex'>
                                <button className='ml-30px btn-edit' onClick={() => EditTeam(item.id)}><i className='fa fa-edit'></i>&nbsp;Edit</button>
                                <button className='ml-30px btn-delete' onClick={() => DeleteTeam(item.id)}><i className='fa fa-trash-o'></i>&nbsp;Delete</button>
                            </div>
                        </td>
                    </tr>
                );
            } else {
                return null;
            }
        });
    };

    const refreshData = async () => {
        try {
            const objTeam = Team;
            objTeam.ProjectGroupId = State.id;

            const dtTeam = await SelectData(dbCollections.Team, objTeam);
            const dtPerson = await SelectData(dbCollections.Person, {});

            const combinedData = dtTeam.map(team => ({
                ...team,
                stud: dtPerson.find(person => person.id === team.LeaderPersonId) || null,
                guide: dtPerson.find(person => person.id === team.GuidePersonId) || null
            }));

            sortByField(combinedData, 'GuidePersonId');
            setTeamsData(combinedData);
        } catch (error) {

        }
    }

    useEffect(() => { refreshData(); })

    const loadTeamData = (TeamId, Name) => {
        navigate('fields', { state: { Team: { id: TeamId, name: Name }, Group: State } });
    };

    const AddTeam = () => {
        setPopupTeam(<PopupTeam Type='Add' TeamId={0} onClose={ClosePopup} GroupId={State.id} />);
    };

    const EditTeam = (id) => {
        setPopupTeam(<PopupTeam Type='Edit' TeamId={id} onClose={ClosePopup} GroupId={State.id} />);
    };

    const DeleteTeam = (id) => {

    };

    const ClosePopup = () => {
        setPopupTeam('');
        refreshData();
    };

    const onSearch = (e) => { setSearchText(e.target.value); }

    return (
        <>
            <div>{State ? '' : navigate('/pagenotfind')}</div>
            <div className='divTeams'>
                <div className='breadcrumb mb-50px'>
                    <div className='align-right mt-5px d-flex'>
                        <button className='btn w-full btn-add' onClick={() => AddTeam()}>
                            <i className='fa fa-plus'></i>
                            <label className='lblbtn ml-10px'>Add Team</label>
                        </button>
                        <input type='text' className='form-control ml-10px' placeholder='Search...' onChange={onSearch}></input>
                    </div>

                    <div className='breadcrumb d-flex'>
                        <Link to='..' style={{ color: 'black' }}>
                            <h3 className='m-0'>{State ? State.name : 'Group'} (Project Group)</h3>
                        </Link>
                        <h3 className='m-0'>&nbsp; &gt; &nbsp; Teams</h3>
                    </div>
                </div>
                <div className='inst-content'>
                    <div className='div-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Total Student</th>
                                    <th>Team Leader</th>
                                    <th>Guide</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderData(dataTeams)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {popupTeam}
        </>
    )
}
