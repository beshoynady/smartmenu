import React, { useContext, useState, useEffect } from 'react';
import './ManagLayout.css';
import { dataContext } from '../../App';
import { Navigate } from 'react-router-dom';
import { Outlet } from "react-router";
import NavBar from './manag.component/navbar/NavBar';
import SideBar from './manag.component/sidebar/SideBar';
import { ToastContainer } from 'react-toastify';

const ManagLayout = () => {
  const { employeeLoginInfo } = useContext(dataContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log({ employeeLoginInfo });
    const isActive = employeeLoginInfo?.isAdmin && employeeLoginInfo?.isActive;
    setIsLoggedIn(isActive);
  }, [employeeLoginInfo]);

  if (!isLoggedIn) {
    return <Navigate to='/login' />;
  }

  return (
    <div className='manag-body'>
      <ToastContainer />
      <NavBar />
      <div className='content'>
        <Outlet />
      </div>
      <SideBar />
    </div>
  );
};

export default ManagLayout;
