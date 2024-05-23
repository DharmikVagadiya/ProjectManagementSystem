import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { dbCollections } from '../../Database/tables';
import { SelectData, sortByField } from '../../Database/db_helper';
import PopupDataField from './popup/popupDataField';
import { eFieldType } from '../enums';
import { formatDateTime } from '../../Database/validation';

export default function Teamdata() {

    const location = useLocation();
    const navigate = useNavigate();

    const [State, setState] = useState(location.state);
    const [dataFields, setFieldsData] = useState([]);
    const [popupField, setPopupField] = useState('');

    const renderData = (data) => {
        return data.map(item => (
            <tr key={item.id}>
                <td>{item.FieldName}</td>
                <td>
                    {parseInt(item.eFieldType) === eFieldType.Fileupload ?
                        (item.data ? <a href={item.data.FilePath} className='fa fa-arrow-circle-o-down' target='_blank' rel='noreferrer'></a> : '') :   //GetDownloadURL(item.data.FilePath)
                        (item.data ? item.data.Answer : '')}
                </td>
                <td>{item.data ? 'Submit Time : ' + item.data.UpdateTime.toDate().toLocaleString().replace(/\//g, '-').replace(',', '') : 'End Time : ' + formatDateTime(item.EndTime)}</td>
                <td>
                    {item.data ? (
                        <div className='d-flex'>
                            <button className='ml-30px' onClick={() => EditField(item.id, item.data ? item.data.id : null, item.eFieldType, item.FieldName, item.data ? item.data.Answer : '')}>Edit</button>
                        </div>
                    ) : ''}
                </td>
            </tr>
        ));
    };

    const EditField = (FieldId, FieldDataId, Type, FieldName, Ans) => {
        setPopupField(<PopupDataField FieldId={FieldId} FieldDataId={FieldDataId} Ans={Ans} FieldType={parseInt(Type)} FieldName={FieldName} GroupName={State.Group.name} TeamId={State.Team.id} onClose={ClosePopup} />);
    };

    const ClosePopup = () => {
        setPopupField('');
        refreshData();
    }

    const refreshData = async () => {
        try {
            const dtGroupField = await SelectData(dbCollections.ProjectField, { ProjectGroupId: State.Group.id });
            let dtTeamData = await SelectData(dbCollections.TeamData, { TeamId: State.Team.id });

            const combinedData = dtGroupField.map(field => ({
                ...field,
                data: dtTeamData.find(data => data.FieldId === field.id) || null
            }));

            sortByField(combinedData, 'SerialNo');
            setFieldsData(combinedData);
        } catch (error) {

        }
    }

    useEffect(() => { refreshData(); }, []);

    const loadTeams = () => {
        navigate('..', { state: { id: State.Group.id, name: State.Group.name } })
    }

    return (
        <>
            <div>{State ? '' : navigate('/pagenotfind')}</div>
            <div className='divTeamData'>
                <div className='breadcrumb mb-50px'>
                    <div className='breadcrumb d-flex'>
                        <Link to='../..' style={{ color: 'black' }}>
                            <h3 className='m-0'>{State ? State.Group.name : 'Group'} (Project Group)</h3>
                        </Link>
                        <h3 className='m-0' onClick={() => loadTeams()}>&nbsp; &gt; &nbsp; {State ? State.Team.name : 'Project'} (Project)</h3>
                        <h3 className='m-0'>&nbsp; &gt; &nbsp; Fields</h3>
                    </div>
                </div>
                <div className='inst-content'>
                    <div className='div-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderData(dataFields)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {popupField}
        </>
    )
}
