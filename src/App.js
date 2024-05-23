import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './CSS/style.css';
import './CSS/style2.css';

import LoginPanel from './Components/Login/login';
import MainPanel from './Components/mainpanel';
import StudentDashboard from './Components/Student/dashboard';
import Message from './Components/common/message';

function App() {

  return (
    <BrowserRouter>
      <Message>
        <div className="container" style={{ fontSize: 'small' }}>
          <Routes>
            <Route path='/' element={<LoginPanel />} />
            <Route path='/login' element={<LoginPanel />} />
            <Route path='/admin/*' element={<MainPanel />} />
            <Route path='/student/dashboard' element={<StudentDashboard />} />
            <Route path='*' />
          </Routes>
        </div>
      </Message>
    </BrowserRouter>
  );
}

export default App;