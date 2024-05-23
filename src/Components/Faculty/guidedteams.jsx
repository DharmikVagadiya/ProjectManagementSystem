import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Team, Person, dbCollections } from '../../Database/tables';
import { useLoginDetails } from '../Login/login';
import { SelectData, sortByField } from '../../Database/db_helper';

export default function Guidedteams() {
  const navigate = useNavigate();

  const { loginDetails } = useLoginDetails();
  const [dataTeams, setTeamsData] = useState([]);

  const refreshData = async () => {
    try {
      const objTeam = Team;
      objTeam.GuidePersonId = loginDetails.PersonId;

      const objPerson = {...Person};
      objPerson.InstituteId = loginDetails.InstituteId;

      const dtTeam = await SelectData(dbCollections.Team, objTeam);
      const dtPerson = await SelectData(dbCollections.Person, objPerson);
      
      const combinedData = dtTeam.map(team => ({
        ...team,
        stud: dtPerson.find(person => person.id === team.LeaderPersonId) || null,
        guide: dtPerson.find(person => person.id === team.GuidePersonId) || null
      }));

      sortByField(combinedData, 'ProjectName');
      setTeamsData(combinedData);
    } catch (error) {

    }
  }

  const renderData = (data) => {
    return data.map(item => (
      <tr key={item.id} onDoubleClick={() => loadTeamData(item.id, item.ProjectName, item.ProjectGroupId)}>
        <td>{item.ProjectName}</td>
        <td>{item.stud ? item.stud.Name : ''}</td>
        <td>{item.TotalStudents}</td>
      </tr>
    ));
  };

  useEffect(() => {
    refreshData();
  }, [loginDetails])

  const loadTeamData = (TeamId, Name, GroupId) => {
    navigate('field', { state: { id: TeamId, name: Name, groupId: GroupId } });
  }

  return (
    <div className='divTeams'>
      <div className='breadcrumb mb-50px'>
        <h3 className='m-0'>Teams</h3>
      </div>
      <div className='inst-content'>
        <div className='div-table'>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Team Leader</th>
                <th>Total Student</th>
              </tr>
            </thead>
            <tbody>
              {renderData(dataTeams)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
