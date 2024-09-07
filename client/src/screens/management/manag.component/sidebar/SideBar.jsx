import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { detacontext } from "../../../../App";

import { Link } from "react-router-dom";
import "./SideBar.css";

const SideBar = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const arrowRefs = {
    arrowsetting: useRef(),
    arrowmen: useRef(),
    arrowemp: useRef(),
    arrowsto: useRef(),
    arrowmessage: useRef(),
    arrowsexp: useRef(),
    arrowssupplier: useRef(),
    arrowsCash: useRef(),
    arrowtable: useRef(),
    arrowreports: useRef(),
  };

  const sidebarRef = useRef();

  const openSubMenu = (arrowRef) => {
    arrowRef.current.classList.toggle("showMenu");
  };

  const openSidebar = () => {
    sidebarRef.current.classList.toggle("close");
  };

  useEffect(() => {
    const navLinks = document.querySelectorAll(".side-bar.close .navlinks .list");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        link.classList.toggle("hover");
      });
    });

    return () => {
      navLinks.forEach((link) => {
        link.removeEventListener("click", () => {
          link.classList.toggle("hover");
        });
      });
    };
  }, []);

  return (
    <detacontext.Consumer>
      {({ restaurantData, permissionsList, employeeLoginInfo }) => {
        const role = employeeLoginInfo ? employeeLoginInfo.role : "";
        const isProgrammer = role === "programer";

        return (
          <>
            <div
              ref={sidebarRef}
              className="side-bar close"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="logo-details">
                <i className="bx bxl-c-plus-plus"></i>
                <span className="logo_name">{restaurantData.name}</span>
              </div>
              <ul className="navlinks overflowX-hidden">
                {(isProgrammer ||
                  role === "cashier" ||
                  role === "manager" ||
                  role === "owner") && (
                  <li className="list">
                    <Link to="/management">
                      <span className="material-symbols-outlined icon ml-2">
                        dashboard
                      </span>
                      <span className="linkname">لوحة التحكم</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="/" className="linkname">
                          لوحة التحكم
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* POS */}
                {(isProgrammer ||
                  role === "manager" ||
                  role === "owner") && (
                  <li className="list">
                    <Link to="managerdashboard">
                      <span className="material-symbols-outlined icon ml-2">
                        dashboard
                      </span>
                      <span className="linkname">داش بورد</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="managerdashboard" className="linkname">
                          داش بورد
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
                {/* POS */}
                {(isProgrammer ||
                  role === "cashier" ||
                  role === "waiter" ||
                  role === "manager" ||
                  role === "owner") && (
                  <li className="list">
                    <Link to="pos">
                      <span className="material-symbols-outlined icon ml-2">
                        point_of_sale
                      </span>
                      <span className="linkname">نقطة البيع</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="pos" className="linkname">
                          نقطة البيع
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* Kitchen */}
                {(isProgrammer ||
                  role === "chef" ||
                  role === "manager" ||
                  role === "owner") && (
                  <li className="list">
                    <Link to="kitchen">
                      <span className="material-symbols-outlined icon ml-2">
                        cooking
                      </span>
                      <span className="linkname">المطبخ</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="kitchen" className="linkname">
                          المطبخ
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* Waiter */}
                {(isProgrammer ||
                  role === "manager" ||
                  role === "owner" ||
                  role === "waiter") && (
                  <li className="list">
                    <Link to="waiter">
                      <span className="material-symbols-outlined icon ml-2">
                        concierge
                      </span>
                      <span className="linkname">الويتر</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="waiter" className="linkname">
                          الويتر
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* Deliveryman */}
                {(isProgrammer ||
                  role === "deliveryman" ||
                  role === "manager" ||
                  role === "owner") && (
                  <li className="list">
                    <Link to="deliveryman">
                      <span className="material-symbols-outlined icon ml-2">
                        directions_bike
                      </span>
                      <span className="linkname">الديلفري</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="deliveryman" className="linkname">
                          الديلفري
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* Orders */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Orders"
                  )[0]?.read) && (
                  <li className="list">
                    <Link to="orders">
                      <span className="material-symbols-outlined icon ml-2">
                        list_alt
                      </span>
                      <span className="linkname">الطلبات</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="orders" className="linkname">
                          الطلبات
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* Tables */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Tables"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowtable}
                    onClick={() => openSubMenu(arrowRefs.arrowtable)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          table_restaurant
                        </span>
                        <span className="linkname">الطاولات</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          الطاولات
                        </a>
                      </li>
                      <li className="list">
                        <Link to="tables">ادارة الطاولات</Link>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Table Reservations"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="reservation">حجز الطاولات</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "Tables"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="tablespage">الطاولات</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* Menu */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Products"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowmen}
                    onClick={() => openSubMenu(arrowRefs.arrowmen)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          restaurant_menu
                        </span>
                        <span className="linkname">المنيو</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          المنيو
                        </a>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Menu Categories"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="menucategory">التصنيفات</Link>
                        </li>
                      )}
                      <li className="list">
                        <Link to="products">الأطباق</Link>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "Recipes"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="productrecipe">الوصفات</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* Employees */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Employees"
                  )[0]?.read ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Permissions"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowemp}
                    onClick={() => openSubMenu(arrowRefs.arrowemp)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          group_add
                        </span>
                        <span className="linkname">الموظفون</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          الموظفون
                        </a>
                      </li>
                      <li className="list">
                        <Link to="employees">البيانات</Link>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "Permissions"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="permissions">الصلاحيات</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "Attendance"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="attendancerecord">الحضور والانصراف</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Employee Transactions"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="employeetransactions">
                            معاملات الموظفين
                          </Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "Payroll"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="payroll">المرتبات</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* Users */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Users"
                  )[0]?.read ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Message"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowmessage}
                    onClick={() => openSubMenu(arrowRefs.arrowmessage)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          user_attributes
                        </span>
                        <span className="linkname">المستخدمين</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          العملاء
                        </a>
                      </li>
                      <li className="list">
                        <Link to="users">إدارة المستخدمين</Link>
                      </li>
                      <li className="list">
                        <Link to="customers">إدارة العملاء</Link>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "Messages"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="message">رسائل العملاء</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* Stock */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) =>
                      permission.resource === "stock Item" ||
                      permission.resource === "Kitchen Usage"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowsto}
                    onClick={() => openSubMenu(arrowRefs.arrowsto)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          receipt_long
                        </span>
                        <span className="linkname">المخزون</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          المخزون
                        </a>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "store"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="store">المخازن</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "stock Categories"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="categoryStock">التصنيفات</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "stock Item"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="stockitem">الأصناف</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "stock Management"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="stockmanag">إدارة المخزون</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "stock Management"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="batchstockreport">تقرير دفعات المخزن</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Kitchen Usage"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="kitchenconsumption">استهلاك المطبخ</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* Suppliers */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Supplier Data"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowssupplier}
                    onClick={() => openSubMenu(arrowRefs.arrowssupplier)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          people
                        </span>
                        <span className="linkname">الموردين</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          الموردين
                        </a>
                      </li>
                      <li className="list">
                        <Link to="supplier">الموردين</Link>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) => permission.resource === "Purchases"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="purchase">المشتريات</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Purchase Returns"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="purchasereturn">مرتجع المشتريات</Link>
                        </li>
                      )}
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Supplier Movement"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="suppliertransaction">تعاملات الموردين</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* Expenses */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Expenses"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowsexp}
                    onClick={() => openSubMenu(arrowRefs.arrowsexp)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          money
                        </span>
                        <span className="linkname">المصروفات</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          المصروفات
                        </a>
                      </li>
                      <li className="list">
                        <Link to="expense">المصروفات</Link>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Daily Expenses"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="dailyexpense">تسجيل مصروف</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) => permission.resource === "Cash Register"
                  )[0]?.read) && (
                  <li
                    ref={arrowRefs.arrowsCash}
                    onClick={() => openSubMenu(arrowRefs.arrowsCash)}
                  >
                    <div className="icon-link">
                      <a href="#">
                        <span className="material-symbols-outlined icon ml-2">
                          monetization_on
                        </span>
                        <span className="linkname">الخزينة</span>
                      </a>
                      <i className="bx bxs-chevron-down arrow"></i>
                    </div>
                    <ul className="submenu">
                      <li className="list">
                        <a className="linkname" href="#">
                          الخزينة
                        </a>
                      </li>
                      <li className="list">
                        <Link to="cashregister">الرصيد</Link>
                      </li>
                      {(isProgrammer ||
                        permissionsList?.filter(
                          (permission) =>
                            permission.resource === "Cash Movement"
                        )[0]?.read) && (
                        <li className="list">
                          <Link to="cashmovement">تسجيل حركة</Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                

                {/* <li
                  ref={arrowRefs.arrowreports}
                  onClick={() => openSubMenu(arrowRefs.arrowreports)}
                >
                  <div className="icon-link">
                    <a href="#">
                      <span className="material-symbols-outlined icon ml-2">
                        receipt_long
                      </span>
                      <span className="linkname">التقارير</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="submenu">
                    <li className="list">
                      <a className="linkname" href="#">
                        الارباح و الخسائر
                      </a>
                    </li> */}
                    {/* {(isProgrammer || permissionsList?.filter(permission => permission.resource === 'stock Categories')[0]?.read) && ( */}
                    {/* <li className="list"> */}
                      {/* <Link to="profitloss">التصنيفات</Link>
                    </li> */}
                    {/* )} */}
                    {/* {(isProgrammer || permissionsList?.filter(permission => permission.resource === 'stock Item')[0]?.read) && (
                          <li className="list"><Link to="stockitem">الأصناف</Link></li>
                        )}
                        {(isProgrammer || permissionsList?.filter(permission => permission.resource === 'stock Management')[0]?.read) && (
                          <li className="list"><Link to="stockmanag">إدارة المخزون</Link></li>
                        )}
                        {(isProgrammer || permissionsList?.filter(permission => permission.resource === 'Kitchen Usage')[0]?.read) && (
                          <li className="list"><Link to="kitchenconsumption">استهلاك المطبخ</Link></li>
                        )} */}
                  {/* </ul>
                </li>
 */}
                {(isProgrammer ||
                  permissionsList?.filter(
                    (permission) =>
                      permission.resource === "Delivery Zones" ||
                      permission.resource === "Shifts" ||
                      permission.resource === "Restaurant Settings"
                  )[0]?.read) && (
                  <li className="list">
                    <Link to="info">
                      <span className="material-symbols-outlined icon ml-2">
                        settings
                      </span>
                      <span className="linkname">الإعدادات</span>
                    </Link>
                    <ul className="submenu blank">
                      <li className="list">
                        <Link to="info" className="linkname">
                          الإعدادات
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>
            </div>
            <div className="side-bar-icon" onClick={openSidebar}>
              <div className="side-bar-icon-content">
                <i className="bx bx-menu text-light"></i>
              </div>
            </div>
          </>
        );
      }}
    </detacontext.Consumer>
  );
};

export default SideBar;
