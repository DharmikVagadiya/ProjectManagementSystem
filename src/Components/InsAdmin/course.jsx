import React, { useState, useEffect } from 'react'

import Btn from '../common/btn';

import { eCourse, GetEnumName } from '../enums';
import { DeleteData, SelectData, sortByField } from '../../Database/db_helper';
import { dbCollections, Course } from '../../Database/tables';

import PopupCourse from './popup/popupCourse';
import Cookies from 'js-cookie';

export default function Courses() {

  const [courseType, setCourseType] = useState(eCourse.Branch);
  const [breadcrumb, setBreadcrumb] = useState([[eCourse.Branch, 0]]);
  const [parentId, setParentId] = useState(0);
  const [dataCourse, setCourseData] = useState([]);
  const [popupCourse, setPopupCourse] = useState('');
  const [searchText, setSearchText] = useState('');

  const refreshData = async () => {
    try {
      const objCourse = { ...Course };
      objCourse.eCourseType = courseType;
      objCourse.ParentId = parentId;
      objCourse.InstituteId = Cookies.get('InstituteId');

      const dtCourse = await SelectData(dbCollections.Course, objCourse);

      sortByField(dtCourse, 'SerialNo');
      setCourseData(dtCourse);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { refreshData(); }, [parentId]);

  const renderData = (data) => {
    return data.map(item => {
      if (searchText === '' || item.Name.toLowerCase().includes(searchText.toLowerCase())) {
        return (
          <tr key={item.id} onDoubleClick={() => AddBreadcrumb(item.id)}>
            <td>{item.Name}</td>
            <td>{item.SerialNo}</td>
            <td>
              <div className='d-flex'>
                <button className='btn-edit ml-30px' onClick={() => EditCourse(item.id)}><i className='fa fa-edit'></i>&nbsp;Edit</button>
                {/* <button className='btn-delete ml-30px' onClick={() => DeleteCourse(item.id)}><i className='fa fa-trash-o'></i>&nbsp;Delete</button> */}
                <Btn Class='btn-delete ml-30px' onClick={() => DeleteCourse(item.id)} Name='Delete'><i className='fa fa-trash-o mr-5px'></i></Btn>
              </div>
            </td>
          </tr>
        );
      } else {
        return null;
      }
    });
  };

  const AddCourse = () => {
    setPopupCourse(<PopupCourse Type='Add' ParentId={parentId} CourseId={0} CourseType={courseType} onClose={HidePopup} />);
  };

  const EditCourse = (id) => {
    setPopupCourse(<PopupCourse Type='Edit' ParentId={parentId} CourseId={id} CourseType={courseType} onClose={HidePopup} />);
  };

  const DeleteCourse = (CourseId) => {
    DeleteData(dbCollections.Course, CourseId);

    refreshData();
  };

  const HidePopup = () => {
    setPopupCourse('');
    refreshData();
  }

  const onSearch = (e) => { setSearchText(e.target.value); }

  const AddBreadcrumb = (id) => {
    if (courseType < eCourse.Subject) {
      breadcrumb.push([courseType + 1, id]);
      setCourseType(courseType + 1);
      setParentId(id);
    }
  }

  const RemoveBreadcrumb = (item) => {
    if (courseType > 1) {
      const index = breadcrumb.findIndex(itm => itm[0] === item[0] && itm[1] === item[1]);
      setBreadcrumb(breadcrumb.slice(0, index + 1));
      setCourseType(item[0]);
      setParentId(item[1]);
      refreshData();
    }
  }

  const renderBreadcrumb = () => {
    return breadcrumb.map(([Sr, id], index) => (
      <h3 key={index} className='m-0' onClick={() => RemoveBreadcrumb([Sr, id])}>&nbsp; &gt; &nbsp;{GetEnumName(eCourse, Sr)}</h3>
    ));
  };

  return (
    <>
      <div className='divCourse'>
        <div className='breadcrumb mb-30px d-flex'>
          <h3 className='m-0'>Course</h3>
          {renderBreadcrumb()}
        </div>
        <div className='inst-content'>
          <div className='divtitle mb-30px'>
            <button className='btn btn-add' onClick={() => AddCourse()}>
              <i className='fa fa-plus'></i>
              <label className='lblbtn ml-10px'>Add {GetEnumName(eCourse, courseType)}</label>
            </button>
            <Btn Class='btn ml-10px btn-refresh' onClick={refreshData} Name='Refresh'>
              <i className='fa fa-refresh mr-10px'></i>
            </Btn>
            {/* <button className='btn ml-10px btn-refresh' onClick={() => refreshData()}>
              <i className='fa fa-refresh'></i>
              <label className='lblbtn ml-10px'>Refresh</label>
            </button> */}
            <div className='align-right mt-5px d-flex'>
              {/* <div className='w-full my-auto'>
                <span>&lt;</span>
                <label> 5 to 20 </label>
                <span>&gt;</span>
              </div> */}
              <input type='text' className='form-control ml-10px' value={searchText} onChange={onSearch} placeholder='Search...'></input>
            </div>
          </div>
          <div className='div-table'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>{courseType === eCourse.Subject ? 'Subject Code' : 'Serial No'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {renderData(dataCourse)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {popupCourse}
    </>
  )
}
