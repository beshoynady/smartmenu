import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { detacontext } from "../../../../App";
import { toast, ToastContainer } from "react-toastify";
import "../orders/Orders.css";

const GrillConsumption = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const {
    restaurantData,
    permissionsList,
    setStartDate,
    setEndDate,
    filterByDateRange,
    filterByTime,
    employeeLoginInfo,
    formatDate,
    formatDateTime,
    setisLoading,
    EditPagination,
    startpagination,
    endpagination,
    setstartpagination,
    setendpagination,
  } = useContext(detacontext);


  const GrillUsegePermission =
    permissionsList &&
    permissionsList.filter(
      (permission) => permission.resource === "Grill Usage"
    )[0];


  const [stockItemId, setstockItemId] = useState("");
  const [stockItemName, setstockItemName] = useState("");
  const [quantityTransferred, setquantityTransferred] = useState();
  const [receivedBy, setreceivedBy] = useState("");
  const [consumptionQuantity, setconsumptionQuantity] = useState("");
  const [unit, setunit] = useState("");

  const [bookBalance, setbookBalance] = useState();
  const [actualBalance, setactualBalance] = useState();
  const [grillItemId, setgrillItemId] = useState();
  const [adjustment, setadjustment] = useState();

  // Function to add an item to grill consumption
  const addGrillItem = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0]; // Today's date in the format YYYY-MM-DD
    const consumptionToday = allGrillConsumption.filter((Consumption) => {
      const itemDate = new Date(Consumption.createdAt)
        .toISOString()
        .split("T")[0];
      return itemDate === today;
    });
    let consumption = null;
    if (consumptionToday.length > 0) {
      consumption = consumptionToday.find(
        (item) => item.stockItemId === stockItemId
      );
    }
    if (consumption) {
      try {
        if (!token) {
          // Handle case where token is not available
          toast.error("رجاء تسجيل الدخول مره اخري");
        }
        if (GrillUsegePermission && !GrillUsegePermission.update) {
          toast.warn("ليس لك صلاحية لتعديل عنصر بمخزن الاستهلاك");
          return;
        }
        // Make a PUT request to update an item
        const newquantityTransferred =
          consumption.quantityTransferred + quantityTransferred;
        const newBalance = consumption.bookBalance + quantityTransferred;
        const response = await axios.put(
          `${apiUrl}/api/consumption/${consumption._id}`,
          {
            quantityTransferred: newquantityTransferred,
            receivedBy,
            bookBalance: newBalance,
          },
          config
        );

        // Check if the item was updated successfully
        if (response.status === 200) {
          setstockItemId("");
          setstockItemName("");
          setquantityTransferred(0);
          getGrillConsumption();
          // Show a success toast if the quantity is added
          toast.success("تمت إضافة الكمية بنجاح");
        } else {
          // Show an error toast if adding the quantity failed
          toast.error("فشلت عملية إضافة الكمية");
        }
      } catch (error) {
        // Show an error toast if an error occurs during the request
        toast.error("فشلت عملية إضافة الكمية");
        console.error(error);
      }
    } else {
      try {
        if (!token) {
          // Handle case where token is not available
          toast.error("رجاء تسجيل الدخول مره اخري");
        }
        if (GrillUsegePermission && !GrillUsegePermission.create) {
          toast.warn("ليس لك صلاحيه لاضافه عنصر بمخزن الاستهلاك");
          return;
        }
        // Make a POST request to add an item
        const response = await axios.post(
          apiUrl + "/api/consumption",
          {
            stockItemId,
            stockItemName,
            quantityTransferred,
            bookBalance: quantityTransferred,
            consumptionSource: "grill",
            unit,
            receivedBy,
          },
          config
        );

        // Check if the item was added successfully
        if (response.status === 201) {
          setstockItemId("");
          setstockItemName("");
          setquantityTransferred(0);
          getGrillConsumption();
          // Show a success toast if the item is added
          toast.success("تمت إضافة العنصر بنجاح");
        } else {
          // Show an error toast if adding the item failed
          toast.error("فشلت عملية إضافة العنصر");
        }
      } catch (error) {
        // Show an error toast if an error occurs during the request
        toast.error("فشلت عملية إضافة العنصر");
        console.error(error);
      }
    }
  };

  const updategrillItem = async (e) => {
    e.preventDefault();
    console.log("updategrillItem");
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (GrillUsegePermission && !GrillUsegePermission.update) {
      toast.warn("ليس لك صلاحية لتعديل عنصر بمخزن الاستهلاك");
      return;
    }
    try {
      const update = await axios.put(
        `${apiUrl}/api/consumption/${grillItemId}`,
        {
          adjustment,
          actualBalance,
        },
        config
      );
      if (update.status === 200) {
        try {
          if (!token) {
            // Handle case where token is not available
            toast.error("رجاء تسجيل الدخول مره اخري");
          }
          // Make a POST request to add an item
          const response = await axios.post(
            apiUrl + "/api/consumption",
            {
              stockItemId,
              stockItemName,
              quantityTransferred: actualBalance,
              bookBalance: actualBalance,
              unit,
              receivedBy,
            },
            config
          );

          // Check if the item was added successfully
          if (response.status === 201) {
            setstockItemId("");
            setstockItemName("");
            setquantityTransferred(0);
            getGrillConsumption();
            // Show a success toast if the item is added
            toast.success("تمت تعديل العنصر بنجاح");
          } else {
            // Show an error toast if adding the item failed
            toast.error("فشلت عملية تعديل العنصر");
          }
        } catch (error) {
          // Show an error toast if an error occurs during the request
          toast.error("فشلت عملية تعديل العنصر");
          console.error(error);
        }
      }
    } catch (error) {
      console.error("Error occurred:", error);
      // Add toast for error
      toast.error("حدث خطأ");
    }
  };

  const [AllStockItems, setAllStockItems] = useState([]);
  // Function to retrieve all stock items
  const getStockItems = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    try {
      const response = await axios.get(apiUrl + "/api/stockitem/", config);

      if (response.status === 200) {
        const stockItems = response.data.reverse();
        setAllStockItems(stockItems);
        console.log(response.data);
      } else {
        // Handle other statuses if needed
        console.log(`Unexpected status code: ${response.status}`);
        toast.error("Failed to retrieve stock items");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to retrieve stock items");
    }
  };

  const deletegrillItem = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (GrillUsegePermission && !GrillUsegePermission.delete) {
      toast.warn("ليس لك صلاحية لحذف عنصر بمخزن الاستهلاك");
      return;
    }
    try {
      const response = await axios.delete(
        apiUrl + "/api/consumption/" + grillItemId,
        config
      );
      if (response.status === 200) {
        getGrillConsumption();
      } else {
        toast.error("Failed to deltet grillconsumption items");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to retrieve grillconsumption items");
    }
  };

  // const [AllCategoryStock, setAllCategoryStock] = useState([])
  // // Function to retrieve all category stock
  // const getAllCategoryStock = async () => {
  //   try{
  // if (!token) {
  // Handle case where token is not available
  //   toast.error('رجاء تسجيل الدخول مره اخري');
  // }
  //     const res = await axios.get(apiUrl+'/api/categoryStock/');
  //     setAllCategoryStock(res.data);
  //   } catch (error) {
  //     console.log(error);

  //     // Notify on error
  //     toast.error('Failed to retrieve category stock');
  //   }
  // };

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [allGrillConsumption, setAllGrillConsumption] = useState([]);
  const [grillConsumptionForView, setgrillConsumptionForView] = useState([]);

  const getGrillConsumption = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    try {
      console.log("Fetching grill consumption...");
      const response = await axios.get(apiUrl + "/api/consumption", config);
      if (response && response.data) {
        const Consumptions = response.data.data;
        const grillConsumptions = Consumptions.filter(
          (consumption) => consumption.consumptionSource === "grill"
        );
        setAllGrillConsumption(grillConsumptions.reverse());
        setgrillConsumptionForView(filterByTime(today, grillConsumptions));
      } else {
        console.log("Unexpected response or empty data");
      }
    } catch (error) {
      console.error("Error fetching grill consumption:", error);
      // Handle error: Notify user, log error, etc.
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    console.log("Selected Date:", selectedDate);
    setDate(selectedDate);
  };

  const searchBygrillConsumption = (name) => {
    if (!name) {
      getGrillConsumption();
      return;
    }
    const filter = grillConsumptionForView.filter(
      (item) => item.stockItemName.startsWith(name) === true
    );
    setgrillConsumptionForView(filter);
  };

  // Initialize state variables for date and filtered grill consumption
  // const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // const [grillConsumptionForView, setgrillConsumptionForView] = useState([]);

  // // Function to filter grill consumption based on creation date
  // const filterByConsumCreatedAt = () => {
  //   console.log({datett:date})
  //   const filtered = allGrillConsumption.filter((kitItem) => {
  //     new Date(kitItem.createdAt).toISOString().split('T')[0] === date;
  //     console.log({createdAt:kitItem.createdAt})
  //     return itemDate === date;
  //   });
  //   console.log({filtered})
  //   setgrillConsumptionForView(filtered);
  // };

  useEffect(() => {
    getStockItems();
    getGrillConsumption();
    // filterByConsumCreatedAt()
  }, [date]);

  return (
    <div className="w-100 px-3 d-flex align-itmes-center justify-content-start">
      <div className="table-responsive mt-1">
        <div className="table-wrapper p-3 mw-100">
          <div className="table-title">
            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between">
              <div className="text-right">
                <h2>
                  ادارة <b>استهلاك قسم الشوايه</b>
                </h2>
              </div>
              <div className="col-12 col-md-6 p-0 m-0 d-flex flex-wrap aliegn-items-center justify-content-end print-hide">
                <a
                  href="#addItemModal"
                  className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-success"
                  data-toggle="modal"
                >
                  {" "}
                  <span>اضافه صنف جديد</span>
                </a>

                {/* <a href="#updateItemModal" className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-danger" data-toggle="modal" > <span>حذف</span></a> */}
              </div>
            </div>
          </div>

          <div class="table-filter w-100 p-0 print-hide">
            <div className="col-12 d-flex flex-row flex-wrap align-items-center justify-content-start text-dark">
              <div class="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  عرض
                </label>
                <select
                  className="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => {
                    setstartpagination(0);
                    setendpagination(e.target.value);
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
                  التاريخ
                </label>
                <input
                  id="dateInput"
                  type="date"
                  value={date}
                  class="form-control border-primary m-0 p-2 h-auto"
                  onChange={handleDateChange}
                />
              </div>

              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  اسم الصنف
                </label>
                <input
                  type="text"
                  class="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchBygrillConsumption(e.target.value)}
                />
              </div>

              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  اختر الصنف
                </label>
                <select
                  class="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchBygrillConsumption(e.target.value)}
                >
                  <option value={""}>الكل</option>
                  {grillConsumptionForView.map((consumption) => {
                    return (
                      <option value={consumption.stockItemName}>
                        {consumption.stockItemName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="col-12 text-dark d-flex flex-wrap align-items-center justify-content-start p-0 m-0 mt-3">
                <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    فلتر حسب الوقت
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) =>
                      setAllGrillConsumption(
                        filterByTime(e.target.value, allGrillConsumption)
                      )
                    }
                  >
                    <option value="">اختر</option>
                    <option value="today">اليوم</option>
                    <option value="week">هذا الأسبوع</option>
                    <option value="month">هذا الشهر</option>
                    <option value="month">هذه السنه</option>
                  </select>
                </div>

                <div className="d-flex align-items-stretch justify-content-between flex-nowrap p-0 m-0 px-1">
                  <label className="form-label text-nowrap d-flex align-items-center justify-content-center p-0 m-0 ml-1">
                    <strong>مدة محددة:</strong>
                  </label>

                  <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      من
                    </label>
                    <input
                      type="date"
                      className="form-control border-primary m-0 p-2 h-auto"
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="اختر التاريخ"
                    />
                  </div>

                  <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      إلى
                    </label>
                    <input
                      type="date"
                      className="form-control border-primary m-0 p-2 h-auto"
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="اختر التاريخ"
                    />
                  </div>

                  <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                    <button
                      type="button"
                      className="btn btn-primary h-100 p-2 "
                      onClick={() =>
                        setAllGrillConsumption(
                          filterByDateRange(allGrillConsumption)
                        )
                      }
                    >
                      <i className="fa fa-search"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning h-100 p-2"
                      onClick={getGrillConsumption}
                    >
                      استعادة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>م</th>
                <th>اسم الصنف</th>
                <th>الكمية المضافه</th>
                <th>الاستهلاك</th>
                <th>الوحدة</th>
                <th>الرصيد</th>
                <th>التسويه</th>
                <th>المنتجات</th>
                <th>بواسطه</th>
                <th>تاريخ الاضافه</th>
                <th>اجراءات</th>
              </tr>
            </thead>
            <tbody>
              {grillConsumptionForView &&
                grillConsumptionForView.map((item, i) => {
                  if ((i >= startpagination) & (i < endpagination)) {
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{item.stockItemName}</td>
                        <td>{item.quantityTransferred}</td>
                        <td>{item.consumptionQuantity}</td>
                        <td>{item.unit}</td>
                        <td>{item.bookBalance}</td>
                        <td>{item.adjustment}</td>
                        <td>
                          {item.productsProduced.length > 0
                            ? item.productsProduced.map((product, j) => (
                                <span key={j}>{`[${product.productionCount} * ${
                                  product.productName
                                } ${
                                  product.sizeName ? product.sizeName : ""
                                }]`}</span>
                              ))
                            : "لا يوجد"}
                        </td>
                        <td>{item.receivedBy?.username}</td>
                        <td>{formatDateTime(item.createdAt)}</td>
                        <td>
                          <a
                            href="#updategrillItemModal"
                            className="edit"
                            data-toggle="modal"
                            onClick={() => {
                              setreceivedBy(employeeLoginInfo.id);
                              setgrillItemId(item._id);
                              setstockItemId(item.stockItemId?._id);
                              setstockItemName(item.stockItemName);
                              setquantityTransferred(item.quantityTransferred);
                              setbookBalance(item.bookBalance);
                              setunit(item.unit);
                              setconsumptionQuantity(item.consumptionQuantity);
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
                            href="#deleteStockItemModal"
                            className="delete"
                            data-toggle="modal"
                            onChange={() => setgrillItemId(item._id)}
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
                {grillConsumptionForView.length > endpagination
                  ? endpagination
                  : grillConsumptionForView.length}
              </b>{" "}
              من <b>{grillConsumptionForView.length}</b> عنصر
            </div>
            <ul className="pagination">
              <li onClick={EditPagination} className="page-item disabled">
                <a href="#">السابق</a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endpagination === 5 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  1
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endpagination === 10 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  2
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endpagination === 15 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  3
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endpagination === 20 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  4
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endpagination === 25 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  5
                </a>
              </li>
              <li
                onClick={EditPagination}
                className={`page-item ${endpagination === 30 ? "active" : ""}`}
              >
                <a href="#" className="page-link">
                  التالي
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div id="addItemModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={(e) => addGrillItem(e)}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">اضافه صنف </h4>
                <button
                  type="button"
                  className="close m-0 p-1"
                  data-dismiss="modal"
                  aria-hidden="true"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body d-flex flex-wrap align-items-center p-3 text-right">
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الصنف
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name="category"
                    id="category"
                    form="carform"
                    onChange={(e) => {
                      setstockItemId(e.target.value);
                      setunit(
                        AllStockItems.filter(
                          (stock) => stock._id === e.target.value
                        )[0].smallUnit
                      );
                      setreceivedBy(employeeLoginInfo.id);
                      setstockItemName(
                        AllStockItems.filter(
                          (it) => it._id === e.target.value
                        )[0].itemName
                      );
                    }}
                  >
                    <option>اختر الصنف</option>
                    {AllStockItems.map((StockItems, i) => {
                      return (
                        <option value={StockItems._id} key={i}>
                          {StockItems.itemName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    رصيد محول
                  </label>
                  <input
                    type="Number"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) =>
                      setquantityTransferred(Number(e.target.value))
                    }
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الوحدة{" "}
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    defaultValue={unit}
                  ></input>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التاريخ
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    Value={formatDateTime(new Date())}
                    required
                    readOnly
                  />
                </div>
              </div>
              <div className="modal-footer d-flex flex-nowrap align-items-center justify-content-between m-0 p-1">
                <input
                  type="submit"
                  className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                  value="اضافه"
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
      <div id="updategrillItemModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={(e) => updategrillItem(e)}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">تسويه الرصيد</h4>
                <button
                  type="button"
                  className="close m-0 p-1"
                  data-dismiss="modal"
                  aria-hidden="true"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body d-flex flex-wrap align-items-center p-3 text-right">
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    اسم الصنف
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={stockItemName}
                    required
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الكمية المستلمة
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={quantityTransferred}
                    required
                    readOnly
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الكمية المستهلكه
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={consumptionQuantity}
                    required
                    readOnly
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الرصيد الدفتري
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={bookBalance}
                    required
                    readOnly
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الرصيد الفعلي
                  </label>
                  <input
                    type="Number"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => {
                      setadjustment(Number(e.target.value) - bookBalance);
                      setactualBalance(e.target.value);
                    }}
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التسويه
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={adjustment}
                    required
                    readOnly
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الوحدة{" "}
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={unit}
                    required
                  ></input>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التاريخ
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={formatDateTime(new Date())}
                    required
                    readOnly
                  />
                </div>
              </div>
              <div className="modal-footer d-flex flex-nowrap align-items-center justify-content-between m-0 p-1">
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

      <div id="deleteStockItemModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={deletegrillItem}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">حذف منتج</h4>
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
              <div className="modal-footer d-flex flex-nowrap align-items-center justify-content-between m-0 p-1">
                <input
                  type="button"
                  className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                  data-dismiss="modal"
                  value="إغلاق"
                />
                <input
                  type="submit"
                  className="btn btn-danger col-6 h-100 px-2 py-3 m-0"
                  value="تحديث"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrillConsumption;
