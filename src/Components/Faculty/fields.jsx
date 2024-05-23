import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { dbCollections, ProjectField } from '../../Database/tables';
import { SelectData, sortByField } from '../../Database/db_helper';
import { formatDateTime } from '../../Database/validation';

import PopupField from './popup/popupField';
import { GetEnumName, eFieldType } from '../enums';

export default function Fields() {

    const location = useLocation();
    const navigate = useNavigate();

    const [State, setState] = useState(location.state);
    const [dataFields, setFieldsData] = useState([]);
    const [popupField, setPopupField] = useState('');
    const [searchText, setSearchText] = useState('');

    const ClosePopup = () => {
        setPopupField('');
        refreshData();
    };

    const onSearch = (e) => { setSearchText(e.target.value); }

    useEffect(() => { refreshData(); }, [])

    const refreshData = async () => {
        try {
            const objField = ProjectField;
            objField.ProjectGroupId = State.id;
            // objField.SerialNo = '1';

            const dtFields = await SelectData(dbCollections.ProjectField, objField);

            sortByField(dtFields, 'SerialNo');
            setFieldsData(dtFields);
        } catch (error) {

        }
    }

    const renderData = (data) => {
        return data.map(item => {
            if (searchText === '' || item.FieldName.toLowerCase().includes(searchText.toLowerCase())) {
                return (
                    <tr key={item.id}>
                        <td>{item.SerialNo}</td>
                        <td>{item.FieldName}</td>
                        <td>{GetEnumName(eFieldType, parseInt(item.eFieldType))}</td>
                        <td>{formatDateTime(item.EndTime)}</td>
                        <td>{item.IsCompulsory ? 'Compulsory' : 'Not Compulsory'}</td>
                        <td>
                            <div className='d-flex'>
                                <button className='ml-30px btn-edit' onClick={() => EditField(item.id)}><i className='fa fa-edit'></i>&nbsp;Edit</button>
                                <button className='ml-30px btn-delete' onClick={() => DeleteField(item.id)}><i className='fa fa-trash-o'></i>&nbsp;Delete</button>
                            </div>
                        </td>
                    </tr>
                );
            } else {
                return null;
            }
        });
    };

    const AddField = () => {
        setPopupField(<PopupField Type='Add' FieldId={0} onClose={ClosePopup} GroupId={State.id} />);
    }

    const EditField = (id) => {
        setPopupField(<PopupField Type='Edit' FieldId={id} onClose={ClosePopup} GroupId={State.id} />);
    }

    const DeleteField = () => {

    }

    return (
        <>
            <div>{State ? '' : navigate('/pagenotfind')}</div>
            <div className='divTeams'>
                <div className='breadcrumb mb-50px'>
                    <div className='align-right mt-5px d-flex'>
                        <button className='btn w-full btn-add' onClick={() => AddField()}>
                            <i className='fa fa-plus'></i>
                            <label className='lblbtn ml-10px'>Add Field</label>
                        </button>
                        <input type='text' className='form-control ml-10px' placeholder='Search...' onChange={onSearch}></input>
                    </div>

                    <div className='breadcrumb d-flex'>
                        <Link to='..' style={{ color: 'black' }}>
                            <h3 className='m-0'>{State ? State.name : 'Group Name'} (Project Group)</h3>
                        </Link>
                        <h3 className='m-0'>&nbsp; &gt; &nbsp; Fields</h3>
                    </div>
                </div>
                <div className='inst-content'>
                    <div className='div-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th>SrNo</th>
                                    <th>Field</th>
                                    <th>Type</th>
                                    <th>End Time</th>
                                    <th>Is Compulsory?</th>
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
