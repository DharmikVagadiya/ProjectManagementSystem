import React from 'react'
import { Routes, Route } from 'react-router-dom';

import Institutes from './SysAdmin/institutes';
import Faculties from './InsAdmin/faculty';
import Courses from './InsAdmin/course';
import Students from './InsAdmin/students';

import ProjectGroup from './Faculty/projectgroup';
import Field from './Faculty/fields';
import Team from './Faculty/teams';
import TeamData from './Faculty/teamdata';
import GuideTeams from './Faculty/guidedteams';
import GuideTeamData from './Faculty/guideteamdata';
import Reports from './Faculty/Reports';

export default function Content() {
    return (
        <div>
            <Routes>
                <Route path='institutes' element={<Institutes />} />
                <Route path='faculty' element={<Faculties />} />
                <Route path='course' element={<Courses />} />
                <Route path='student' element={<Students />} />
                <Route path='projectgroup' >
                    <Route path='' element={<ProjectGroup />} />
                    <Route path='field' element={<Field />} />
                    <Route path='teams' >
                        <Route path='' element={<Team />} />
                        <Route path='fields' element={<TeamData />} />
                    </Route>
                </Route>
                <Route path='guidedteams' >
                    <Route path='' element={<GuideTeams />} />
                    <Route path='field' element={<GuideTeamData />} />
                </Route>
                <Route path='reports' element={<Reports />} />
                <Route path='*' element={<div>Page Not Found</div>} />
            </Routes>
        </div>
    )
}
