import React, { useRef, useState, useEffect, useContext } from 'react';
import './Home.css'
import { detacontext } from '../../../../App'
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';

import axios from 'axios';

const Home = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token_e');
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const { restaurantData, userLoginInfo } = useContext(detacontext)

  const { id } = useParams()
  const [table, settable] = useState({})
  const tableInfo = async()=>{
    const response =await axios.get(`${apiUrl}/api/table/${id}`,config)
    if(response){
      return <Navigate to='/' />
    }
    const tableInfo = response.data
    if (tableInfo){
      settable(tableInfo)
    }
  }
  useEffect(() => {
    tableInfo()
  }, [id])
  
  
  const askingForHelp = async (tableId) => {
    try {
      // Fetch the last 30 orders
      const response = await axios.get(`${apiUrl}/api/order/limit/30`, config);
      const allOrders = response.data;
      
      // Filter orders for the specified table
      const tableOrders = allOrders.filter(order => order.table && order.table._id === tableId);

      // Get the last order for the table
      const lastTableOrder = tableOrders.length > 0 ? tableOrders[0] : null;

      // Check if the last table order is active
      const lastTableOrderActive = lastTableOrder ? lastTableOrder.isActive : false;

      if (!lastTableOrderActive) {
        // Generate a new serial number for the order
        const lastSerial = allOrders.length > 0 ? allOrders[allOrders.length - 1].serial : '000000';
        const newSerial = String(Number(lastSerial) + 1).padStart(6, '0');

        // Create a new order with the help request
        const newOrderData = {
          serial: newSerial,
          table: tableId,
          help: 'Requests assistance',
        };
        const newOrder = await axios.post(`${apiUrl}/api/order/`, newOrderData);
        if (newOrder) {
          toast.info('تم طلب الويتر للمساعدة');
        }
      } else {
        // Update the existing active order with the help request
        const updatedOrderData = {
          help: 'Requests assistance',
          helpStatus: 'Not send',
        };
        const updatedOrder = await axios.put(`${apiUrl}/api/order/${lastTableOrder._id}`, updatedOrderData);
        if (updatedOrder) {
          toast.info('تم طلب الويتر للمساعدة');
        }
      }
    } catch (error) {
      // Log and display an error toast message
      console.error(error);
      toast.error('An error occurred while requesting assistance.');
    }
  }




          return (
            <main className='main-home' id='main'>
              <div className="main-container">
                <div className="content">
                  {userLoginInfo && userLoginInfo.userinfo && table? <p className='main-title'>مرحبا {userLoginInfo.userinfo?.username} <br />علي طاولة {table.tableNum} <br /> في</p>
                    : userLoginInfo && userLoginInfo.userinfo ? <p className='main-title'>مرحبا {userLoginInfo.userinfo.username} <br /> في</p>
                      : table? <p className='main-title'>مرحبا ضيوف طاولة {table.tableNum} <br /> في</p>
                        : <p className='main-title'>مرحبا بكم  <br /> في</p>
                  }
                  <p className='main-text'> {restaurantData.name} <br /> {restaurantData.description}</p>
                  <ul className="main-btn">

                    {table ? <>
                      <li className='main-li' onClick={() => askingForHelp(table._id)}>طلب الويتر</li>
                      <li className='main-li'><a href="#menu">المنيو</a></li>
                    </>
                      : <li className='main-li mrl-auto'><a href="#menu">المنيو</a></li>}
                  </ul>
                </div>
              </div>
            </main>
          )

}

export default Home