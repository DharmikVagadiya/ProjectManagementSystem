import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { eCourse, eMsg } from '../enums';
import { DeleteData, SelectData, sortByField } from '../../Database/db_helper';
import { dbCollections, Course, ProjectGroup } from '../../Database/tables';
import { formatDateTime } from '../../Database/validation';
import { useLoginDetails } from '../Login/login';

import Btn from '../common/btn';
import Dropdown from '../common/dropdown';
import PopupProjectGroup from './popup/popupProjectGroup';
import { useAlert } from '../common/message';
import Cookies from 'js-cookie';

export default function Projectgroup() {
  const { loginDetails } = useLoginDetails();
  const showMsg = useAlert();

  const navigate = useNavigate();

  const [lstBranch, setlstBranch] = useState([]);
  const [lstSemester, setlstSemester] = useState([]);
  const [lstSection, setlstSection] = useState([]);
  const [BranchId, setBranchId] = useState(0);
  const [SemesterId, setSemesterId] = useState(0);
  const [SectionId, setSectionId] = useState(0);
  const [dataProjectGroup, setGroupData] = useState([]);
  const [popup, setPopup] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dtCourse, setCourses] = useState([]);

  //#region Load Dropdowns

  const loadBranch = async () => {
    const objCourse = Course;
    objCourse.InstituteId = Cookies.get('InstituteId');

    const dtAllCourse = await SelectData(dbCollections.Course, objCourse);
    setCourses(dtAllCourse);

    const dtBranch = dtAllCourse.filter(c => c.ParentId === 0 && c.eCourseType === eCourse.Branch);
    sortByField(dtBranch, 'SerialNo');

    const dt = [];
    dtBranch.forEach(obj => { dt.push([obj.Name, obj.id]) });
    setlstBranch(dt);
    loadSemester(0);
  }

  const loadSemester = async (branchId) => {
    setBranchId(branchId);
    // const objCourse = Course;
    // objCourse.ParentId = branchId;
    // objCourse.eCourseType = eCourse.Semester;

    // const dtCourse = await SelectData(dbCollections.Course, objCourse);
    const dtSemester = dtCourse.filter(c => c.ParentId === branchId && c.eCourseType === eCourse.Semester);
    sortByField(dtSemester, 'SerialNo');

    const dt = [];
    dtSemester.forEach(obj => { dt.push([obj.Name, obj.id]) });
    setlstSemester(dt);
    loadSection(0);
  }

  const loadSection = async (semesterId) => {
    setSemesterId(semesterId);
    // const objCourse = Course;
    // objCourse.ParentId = semesterId;
    // objCourse.eCourseType = eCourse.Section;

    // const dtCourse = await SelectData(dbCollections.Course, objCourse);
    const dtSection = dtCourse.filter(c => c.ParentId === semesterId && c.eCourseType === eCourse.Section);
    sortByField(dtSection, 'SerialNo');

    const dt = [];
    dtSection.forEach(obj => { dt.push([obj.Name, obj.id]) });
    setlstSection(dt);
  }

  //#endregion

  //#region Grid

  const refreshData = async () => {
    try {
      const objProjectGroup = { ...ProjectGroup };
      objProjectGroup.SectionId = SectionId;
      objProjectGroup.InsertPersonId = loginDetails.PersonId;

      const dtGroups = await SelectData(dbCollections.ProjectGroup, objProjectGroup);

      sortByField(dtGroups, 'SerialNo')
      setGroupData(dtGroups);
    } catch (error) {
      console.log(error);
    }
  }

  const renderData = (data) => {
    return data.map(item => {
      if (searchText === '' || item.GroupName.toLowerCase().includes(searchText.toLowerCase())) {
        return (
          <tr key={item.id} onDoubleClick={() => loadTeams(item.id, item.GroupName)}>
            <td>{item.GroupName}</td>
            <td>{item.SerialNo}</td>
            <td>{item.MaxStudent}</td>
            <td>{item.EndDate ? formatDateTime(item.EndDate) : ''}</td>
            <td>
              <div className='d-flex'>
                <button className='btn-field' onClick={() => loadFields(item.id, item.GroupName)}><i className='fa fa-angle-double-down'></i>&nbsp;Fields</button>
                <button className='ml-10px p-5px btn-edit' onClick={() => EditGroup(item.id)}><i className='fa fa-edit'></i>&nbsp;Edit</button>
                <button className='ml-10px btn-delete' onClick={() => DeleteGroup(item.id)}><i className='fa fa-trash-o'></i>&nbsp;Delete</button>
              </div>
            </td>
          </tr>
        );
      } else {
        return null;
      }
    });
  };

  const loadFields = (id, name) => {
    navigate('field', { state: { id: id, name: name } });
  }

  const loadTeams = (id, name) => {
    navigate('teams', { state: { id: id, name: name } });
  }

  //#endregion

  //#region Button Events

  const AddGroup = () => {
    if (!SectionId || SectionId === 0 || SectionId === '0') {
      showMsg(eMsg.Info, 'Select Section.');
    }
    else {
      setPopup(<PopupProjectGroup Type='Add' Id={0} onClose={ClosePopup} SectionId={SectionId} />);
    }
  }

  const EditGroup = (id) => {
    if (SectionId === 0 || SectionId === null) {
      showMsg(eMsg.Info, 'Select Section.');
    }
    else {
      setPopup(<PopupProjectGroup Type='Edit' Id={id} onClose={ClosePopup} SectionId={SectionId} />);
    }
  };

  const DeleteGroup = (id) => {
    DeleteData(dbCollections.ProjectGroup, id);
    refreshData();
  };

  const ClosePopup = () => {
    setPopup('');
    refreshData();
  }

  //#endregion

  const onSearch = (e) => { setSearchText(e.target.value); }

  useEffect(() => { loadBranch(); }, []);

  useEffect(() => { refreshData(); }, [SectionId]);

  return (
    <>
      <div className='divInstitute'>
        <div className='breadcrumb mb-30px'>
          <div className='align-right d-flex'>
            <Dropdown className='dropdown-color ' Name='Branch' items={lstBranch} Value={BranchId} onSelectChange={loadSemester} />
            <Dropdown className='dropdown-color ml-5px' Name='Semester' items={lstSemester} Value={SemesterId} onSelectChange={loadSection} />
            <Dropdown className='dropdown-color ml-5px' Name='Section' items={lstSection} Value={SectionId} onSelectChange={setSectionId} />
          </div>
          <h3 className='m-0'>Project Groups</h3>
        </div>
        <div className='inst-content'>
          <div className='divtitle mb-30px'>
            <button className='btn-add' onClick={() => AddGroup()}>
              <i className='fa fa-plus'></i>
              <label className='lblbtn ml-10px'>Add Group</label>
            </button>
            <Btn Class='btn ml-10px btn-refresh' onClick={refreshData} Name='Refresh'>
              <i className='fa fa-refresh mr-10px'></i>
            </Btn>
            {/* <button className='btn btn-refresh ml-10px' onClick={() => refreshData()}>
              <i className='fa fa-refresh'></i>
              <label className='lblbtn ml-10px'>Refresh</label>
            </button> */}
            <div className='align-right mt-5px d-flex'>
              <div className='w-full my-auto'>
                {/* <span>&lt;</span>
                <label> 5 to 20 </label>
                <span>&gt;</span> */}
              </div>
              <input type='text' className='form-control ml-10px' placeholder='Search...' onChange={onSearch}></input>
            </div>
          </div>
          <div className='div-table'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SrNo</th>
                  <th>Max Student</th>
                  <th>End Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {renderData(dataProjectGroup)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {popup}
    </>
  )
}