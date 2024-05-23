import React, { useEffect } from 'react';

import { eFieldType } from '../enums';
import { dbCollections } from '../../Database/tables';
import { GetDownloadURL, SelectData, sortByField } from '../../Database/db_helper';
import { formatDateTime } from '../../Database/validation';

export default function GroupFields({ ProjectGroupId, getTeamId, lstAnswers, setlstAnswers, lstFields, setlstFields }) {

    useEffect(() => {
        loadFields();
    }, [ProjectGroupId])

    const loadFields = async () => {
        if (ProjectGroupId !== '0' && ProjectGroupId !== null) {
            const TeamId = await getTeamId();
            const dtGroupFields = await SelectData(dbCollections.ProjectField, { ProjectGroupId: ProjectGroupId });
            const dtTeamData = await SelectData(dbCollections.TeamData, { TeamId: TeamId });

            const Fields = [];
            sortByField(dtGroupFields, 'SerialNo');
            dtGroupFields.forEach(async (item, index) => {
                const objTeamdata = dtTeamData.find(data => data.FieldId === item.id);
                const FieldType = parseInt(item.eFieldType);

                Fields.push(
                    <div key={item.id} className='d-flex mb-10px'>
                        <div className='col-lg-3 col-md-4 col-sm-5 col-xs-12'>
                            <h5 className='control-label m-10px'>
                                {item.FieldName}
                                {item.IsCompulsory && (<i className='text-denger'>&nbsp;*</i>)}
                            </h5>
                        </div>
                        <div className='col-lg-6 col-md-6 col-sm-5 col-xs-12 d-flex  my-auto'>
                            {objTeamdata ?
                                (FieldType === eFieldType.Fileupload ? <a href={objTeamdata.FilePath ?? '#'} target='_blank' rel='noreferrer'><i className='fa fa-arrow-circle-o-down'></i></a> : <label className='form-control'>{objTeamdata.Answer}</label>)
                                :
                                (FieldType === eFieldType.Fileupload ? <input type='file' className='form-control' onChange={(e) => updatelstAnswers(e, item.id, 'file', item.IsCompulsory)}></input> : <input className='form-control' placeholder='Type here...' onChange={(e) => updatelstAnswers(e, item.id, 'text', item.IsCompulsory)}></input>)
                            }
                        </div>
                        <div className='col-lg-3 col-md-2 col-sm-2 col-xs-12 ml-10px my-auto'>
                            <label className={objTeamdata ? '' : 'text-denger'}>{objTeamdata ? 'Submit Time : ' + objTeamdata.UpdateTime.toDate().toLocaleString().replace(/\//g, '-').replace(',', '') : 'End Time : ' + formatDateTime(item.EndTime)}</label>
                        </div>
                    </div>
                )
            });

            setlstFields(Fields);
        }
        else {
            setlstFields([]);
        }
    }

    const updatelstAnswers = (e, Id, Type, IsCompulsory) => {
        let tmplstAns = lstAnswers;

        try {
            const objtmpAns = tmplstAns.find(itm => itm[0] === Id);
            if (objtmpAns) {
                const index = tmplstAns.indexOf(objtmpAns);
                if (Type === 'file') {
                    tmplstAns[index] = [Id, e.target.files[0], Type, IsCompulsory];
                }
                else {
                    tmplstAns[index] = [Id, e.target.value, Type, IsCompulsory];
                }
            }
            else {
                if (Type === 'file') {
                    tmplstAns.push([Id, e.target.files[0], Type, IsCompulsory]);
                }
                else {
                    tmplstAns.push([Id, e.target.value, Type, IsCompulsory]);
                }
            }

            setlstAnswers(tmplstAns);
        } catch {

        }
    }

    return (
        <div>{lstFields}</div>
    )
}