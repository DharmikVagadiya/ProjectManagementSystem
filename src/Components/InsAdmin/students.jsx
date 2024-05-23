import React, { useEffect, useState } from 'react'

import Dropdown from '../common/dropdown';
import Btn from '../common/btn';
import { useAlert } from '../common/message';

import { eCourse, eDesignation, eMsg } from '../enums';
import { Course, Student, dbCollections } from '../../Database/tables';
import { SelectData, DeleteData, sortByField } from '../../Database/db_helper';

import PopupStudent from './popup/popupStudent';
import PopupLogin from './popup/popupLogin';
import Cookies from 'js-cookie';

export default function Students() {
  const showMsg = useAlert();

  const [lstBranch, setlstBranch] = useState([]);
  const [lstSemester, setlstSemester] = useState([]);
  const [lstSection, setlstSection] = useState([]);
  const [BranchId, setBranchId] = useState(0);
  const [SemesterId, setSemesterId] = useState(0);
  const [SectionId, setSectionId] = useState(0);
  const [dataStudent, setStudentData] = useState([]);
  const [popupStudent, setPopupStudent] = useState('');
  const [searchText, setSearchText] = useState('');

  const loadBranch = async () => {
    const objCourse = Course;
    objCourse.ParentId = 0;
    objCourse.eCourseType = eCourse.Branch;
    objCourse.InstituteId = Cookies.get('InstituteId');

    const dtCourse = await SelectData(dbCollections.Course, objCourse);
    sortByField(dtCourse, 'SerialNo');

    const dt = [];
    dtCourse.forEach(obj => { dt.push([obj.Name, obj.id]) });
    setlstBranch(dt);
    loadSemester(0);
  }
  
  const loadSemester = async (branchId) => {
    setSemesterId(0);
    setBranchId(branchId);
    const objCourse = Course;
    objCourse.ParentId = branchId;
    objCourse.eCourseType = eCourse.Semester;

    const dtCourse = await SelectData(dbCollections.Course, objCourse);
    sortByField(dtCourse, 'SerialNo');

    const dt = [];
    dtCourse.forEach(obj => { dt.push([obj.Name, obj.id]) });
    setlstSemester(dt);
    loadSection(0);
  }
  
  const loadSection = async (semesterId) => {
    setSectionId(0);
    setSemesterId(semesterId);
    const objCourse = Course;
    objCourse.ParentId = semesterId;
    objCourse.eCourseType = eCourse.Section;

    const dtCourse = await SelectData(dbCollections.Course, objCourse);
    sortByField(dtCourse, 'SerialNo');

    const dt = [];
    dtCourse.forEach(obj => { dt.push([obj.Name, obj.id]) });
    setlstSection(dt);
  }

  const refreshData = async () => {
    try {
      const objStud = Student;
      objStud.CourseId = SectionId;

      const dtStudent = await SelectData(dbCollections.Student, objStud);
      const dtPerson = await SelectData(dbCollections.Person, { eDesignation: eDesignation.Student });
      const dtLogin = await SelectData(dbCollections.Login, {});

      const combinedData = dtStudent.map(stud => ({
        ...stud,
        person: dtPerson.find(p => p.id === stud.PersonId) || null,
        login: dtLogin.find(login => login.PersonId === stud.PersonId) || null
      }));

      sortByField(combinedData, 'RollNo');
      setStudentData(combinedData);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { refreshData(); }, [SectionId]);

  const renderData = (data) => {
    return data.map(item => {
      if (searchText === '' || item.person.Name.toLowerCase().includes(searchText.toLowerCase())) {
        return (
          <tr key={item.person.id}>
            <td>{item.person.Name}</td>
            <td>{item.RollNo}</td>
            <td>{item.login ? item.login.username : ''}</td>
            <td>{item.login ? item.login.password : ''}</td>
            <td>
              <div className='d-flex'>
                <button className='btn-edit' onClick={() => EditStudent(item.person.id, item.id)}><i className='fa fa-edit'></i>&nbsp;Edit</button>
                <button className='btn-delete ml-10px' onClick={() => DeleteStudent(item.person.id, item.login ? item.login.id : null, item.id)}><i className='fa fa-trash-o'></i>&nbsp;Delete</button>
                <button className='btn-login ml-20px' onClick={() => setLogin(item.person.id)}>
                  <i className='fa fa-eye-slash'></i>
                  <label className='ml-10px'>Login</label>
                </button>
              </div>
            </td>
          </tr>
        );
      } else {
        return null; // or return an empty <></> to render nothing
      }
    });
  };

  const AddStudent = () => {
    if(SectionId && SectionId !== 0 && SectionId !== '0'){
    setPopupStudent(<PopupStudent Type='Add' onClose={ClosePopup} PersonId={0} StudentId={0} SectionId={SectionId} />);
    }
    else{
      showMsg(eMsg.Info, 'Please select Section first.');
    }
  }

  const EditStudent = (PersonId, StudentId) => {
    setPopupStudent(<PopupStudent Type='Edit' onClose={ClosePopup} PersonId={PersonId} StudentId={StudentId} SectionId={SectionId} />);
  };

  const DeleteStudent = (PersonId, LoginId, StudentId) => {
    DeleteData(dbCollections.Student, StudentId);
    DeleteData(dbCollections.Person, PersonId);

    if (LoginId !== null) {
      DeleteData(dbCollections.Login, LoginId);
    }
  };

  const setLogin = (id) => {
    setPopupStudent(<PopupLogin onClose={ClosePopup} PersonId={id} />);
  };

  const ClosePopup = () => {
    setPopupStudent('');
    refreshData();
  }

  useEffect(() => { loadBranch(); }, []);

  const onSearch = (e) => { setSearchText(e.target.value); }

  return (
    <>
      <div className='divInstitute'>
        <div className='breadcrumb mb-30px'>
          <div className='align-right d-flex'>
            <Dropdown className='dropdown-color' Name='Branch' items={lstBranch} Value={BranchId} onSelectChange={loadSemester} />
            <Dropdown className='dropdown-color ml-5px' Name='Semester' items={lstSemester} Value={SemesterId} onSelectChange={loadSection} />
            <Dropdown className='dropdown-color ml-5px' Name='Section' items={lstSection} Value={SectionId} onSelectChange={setSectionId} />
          </div>
          <h3 className='m-0'>Students</h3>
        </div>
        <div className='inst-content'>
          <div className='divtitle mb-30px'>
            <button className='btn btn-add' onClick={() => AddStudent()}>
              <i className='fa fa-plus'></i>
              <label className='lblbtn ml-10px'>Add Student</label>
            </button>
            <Btn Class='btn ml-10px btn-refresh' onClick={refreshData} Name='Refresh'>
              <i className='fa fa-refresh mr-10px'></i>
            </Btn>
            {/* <button className='btn ml-10px btn-refresh' onClick={() => refreshData()}>
              <i className='fa fa-refresh'></i>
              <label className='lblbtn ml-10px'>Refresh</label>
            </button> */}
            <div className='align-right mt-5px d-flex'>
              <div className='w-full my-auto'>
                {/* <span>&lt;</span>
                <label> 5 to 20 </label>
                <span>&gt;</span> */}
              </div>
              <input type='text' className='form-control ml-10px' onChange={onSearch} placeholder='Search...'></input>
            </div>
          </div>
          <div className='div-table'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>username</th>
                  <th>password</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {renderData(dataStudent)}
              </tbody>
            </table>
          </div>
          <label className='align-right'>Total Student : {dataStudent.length}</label>
        </div>
      </div>
      {popupStudent}
    </>
  )
}