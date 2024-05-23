import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SelectData } from '../../Database/db_helper';
import { dbCollections } from '../../Database/tables';
import { formatDateTime } from '../../Database/validation';
import { eFieldType } from '../enums';

export default function GuideTeamData() {

    const location = useLocation();
    const navigate = useNavigate();

    const [State, setState] = useState(location.state);
    const [dataFields, setFieldsData] = useState([]);

    const renderData = (data) => {
        return data.map(item => (
            <tr key={item.id}>
                <td>{item.FieldName}</td>
                <td>
                    {item.data ?
                        (
                            parseInt(item.eFieldType) === eFieldType.Fileupload
                                ?
                                <a href={item.data.FilePath ?? '#'} target='_blank' rel='noreferrer'><i className='fa fa-arrow-circle-o-down'></i></a>
                                :
                                <label className='form-control'>{item.data.Answer}</label>
                        )
                        :
                        (
                            <label className=''>Answer Not Submited.</label>
                        )
                    }
                </td>
                <td className={item.data ? '' : 'text-denger'}>{item.data ? 'Submit Time : ' + item.data.UpdateTime.toDate().toLocaleString().replace(/\//g, '-').replace(',', '') : 'End Time : ' + formatDateTime(item.EndTime)}</td>
            </tr>
        ));
    };

    const refreshData = async () => {
        try {
            const dtGroupField = await SelectData(dbCollections.ProjectField, { ProjectGroupId: State.groupId });
            const dtTeamData = await SelectData(dbCollections.TeamData, { TeamId: State.id });

            const combinedData = dtGroupField.map(field => ({
                ...field,
                data: dtTeamData.find(data => data.FieldId === field.id) || null
            }));

            setFieldsData(combinedData, 'SerialNo');
            setFieldsData(combinedData);
        } catch (error) {

        }
    }

    useEffect(() => { refreshData(); }, [])

    return (
        <>
            <div>{State ? '' : navigate('/pagenotfind')}</div>
            <div className='divTeamData'>
                <div className='breadcrumb mb-50px'>
                    <div className='breadcrumb d-flex'>
                        <Link to='..' style={{ color: 'black' }}>
                            <h3 className='m-0'>{State ? State.name : 'Project'} (Project)</h3>
                        </Link>
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
                                </tr>
                            </thead>
                            <tbody>
                                {renderData(dataFields)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}