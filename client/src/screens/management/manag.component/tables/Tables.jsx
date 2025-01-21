import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { dataContext } from "../../../../App";
import { toast } from "react-toastify";
import "../orders/Orders.css";

const Tables = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const {
    permissionsList,
    restaurantData,
    setStartDate,
    setEndDate,
    filterByDateRange,
    filterByTime,
    employeeLoginInfo,
    formatDate,
    formatDateTime,
    setisLoading,
    EditPagination,
    startPagination,
    endPagination,
    setStartPagination,
    setEndPagination,
  } = useContext(dataContext);

  const tablePermission =
    permissionsList &&
    permissionsList.filter((permission) => permission.resource === "Tables")[0];

  const [qrimage, setqrimage] = useState("");
  const [tableid, settableid] = useState("");
  const [tableCode, settableCode] = useState("");
  const [notes, setnotes] = useState("");
  const [location, setlocation] = useState("");
  const [listoftable, setlistoftable] = useState([]);
  const [tableNumber, settableNumber] = useState(0);
  const [chairs, setchairs] = useState(0);
  const [sectionNumber, setsectionNumber] = useState();
  const [isValid, setisValid] = useState();

  // Function to create a new table
  const createTable = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("يجب تسجيل الدخول لإتمام العملية");
      throw new Error("Authentication required");
    }

    if (tablePermission && !tablePermission.create) {
      toast.warn("ليس لك صلاحية لانشاء طاوله جديدة");
      return;
    }

    const generateTableCode = () => {
      return [...Array(20)]
        .map(() => Math.random().toString(36).charAt(2))
        .join("");
    };

    try {
      const tableCode = generateTableCode();

      const tableData = {
        tableNumber,
        chairs,
        sectionNumber,
        location,
        tableCode,
        isValid,
        notes,
      };

      const response = await axios.post(
        `${apiUrl}/api/table/`,
        tableData,
        config
      );
      if (response.status === 201) {
        console.log("تم إنشاء الطاولة بنجاح:", response.data);

        await getAllTable();
        toast.success("تم إنشاء الطاولة بنجاح.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        if (error.response.data.message.includes("already exists")) {
          toast.error(
            `رقم الطاولة ${tableNumber} موجود بالفعل في القسم ${sectionNumber}.`
          );
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        console.error("خطأ أثناء إنشاء الطاولة:", error);
        toast.error("حدث خطأ أثناء إنشاء الطاولة. الرجاء المحاولة مرة أخرى.");
      }
    }
  };

  // Function to edit an existing table
  const editTable = async (e) => {
    e.preventDefault();

    // Check if the user is authenticated
    if (!token) {
      toast.error("يجب تسجيل الدخول لإتمام العملية.");
      throw new Error("Authentication required");
    }
    if (tablePermission && !tablePermission.update) {
      toast.warn("ليس لك صلاحية لتعديل بيانات طاوله ");
      return;
    }
    try {
      // Prepare the data to be sent in the request
      const tableData = {
        tableNumber,
        chairs,
        sectionNumber,
        location,
        isValid,
        notes,
      };

      // Send the PUT request to update the table
      const response = await axios.put(
        `${apiUrl}/api/table/${tableid}`,
        tableData,
        config
      );

      // Handle successful response
      if (response.status === 200) {
        console.log("Table updated successfully:", response.data);

        // Refresh the table list
        await getAllTable();

        // Show success notification
        toast.success("تم تعديل الطاولة بنجاح.");
      }
    } catch (error) {
      // Handle specific errors based on status codes and messages
      if (error.response && error.response.status === 404) {
        toast.error("الطاولة غير موجودة.");
      } else if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        if (error.response.data.message.includes("already exists")) {
          toast.error(
            `رقم الطاولة ${tableNumber} موجود بالفعل في القسم ${sectionNumber}.`
          );
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        // Handle unexpected errors
        console.error("Error updating table:", error);
        toast.error("حدث خطأ أثناء تعديل الطاولة. الرجاء المحاولة مرة أخرى.");
      }
    }
  };

  // Function to create QR code for the table URL
  const createQR = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }

    try {
      const URL = `https://${window.location.hostname}/${tableCode}`;
      const response = await axios.post(
        apiUrl + "/api/table/qr",
        { URL },
        config
      );
      const qrData = response.data.QRCode;
      console.log({ qrData, URL });
      setqrimage(qrData);
      toast.success("تم إنشاء رمز QR بنجاح!");
    } catch (error) {
      console.error("حدث خطأ أثناء إنشاء رمز QR:", error);
      toast.error("حدث خطأ أثناء إنشاء رمز QR!");
    }
  };

  // Function to create web QR code
  const changeCode = async (e, tableid) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }

    const generateTableCode = () => {
      return [...Array(20)]
        .map(() => Math.random().toString(36).charAt(2))
        .join("");
    };

    try {
      const tableCode = generateTableCode();
      const response = await axios.put(
        `${apiUrl}/api/table/${tableid}`,
        { tableCode },
        config
      );
      if (response) {
        toast.success("تم تغير كود الطاوله بنجاح!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        getAllTable();
      }
    } catch (error) {
      console.error("حدث خطأ أثناء إنشاء كود الطاوله", error);
      toast.error("حدث خطأ أثناء إنشاء كود الطاوله!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    }
  };

  const createwebQR = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    try {
      const URL = `https://${window.location.hostname}/`;
      const response = await axios.post(
        apiUrl + "/api/table/qr",
        { URL },
        config
      );
      const qrData = response.data.QRCode;

      setqrimage(qrData);
      toast.success("تم إنشاء رمز QR بنجاح!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("حدث خطأ أثناء إنشاء رمز QR للويب:", error);
      // عرض رسالة خطأ باستخدام toast
      toast.error("حدث خطأ أثناء إنشاء رمز QR للويب!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    }
  };

  // Function to get all tables
  const getAllTable = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (tablePermission && !tablePermission.read) {
      toast.warn("ليس لك صلاحية لعرض بيانات الطاولات");
      return;
    }

    try {
      const response = await axios.get(apiUrl + "/api/table");
      if (response.status === 200) {
        const tables = response.data;
        setlistoftable(tables);
        console.log({ tables });
      }
    } catch (error) {
      console.error("Error getting all tables:", error);
    }
  };

  // Function to delete a table
  const deleteTable = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (tablePermission && !tablePermission.delete) {
      toast.warn("ليس لك صلاحية لحذف طاوله ");
      return;
    }
    try {
      const response = await axios.delete(
        `${apiUrl}/api/table/${tableid}`,
        config
      );
      console.log(response.data);
      settableid(null);
      getAllTable();
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  const searchByNum = (num) => {
    if (!num) {
      getAllTable();
      return;
    }
    const tables = listoftable.filter(
      (table) => table.tableNumber.toString().startsWith(num) === true
    );
    setlistoftable(tables);
  };
  const filterByStatus = (Status) => {
    if (!Status) {
      getAllTable();
      return;
    }
    const filter = listoftable.filter((table) => table.isValid === Status);
    setlistoftable(filter);
  };

  const printtableqr = useRef();
  const handlePrinttableqr = useReactToPrint({
    content: () => printtableqr.current,
    copyStyles: true,
    removeAfterPrint: true,
  });
  const printwepqr = useRef();
  const handlePrintwepqr = useReactToPrint({
    content: () => printwepqr.current,
    copyStyles: true,
    removeAfterPrint: true,
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const handleCheckboxChange = (e) => {
    const Id = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedIds([...selectedIds, Id]);
    } else {
      const updatedSelectedIds = selectedIds.filter((id) => id !== Id);
      setSelectedIds(updatedSelectedIds);
    }
  };

  const deleteSelectedIds = async (e) => {
    e.preventDefault();
    console.log(selectedIds);
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (tablePermission && !tablePermission.delete) {
      toast.warn("ليس لك صلاحية لحذف طاوله ");
      return;
    }
    try {
      for (const Id of selectedIds) {
        await axios.delete(`${apiUrl}/api/table/${Id}`, config);
      }
      getAllTable();
      toast.success("Selected orders deleted successfully");
      setSelectedIds([]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete selected orders");
    }
  };

  useEffect(() => {
    getAllTable();
  }, []);

  return (
    <div className="w-100 px-3 d-flex align-itmes-center justify-content-start">
      <div className="table-responsive">
        <div className="table-wrapper p-3 mw-100">
          <div className="table-title">
            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between">
              <div className="col-sm-6 text-right">
                <h2>
                  ادارة <b>الطاولات</b>
                </h2>
              </div>
              <div className="col-12 col-md-6 p-0 m-0 d-flex flex-wrap aliegn-items-center justify-content-end print-hide">
                <a
                  href="#qrwebModal"
                  className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-info"
                  data-toggle="modal"
                >
                  <span
                    className="material-symbols-outlined"
                    data-toggle="tooltip"
                    title="QR"
                  >
                    qr_code_2_add
                  </span>
                  <span>انشاء qr للسايت</span>
                </a>
                <a
                  href="#addTableModal"
                  className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-success"
                  data-toggle="modal"
                >
                  {" "}
                  <span>اضافه طاولة جديدة</span>
                </a>
                <a
                  href="#deleteListTableModal"
                  className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-danger"
                  data-toggle="modal"
                >
                  {" "}
                  <span>حذف</span>
                </a>
              </div>
            </div>
          </div>
          <div className="table-filter print-hide">
            <div className="col-12 text-dark d-flex flex-wrap align-items-center justify-content-between p-0 m-0">
              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  عرض
                </label>
                <select
                  className="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => {
                    setStartPagination(0);
                    setEndPagination(e.target.value);
                  }}
                >
                  {(() => {
                    const options = [];
                    for (let i = 5; i < 100; i += 5) {
                      options.push(
                        <option key={i} value={i}>
                          {i}
                        </option>
                      );
                    }
                    return options;
                  })()}
                </select>
              </div>
              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  رقم الطاولة
                </label>
                <input
                  type="text"
                  className="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchByNum(e.target.value)}
                />
              </div>

              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  الحالة
                </label>
                <select
                  className="form-control border-primary m-0 p-2 h-auto"
                  name="Status"
                  id="Status"
                  form="carform"
                  onChange={(e) => filterByStatus(e.target.value)}
                >
                  <option value="">اختر</option>
                  <option value={true}>متاح</option>
                  <option value={false}>غير متاح</option>
                </select>
              </div>
            </div>
          </div>

          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>
                  <span className="custom-checkbox">
                    <input
                      type="checkbox"
                      className="form-check-input form-check-input-lg"
                      id="selectAll"
                    />
                    <label htmlFor="selectAll"></label>
                  </span>
                </th>
                <th>م</th>
                <th>رقم الطاولة</th>
                <th>عدد المقاعد</th>
                <th>السكشن</th>
                <th>المكان</th>
                <th>الحاله</th>
                <th>متاح</th>
                <th>تغير الكود</th>
                <th>الكود</th>
                <th>QR</th>
                <th>اجراءات</th>
              </tr>
            </thead>
            <tbody>
              {listoftable &&
                listoftable.map((table, i) => {
                  if ((i >= startPagination) & (i < endPagination)) {
                    return (
                      <tr key={i}>
                        <td>
                          <span className="custom-checkbox">
                            <input
                              type="checkbox"
                              id={`checkbox${i}`}
                              name="options[]"
                              value={table._id}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor={`checkbox${i}`}></label>
                          </span>
                        </td>
                        <td>{i + 1}</td>
                        <td>{table.tableNumber}</td>
                        <td>{table.chairs}</td>
                        <td>{table.sectionNumber}</td>
                        <td>{table.location}</td>
                        <td>{table.status}</td>
                        <td>{table.isValid ? "متاح" : "غير متاح"}</td>
                        <td>
                          <button
                            className="btn btn-success"
                            onClick={(e) => changeCode(e, table._id)}
                          >
                            تغير الكود
                          </button>
                        </td>
                        <td>{table.tableCode}</td>
                        <td>
                          <a
                            href="#qrTableModal"
                            className="edit"
                            data-toggle="modal"
                            onClick={() => {
                              settableid(table._id);
                              settableNumber(table.tableNumber);
                              settableCode(table.tableCode);
                              setqrimage("");
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              data-toggle="tooltip"
                              title="QR"
                            >
                              qr_code_2_add
                            </span>
                          </a>
                        </td>
                        <td>
                          <a
                            href="#editTableModal"
                            className="edit"
                            data-toggle="modal"
                            onClick={() => {
                              settableid(table._id);
                              settableNumber(table.tableNumber);
                              setchairs(table.chairs);
                              setlocation(table.location);
                              setisValid(table.isValid);
                            }}
                          >
                            <i
                              className="material-icons"
                              data-toggle="tooltip"
                              title="Edit"
                            >
                              &#xE254;
                            </i>
                          </a>

                          <a
                            href="#deleteTableModal"
                            className="delete"
                            data-toggle="modal"
                            onClick={() => settableid(table._id)}
                          >
                            <i
                              className="material-icons"
                              data-toggle="tooltip"
                              title="Delete"
                            >
                              &#xE872;
                            </i>
                          </a>
                        </td>
                      </tr>
                    );
                  }
                })}
            </tbody>
          </table>
          <div className="clearfix">
            <div className="hint-text text-dark">
              عرض{" "}
              <b>
                {listoftable.length > endPagination
                  ? endPagination
                  : listoftable.length}
              </b>{" "}
              من <b>{listoftable.length}</b> عنصر
            </div>
            <ul className="pagination">
              <li onClick={EditPagination} className="page-item disabled">
                <a href="#">السابق</a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endPagination === 5 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  1
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endPagination === 10 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  2
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endPagination === 15 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  3
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endPagination === 20 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  4
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endPagination === 25 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  5
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endPagination === 30 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  التالي
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div id="addTableModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={createTable}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">اضافه طاولة</h4>
                <button
                  type="button"
                  className="close m-0 p-1"
                  data-dismiss="modal"
                  aria-hidden="true"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body d-flex flex-wrap align-items-center p-0 m-0 text-center">
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    رقم السكشن
                  </label>
                  <input
                    type="Number"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => setsectionNumber(e.target.value)}
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    رقم الطاولة
                  </label>
                  <input
                    type="Number"
                    defaultValue={
                      listoftable.length > 0
                        ? listoftable[listoftable.length - 1].tableNumber
                        : ""
                    }
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => settableNumber(e.target.value)}
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    عدد المقاعد
                  </label>
                  <input
                    type="Number"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => setchairs(e.target.value)}
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    المكان
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => setlocation(e.target.value)}
                  ></input>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    متاح
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name="category"
                    id="category"
                    form="carform"
                    onChange={(e) => setisValid(e.target.value)}
                  >
                    <option value="">اختر</option>
                    <option value={true}>متاح</option>
                    <option value={false}>غير متاح</option>
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    ملاحظات
                  </label>
                  <textarea
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => setnotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer p-0 m-0 d-flex flex-nowrap align-items-center justify-content-between">
                <input
                  type="submit"
                  className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                  value="ضافه"
                />
                <input
                  type="button"
                  className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                  data-dismiss="modal"
                  value="إغلاق"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {tableid && (
        <div id="editTableModal" className="modal fade">
          <div className="modal-dialog modal-lg">
            <div className="modal-content shadow-lg border-0 rounded ">
              <form onSubmit={editTable}>
                <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                  <h4 className="modal-title">تعديل طاولة</h4>
                  <button
                    type="button"
                    className="close m-0 p-1"
                    data-dismiss="modal"
                    aria-hidden="true"
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body d-flex flex-wrap align-items-center p-0 m-0 text-center">
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      رقم السكشن
                    </label>
                    <input
                      type="Number"
                      className="form-control border-primary m-0 p-2 h-auto"
                      required
                      onChange={(e) => setsectionNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      رقم الطاولة
                    </label>
                    <input
                      type="Number"
                      defaultValue={tableNumber}
                      className="form-control border-primary m-0 p-2 h-auto"
                      required
                      onChange={(e) => settableNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      عدد المقاعد
                    </label>
                    <input
                      type="Number"
                      defaultValue={chairs}
                      className="form-control border-primary m-0 p-2 h-auto"
                      required
                      onChange={(e) => setchairs(e.target.value)}
                    />
                  </div>
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      المكان
                    </label>
                    <textarea
                      defaultValue={location}
                      className="form-control border-primary m-0 p-2 h-auto"
                      required
                      onChange={(e) => setlocation(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      متاح
                    </label>
                    <select
                      className="form-control border-primary m-0 p-2 h-auto"
                      name="category"
                      id="category"
                      form="carform"
                      onChange={(e) => setisValid(e.target.value)}
                    >
                      <option value="">اختر</option>
                      <option value={true}>متاح</option>
                      <option value={false}>غير متاح</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer p-0 m-0 d-flex flex-nowrap align-items-center justify-content-between">
                  <input
                    type="submit"
                    className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                    value="حفظ"
                  />
                  <input
                    type="button"
                    className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                    data-dismiss="modal"
                    value="إغلاق"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div id="qrTableModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={createQR}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">استخراج QR</h4>
              </div>
              <div className="modal-body d-flex flex-wrap align-items-center p-0 m-0 text-center">
                <div
                  ref={printtableqr}
                  className="form-group qrprint w-100 h-auto p-0 m-2 d-flex align-items-center justify-content-center"
                >
                  <div className="w-100 text-center">
                    <p
                      className="mb-3 text-nowrap text-center text-dark"
                      style={{
                        fontSize: "26px",
                        fontFamily: "Noto Nastaliq Urdu , serif",
                      }}
                    >
                      طاولة رقم {tableNumber}
                    </p>
                    {qrimage && (
                      <a href={qrimage} download>
                        <img
                          src={qrimage}
                          className="img-fluid  w-100 h-75"
                          alt="QR Code"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer p-0 m-0 d-flex flex-nowrap align-items-center justify-content-between">
                {qrimage ? (
                  <button
                    type="button"
                    className="col-6 btn p-3 m-0 btn-info"
                    onClick={handlePrinttableqr}
                  >
                    طباعة
                  </button>
                ) : (
                  <input
                    type="submit"
                    className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                    value="استخراج"
                  />
                )}
                <button
                  type="button"
                  className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                  data-dismiss="modal"
                >
                  اغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="qrwebModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={createwebQR}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">استخراج QR</h4>
              </div>
              <div className="modal-body d-flex flex-wrap align-items-center p-0 m-0 text-center">
                <div
                  ref={printwepqr}
                  className="form-group qrprint w-100 h-auto p-0 m-0 d-flex align-items-center justify-content-center"
                >
                  <div className="w-100 text-center text-dark">
                    <p
                      className="mb-3"
                      style={{
                        fontSize: "26px",
                        fontFamily: "Noto Nastaliq Urdu , serif",
                      }}
                    >
                      {restaurantData && restaurantData.name}
                    </p>
                    {qrimage && (
                      <a href={qrimage} download>
                        <img
                          src={qrimage}
                          className="img-fluid  w-100 h-75"
                          alt="QR Code"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer p-0 m-0 d-flex flex-nowrap align-items-center justify-content-between">
                {qrimage ? (
                  <button
                    type="button"
                    className="col-6 btn p-3 m-0 btn-info"
                    onClick={handlePrintwepqr}
                  >
                    طباعة
                  </button>
                ) : (
                  <input
                    type="submit"
                    className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                    value="استخراج"
                  />
                )}
                <button
                  type="button"
                  className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                  data-dismiss="modal"
                >
                  اغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="deleteTableModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={deleteTable}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">حذف طاولة</h4>
                <button
                  type="button"
                  className="close m-0 p-1"
                  data-dismiss="modal"
                  aria-hidden="true"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body text-center">
                <p className="text-right text-dark fs-3 fw-800 mb-2">
                  هل أنت متأكد من حذف هذا السجل؟
                </p>
                <p className="text-warning text-center mt-3">
                  <small>لا يمكن الرجوع في هذا الإجراء.</small>
                </p>
              </div>
              <div className="modal-footer p-0 m-0 d-flex flex-nowrap align-items-center justify-content-between">
                <input
                  type="submit"
                  className="btn btn-warning col-6 h-100 px-2 py-3 m-0"
                  value="حذف"
                />
                <input
                  type="button"
                  className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                  data-dismiss="modal"
                  value="إغلاق"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="deleteListTableModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={deleteSelectedIds}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">حذف طاولة</h4>
                <button
                  type="button"
                  className="close m-0 p-1"
                  data-dismiss="modal"
                  aria-hidden="true"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body text-center">
                <p className="text-right text-dark fs-3 fw-800 mb-2">
                  هل أنت متأكد من حذف هذا السجل؟
                </p>
                <p className="text-warning text-center mt-3">
                  <small>لا يمكن الرجوع في هذا الإجراء.</small>
                </p>
              </div>
              <div className="modal-footer p-0 m-0 d-flex flex-nowrap align-items-center justify-content-between">
                <input
                  type="submit"
                  className="btn btn-warning col-6 h-100 px-2 py-3 m-0"
                  value="حذف"
                />
                <input
                  type="button"
                  className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                  data-dismiss="modal"
                  value="إغلاق"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tables;
