import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { DataFetch, InsertData, SelectData, SelectDataById, sortByField } from '../../Database/db_helper';
import { IsEmpty, ToBoolean } from '../../Database/validation';

import Checkbox from '../common/checkbox';
import { eDesignation, eLoginStatus, eMsg } from '../enums';
import { useAlert } from '../common/message';
import Btn from '../common/btn';
import { LoginLog, dbCollections } from '../../Database/tables';

const LoginContext = createContext();
export const useLoginDetails = () => useContext(LoginContext);

export const LoginProvider = ({ children }) => {
    const [loginDetails, setLoginDetails] = useState({
        IsLogin: false,
        Designation: 0,
        Name: '',
        PersonId: '',
        InstituteId: ''
    });

    // const [lstPerson, setlstPerson] = useState([]);
    // const [lstStudent, setlstStudent] = useState([]);
    // const [lstCourse, setlstCourse] = useState([]);
    // const [lstProjectGroup, setlstProjectGroup] = useState([]);
    // const [lstProjectField, setlstProjectField] = useState([]);
    // const [lstTeam, setlstTeam] = useState([]);
    // const [lstTeamStudent, setlstTeamStudent] = useState([]);
    // const [lstTeamData, setlstTeamData] = useState([]);
    // const [lstNotifications, setlstNotifications] = useState([]);

    // const setPerson = (data) => { setlstPerson(data); }
    // const setCourse = (data) => { sortByField(data, 'SerialNo'); sortByField(data, 'ParentId'); setlstCourse(data); }
    // const setStudent = (data) => { sortByField(data, 'RollNo'); setlstStudent(data); }
    // const setProjectGroup = (data) => { sortByField(data, 'SerialNo'); setlstProjectGroup(data); }
    // const setProjectField = (data) => { sortByField(data, 'SerialNo'); sortByField(data, 'ProjectGroupId'); setlstProjectField(data); }
    // const setTeam = (data) => { sortByField(data, 'ProjectGroupId'); setlstTeam(data); }

    // const updateData = async () => {
    //     if (loginDetails.IsLogin) {
    //         if (loginDetails.Designation === eDesignation.Student) {
    //             await DataFetch(dbCollections.Person, {}, setlstPerson);
    //         }
    //         else if (loginDetails.Designation === eDesignation.Faculty) {

    //         }
    //         else if (loginDetails.Designation === eDesignation.Admin) {

    //         }
    //         else if (loginDetails.Designation === eDesignation.SupAdmin) {

    //         }
    //         else {

    //         }
    //     }
    //     else{

    //     }
    // }

    // useEffect(() => {
    //     updateData();
    // }, [loginDetails.IsLogin]);

    return (
        <LoginContext.Provider value={{ loginDetails, setLoginDetails }}>
            {children}
        </LoginContext.Provider>
    );
};


export default function Login() {

    const showMsg = useAlert();
    const { loginDetails } = useLoginDetails();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [pwsType, setPwsType] = useState(true);

    const navigate = useNavigate();
    const redirect = () => {
        if (!loginDetails.IsLogin) {
            let IsLogin = Cookies.get('IsLogin');
            IsLogin = IsLogin ? IsLogin.toLowerCase() : '';
            loginDetails.IsLogin = ToBoolean(IsLogin);
            const Designation = Cookies.get('Designation');
            if (Designation)
                loginDetails.Designation = parseInt(Designation);
        }

        if (loginDetails.IsLogin) {
            if (loginDetails.Designation === eDesignation.SupAdmin) {
                navigate('/admin/institutes');
            }
            else if (loginDetails.Designation === eDesignation.Admin) {
                navigate('/admin/faculty');
            }
            else if (loginDetails.Designation === eDesignation.Faculty) {
                navigate('/admin/projectgroup');
            }
            else if (loginDetails.Designation === eDesignation.Student) {
                navigate('/student/dashboard');
            }
            else {
                showMsg(eMsg.Error, 'unauthorized login');
            }
        }
    }

    useEffect(() => { redirect(); }, []);

    const IsValidLogin = () => {
        if (IsEmpty(username)) {
            showMsg(eMsg.Info, 'username is Required.');
            return false;
        }

        if (IsEmpty(password)) {
            showMsg(eMsg.Info, 'password is Required.');
            return false;
        }

        return true;
    }

    const checkLogin = async () => {
        try {
            if (!IsValidLogin()) {
                return;
            }

            const dtLogin = await SelectData('login', { username: username, password: password });
            console.log(dtLogin);

            if (dtLogin.length > 0) {
                const personId = dtLogin[0].PersonId;
                const objPerson = await SelectDataById('Person', personId);

                if (objPerson !== undefined && objPerson !== null) {
                    loginDetails.IsLogin = true;
                    loginDetails.Designation = objPerson.eDesignation;
                    loginDetails.Name = objPerson.Name;
                    loginDetails.PersonId = personId;
                    loginDetails.InstituteId = objPerson.InstituteId;

                    if (rememberMe) {
                        // set Cookies
                        let expireTime = new Date();
                        expireTime.setTime(expireTime.getTime() + (1000 * 3600 * 24 * 2));
                        Cookies.set(encodeURIComponent('IsLogin'), encodeURIComponent(loginDetails.IsLogin), { expires: expireTime, path: '/' });
                        Cookies.set(encodeURIComponent('Designation'), encodeURIComponent(loginDetails.Designation), { expires: expireTime, path: '/' });
                        Cookies.set(encodeURIComponent('Name'), encodeURIComponent(loginDetails.Name), { expires: expireTime, path: '/' });
                        Cookies.set(encodeURIComponent('PersonId'), encodeURIComponent(loginDetails.PersonId), { expires: expireTime, path: '/' });
                        Cookies.set(encodeURIComponent('InstituteId'), encodeURIComponent(loginDetails.InstituteId), { expires: expireTime, path: '/' });
                    }
                    else {
                        Cookies.set('IsLogin', loginDetails.IsLogin);
                        Cookies.set('Designation', loginDetails.Designation);
                        Cookies.set('Name', loginDetails.Name);
                        Cookies.set('PersonId', loginDetails.PersonId);
                        Cookies.set('InstituteId', loginDetails.InstituteId);
                    }

                    await setLoginLog(eLoginStatus.Success, 'Login Successfull.');
                    showMsg(eMsg.Success, 'Login Successfull.');
                    redirect();
                }
                else {
                    await setLoginLog(eLoginStatus.Fail, 'Person not found.');
                    showMsg(eMsg.Error, 'Person not found.');
                }
            }
            else {
                await setLoginLog(eLoginStatus.Fail, 'username and password not found.');
                showMsg(eMsg.Error, 'username and password not found.');
                return;
            }
        } catch (error) {

        }
    };

    const setLoginLog = async (Status, Message) => {
        try {
            const objLoginLog = { ...LoginLog };
            objLoginLog.username = username;
            objLoginLog.password = password;
            objLoginLog.Message = Message;
            objLoginLog.eLoginStatus = Status;
            objLoginLog.Device = navigator.userAgent;
            // objLoginLog.Device = navigator.userAgent + 'Location : ' + GetLocation();
            objLoginLog.LoginTime = new Date();

            await InsertData(dbCollections.LoginLog, objLoginLog);
        } catch (error) {

        }
    }

    // const GetLocation = () => {
    //     function success(Pos) {
    //         return Pos.coords;
    //     }
    //     function error(err){
    //         return err;
    //     }
    //     navigator.geolocation.getCurrentPosition(success, error);
    // }

    return (
        <div style={{ backgroundColor: 'rgb(50 204 195)', height: '45vh', borderRadius: '10px', margin: '20px', paddingTop: '20px' }}>
            <div className='mx-auto col-lg-4 col-md-5 col-sm-9 col-xs-12' style={{ padding: '40px' }}>
                <div className='text-center' style={{ color: 'white', padding: '20px' }}>
                    Welcome!
                </div>
                <div className='mt-10px col-lg-' style={{ backgroundColor: 'white', padding: '10px 15px', borderRadius: '10px', color: 'rgb(60 60 60)' }}>
                    <h4 className='text-center'>Login</h4>
                    <div className='row' style={{ padding: '10px 30px' }}>
                        <div className='b-10px d-block'>
                            <label htmlFor='txtName' className='control-label font-500'>username</label>
                            <div className='input-group'>
                                <input id='txtName' placeholder='Enter Name' onChange={(e) => setUsername(e.target.value)} className='mt-5px form-control'></input>
                            </div>
                        </div>
                        <div className='mt-10px d-block'>
                            <label htmlFor='txtPassword' className='control-label font-500'>password</label>
                            <div className='form-control mt-5px'>
                                <input id='txtPassword' placeholder='Enter Password' onChange={(e) => setPassword(e.target.value)} className='mt-5px txtpassword m-0'
                                    type={`${pwsType ? 'password' : 'text'}`} />
                                <i className={`fa ${pwsType ? 'fa-eye' : 'fa-eye-slash'} align-right mt-3px`} onClick={() => setPwsType(!pwsType)}></i>
                            </div>
                        </div>
                        <div className='mt-10px d-block'>
                            <Checkbox Name='Remember me' IsChecked={rememberMe} onClick={() => setRememberMe(!rememberMe)} />
                        </div>
                        <div className='mt-10px'>
                            {/* <button className='btnlogin w-full form-control' onClick={() => checkLogin()}>Login</button> */}
                            <Btn Class='btnlogin w-full form-control' onClick={checkLogin} Name='Login'></Btn>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
