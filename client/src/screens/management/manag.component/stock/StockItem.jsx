import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { detacontext } from "../../../../App";
import { toast } from "react-toastify";
import "../orders/Orders.css";

const StockItem = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e"); // Retrieve the token from localStorage
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

  const stockItemPermission =
    permissionsList &&
    permissionsList.filter(
      (permission) => permission.resource === "stock Item"
    )[0];

  // State variables for creating or editing a stock item
  const [itemCode, setItemCode] = useState(""); // For item code
  const [itemName, setItemName] = useState(""); // For item name
  const [categoryId, setCategoryId] = useState(""); // For category ID
  const [stores, setstores] = useState([]);
  const [largeUnit, setLargeUnit] = useState(""); // For large unit
  const [parts, setParts] = useState(""); // For parts
  const [smallUnit, setSmallUnit] = useState(""); // For small unit
  const [costOfPart, setcostOfPart] = useState(0); // For small unit
  const [minThreshold, setMinThreshold] = useState(""); // For minimum threshold
  const [costMethod, setCostMethod] = useState(""); // For cost method (if necessary)
  const [suppliers, setSuppliers] = useState([]); // For suppliers (if necessary)
  const [isActive, setisActive] = useState(true); // For isActive (if necessary)
  const [notes, setNotes] = useState(""); // For notes

  const [stockItemId, setStockItemId] = useState(""); // For stock item ID
  const costMethodEN = ["FIFO", "LIFO", "Weighted Average"];
  const costMethodAR = [
    "الوارد اولا يصرف اولا",
    "الوارد اخيرا يصرف اولا",
    "متوسط السعر",
  ];

  const handleStoreSelection = (e) => {
    const selectedStoreId = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setstores((prevStores) => [...prevStores, { storeId: selectedStoreId }]);
    } else {
      const removeStoreId= stores.filter((store) => store.storeId !== selectedStoreId)
      setstores(removeStoreId);
    }
  };
  

  const generateItemCode = () => {
    if (!categoryId) {
      toast.warn("اختر اولا التصنيف ");
      return;
    }
    const category = AllCategoryStock.find(
      (category) => category._id === categoryId
    );
    if (!category) {
      toast.error("التصنيف غير موجود");
      return;
    }

    const categoryCode = category.categoryCode;

    const filterStockItemByCategory = AllStockItems.filter(
      (item) => item.categoryId?._id === categoryId
    ).reverse();
    const itemOrder = filterStockItemByCategory.length + 1;
    function generate(categoryCode, itemOrder) {
      return `${categoryCode}-${String(itemOrder).padStart(4, "0")}`;
    }

    const itemCodeGenerated = generate(categoryCode, itemOrder);
    setItemCode(itemCodeGenerated);
  };

  const createItem = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (stockItemPermission && !stockItemPermission.create) {
      toast.warn("ليس لك صلاحية لانشاء عنصر جديد في المخزن");
      return;
    }
    try {
      const isItemDuplicate =
        AllStockItems &&
        AllStockItems.some(
          (item) => item.itemName === itemName || item.itemCode === itemCode
        );

      if (isItemDuplicate) {
        toast.warn("هذا الاسم او الكود مكرر ! حاول مره اخري");
        return;
      }
      setisLoading(true);
      console.log({ stores });

      const response = await axios.post(
        `${apiUrl}/api/stockitem/`,
        {
          itemCode,
          itemName,
          categoryId,
          stores,
          largeUnit,
          parts,
          smallUnit,
          minThreshold,
          costMethod,
          isActive,
          notes,
        },
        config
      );
      console.log(response.data);

      if (response.data.error === "Item itemCode already exists") {
        toast.warn("هذا الكود موجود من قبل");
      }

      if (response) {
        getStockItems();
      }

      toast.success("تم إنشاء عنصر المخزون بنجاح");
      setisLoading(false);
    } catch (error) {
      console.log(error);
      setisLoading(false);
      toast.error("فشل في إنشاء عنصر المخزون");
    } finally {
      setstockitem({});
      setItemCode("");
      setStockItemId("");
      setstores([]);
      setCategoryId("");
      setItemName("");
      setMinThreshold(0);
      setLargeUnit("");
      setSmallUnit("");
      setParts(0);
      setCostMethod("");
      setNotes("");
      setisActive("");
    }
  };

  // Function to edit a stock item
  const editStockItem = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (stockItemPermission && !stockItemPermission.update) {
      toast.warn("ليس لك صلاحية لتعديل عناصر المخزن");
      return;
    }

    setisLoading(true);
    try {
      const response = await axios.put(
        `${apiUrl}/api/stockitem/${stockItemId}`,
        {
          itemCode,
          itemName,
          categoryId,
          stores,
          largeUnit,
          parts,
          smallUnit,
          minThreshold,
          costMethod,
          isActive,
          notes,
        },
        config
      );
      if (response) {
        getStockItems(); // Update the list of stock items after editing
      }

      // Notify on success
      toast.success("تم تحديث عنصر المخزون بنجاح");
      setisLoading(false);
    } catch (error) {
      console.log(error);
      setisLoading(false);
      // Notify on error
      toast.error("فشل في تحديث عنصر المخزون");
    } finally {
      setstockitem({});
      setItemCode("");
      setStockItemId("");
      setstores([]);
      setCategoryId("");
      setItemName("");
      setMinThreshold(0);
      setLargeUnit("");
      setSmallUnit("");
      setParts(0);
      setCostMethod("");
      setNotes("");
      setisActive("");
    }
  };

  // Function to delete a stock item
  const deleteStockItem = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    if (stockItemPermission && !stockItemPermission.delete) {
      toast.warn("ليس لك صلاحية لحذف عنصر من المخزن");
      return;
    }
    setisLoading(true);
    try {
      const response = await axios.delete(
        `${apiUrl}/api/stockitem/${stockItemId}`,
        config
      );
      if (response.isActive === 200) {
        console.log(response);
        getStockItems(); // Update the list of stock items after deletion

        // Notify on success
        toast.success("تم حذف عنصر المخزون بنجاح");
      }
      setisLoading(false);
    } catch (error) {
      console.log(error);
      setisLoading(false);
      // Notify on error
      toast.error("فشل في حذف عنصر المخزون");
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
    if (stockItemPermission && !stockItemPermission.read) {
      toast.warn("ليس لك صلاحية لعرض عناصر المخزن");
      return;
    }
    setisLoading(true);
    try {
      const response = await axios.get(apiUrl + "/api/stockitem/", config);

      if (!response || !response.data) {
        // Handle unexpected response or empty data
        throw new Error("استجابة غير متوقعة أو بيانات فارغة");
      }

      const stockItems = response.data.reverse();
      setAllStockItems(stockItems);
      console.log({ stockItems });
      // Notify on success
      toast.success("تم استرداد عناصر المخزون بنجاح");
      setisLoading(false);
    } catch (error) {
      console.error(error);
      setisLoading(false);
      // Notify on error
      toast.error("فشل في استرداد عناصر المخزون");
    }
  };

  const [AllCategoryStock, setAllCategoryStock] = useState([]);
  // Function to retrieve all category stock
  const getAllCategoryStock = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    setisLoading(true);
    try {
      const response = await axios.get(apiUrl + "/api/categoryStock/", config);
      setAllCategoryStock(response.data.reverse());
      setisLoading(false);
    } catch (error) {
      console.error("Error fetching category stock:", error);
      toast.error("حدث خطأ اثناء جلب بيانات التصنيفات ! اعد تحميل الصفحة");
      setisLoading(false);
    }
  };

  const [allStores, setAllStores] = useState([]);

  const getAllStores = async () => {
    if (!token) {
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }

    try {
      const response = await axios.get(apiUrl + "/api/store/", config);
      setAllStores(response.data.reverse());
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("حدث خطأ اثناء جلب بيانات المخزنات! اعد تحميل الصفحة");
    }
  };

  const [stockitem, setstockitem] = useState({});
  const handelEditStockItemModal = (stockitem) => {
    const item = JSON.parse(stockitem);
    setstockitem(item);
    setItemCode(item.itemCode);
    setStockItemId(item._id);
    setCategoryId(item.categoryId?._id);
    setItemName(item.itemName);
    setMinThreshold(item.minThreshold);
    setLargeUnit(item.largeUnit);
    setSmallUnit(item.smallUnit);
    setParts(item.parts);
    setCostMethod(item.costMethod);
    setNotes(item.notes);
    setisActive(item.isActive);
    console.log({stores:item.stores})
    if (item.stores && item.stores.length > 0) {
      const listOfStores = item.stores.map((store) => ({ storeId: store._id }));
      console.log({listOfStores})
      setstores(listOfStores);
    }
  };

  const searchByitem = (name) => {
    if (!name) {
      getStockItems();
      return;
    }
    const filter = AllStockItems.filter((item) =>
      item.itemName.toLowerCase().startsWith(name.toLowerCase())
    );
    setAllStockItems(filter);
  };

  const searchByCategory = async (category) => {
    if (!category) {
      getStockItems();
      return;
    }
    const filter = AllStockItems.filter(
      (item) => item.categoryId?._id === category
    );
    setAllStockItems(filter);
  };

  const [AllSuppliers, setAllSuppliers] = useState([]);
  // Function to retrieve all suppliers
  const getAllSuppliers = async () => {
    try {

      const response = await axios.get(apiUrl + "/api/supplier/", config);

      if (!response || !response.data) {
        // Handle unexpected response or empty data
        throw new Error("استجابة غير متوقعة أو بيانات فارغة");
      }

      const suppliers = response.data.reverse();
      if (suppliers.length > 0) {
        setAllSuppliers(suppliers);
        toast.success("تم استرداد جميع الموردين بنجاح");
      }

      // Notify on success
    } catch (error) {
      console.error(error);

      // Notify on error
      toast.error("فشل في استرداد الموردين");
    }
  };
  useEffect(() => {
    getStockItems();
    getAllStores();
    getAllSuppliers();
    getAllCategoryStock();
  }, []);

  return (
    <div className="w-100 px-3 d-flex align-itmes-center justify-content-start">
      <div className="table-responsive mt-1">
        <div className="table-wrapper p-3 mw-100">
          <div className="table-title">
            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between">
              <div className="text-right">
                <h2>
                  ادارة <b>عناصر المخزن</b>
                </h2>
              </div>
              {stockItemPermission &&
                stockItemPermission &&
                stockItemPermission &&
                stockItemPermission.create && (
                  <div className="col-12 col-md-6 p-0 m-0 d-flex flex-wrap aliegn-items-center justify-content-end print-hide">
                    <a
                      href="#addStockItemModal"
                      className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-success"
                      data-toggle="modal"
                    >
                      {" "}
                      <span>اضافه منتج جديد</span>
                    </a>

                    {/* <a href="#deleteStockItemModal" className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-danger" data-toggle="modal"> <span>حذف</span></a> */}
                  </div>
                )}
            </div>
          </div>
          <div className="table-filter print-hide">
            <div className="col-12 text-dark d-flex flex-wrap align-items-center justify-content-start p-0 m-0">
              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
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
                  اسم الصنف
                </label>
                <input
                  type="text"
                  className="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchByitem(e.target.value)}
                />
              </div>

              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  نوع المخزن
                </label>
                <select
                  className="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchByCategory(e.target.value)}
                >
                  <option value={""}>الكل</option>
                  {AllCategoryStock.map((category, i) => {
                    return (
                      <option value={category._id} key={i}>
                        {category.categoryName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>م</th>
                <th>الكود</th>
                <th>اسم الصنف</th>
                <th>المخازن</th>
                <th>التصنيف</th>
                <th>الوحدة كبيرة</th>
                <th>عدد الوحدات</th>
                <th>الوحدة صغيرة</th>
                <th>الحد الادني</th>
                <th>طريقة التكلفة</th>
                <th>تكلفه الوحده</th>
                <th>الموردون</th>
                <th>الحالة</th>
                <th>اضيف بواسطه</th>
                <th>تاريخ الاضافه</th>
                <th>ملاحظات</th>
                <th>اجراءات</th>
              </tr>
            </thead>
            <tbody>
              {AllStockItems &&
                AllStockItems.map((item, i) => {
                  if ((i >= startpagination) & (i < endpagination)) {
                    return (
                      <tr
                        key={i}
                        className={`${
                          item.currentBalance === 0
                            ? "bg-danger text-white"
                            : item.currentBalance < 0
                            ? "bg-secondary text-white"
                            : item.currentBalance < item.minThreshold
                            ? "bg-warning"
                            : ""
                        }`}
                      >
                        <td>{i + 1}</td>
                        <td>{item.itemCode}</td>
                        <td>{item.itemName}</td>
                        <td>
                          {item.stores
                            ?.map((store) => store.storeId?.storeName)
                            .join(" - ")}
                        </td>
                        <td>{item.categoryId?.categoryName}</td>
                        <td>{item.largeUnit}</td>
                        <td>{item.parts}</td>
                        <td>{item.smallUnit}</td>
                        <td>{item.minThreshold}</td>
                        <td>{item.costMethod}</td>
                        <td>{item.costOfPart}</td>
                        <td>
                          {/* {item.suppliers.map(
                            (supplier, i) =>
                              `${supplier.fullname}${
                                i < suppliers.length ? "-" : ""
                              } `
                          )} */}
                          {AllSuppliers.filter((supplier) =>
                            supplier.itemsSupplied?.some(
                              (itemSupplied) => itemSupplied._id === item._id
                            )
                          )
                            .map((supplier) => supplier.name)
                            .join("-")}
                        </td>
                        <td>{item.isActive ? "نشط" : "غير نشط"}</td>
                        <td>{item.createdBy?.fullname}</td>
                        <td>{formatDateTime(item.createdAt)}</td>
                        <td>{item.notes}</td>
                        <td>
                          {stockItemPermission &&
                            stockItemPermission &&
                            stockItemPermission &&
                            stockItemPermission.update && (
                              <a
                                href="#editStockItemModal"
                                className="edit"
                                data-toggle="modal"
                                onClick={() => {
                                  handelEditStockItemModal(
                                    JSON.stringify(item)
                                  );
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
                            )}
                          {stockItemPermission &&
                            stockItemPermission.delete && (
                              <a
                                href="#deleteStockItemModal"
                                className="delete"
                                data-toggle="modal"
                                onClick={() => setStockItemId(item._id)}
                              >
                                <i
                                  className="material-icons"
                                  data-toggle="tooltip"
                                  title="Delete"
                                >
                                  &#xE872;
                                </i>
                              </a>
                            )}
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
                {AllStockItems.length > endpagination
                  ? endpagination
                  : AllStockItems.length}
              </b>{" "}
              من <b>{AllStockItems.length}</b> عنصر
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

      <div id="addStockItemModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={createItem}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">اضافه صنف بالمخزن</h4>
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
                    required
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    المخزن
                  </label>
                  <div className="checkbox-group border-primary col-6 p-2">
                    {allStores.map((store, i) => (
                      <div key={i} className="form-check p-0 pl-0">
                        <input
                          type="checkbox"
                          id={`store-${store._id}`}
                          name="stores"
                          value={store._id}
                          className="form-check-input"
                          onChange={handleStoreSelection}
                        />
                        <label
                          htmlFor={`store-${store._id}`}
                          className="form-check-label mr-4"
                        >
                          {store.storeName}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التصنيف
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name="category"
                    id="category"
                    form="carform"
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option>اختر التصنيف</option>
                    {AllCategoryStock.map((category, i) => {
                      return (
                        <option value={category._id} key={i}>
                          {category.categoryName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الكود
                  </label>
                  <div className="form-group col-12 d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control border-primary m-0 p-2 h-auto"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                    />
                    <input
                      type="button"
                      className="btn btn-primary ms-2 m-0 p-2 h-auto"
                      value="انشاء كود"
                      onClick={generateItemCode}
                    />
                  </div>
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الوحدة الكبيرة
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => setLargeUnit(e.target.value)}
                  ></input>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الوحدة الصغيره
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => setSmallUnit(e.target.value)}
                  ></input>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الحد الادني
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => {
                      setMinThreshold(e.target.value);
                    }}
                  />
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    عدد الوحدات
                  </label>
                  <input
                    type="Number"
                    min={0}
                    className="form-control border-primary m-0 p-2 h-auto"
                    required
                    onChange={(e) => {
                      setParts(e.target.value);
                    }}
                  />
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    طريقه حساب التكلفه
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name="category"
                    id="category"
                    form="carform"
                    onChange={(e) => setCostMethod(e.target.value)}
                  >
                    <option>اخترالطريقه'</option>
                    {costMethodEN.map((method, i) => {
                      return (
                        <option value={method} key={i}>
                          {costMethodAR[i]}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الحاله
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name="category"
                    id="category"
                    form="carform"
                    onChange={(e) => setisActive(e.target.value)}
                  >
                    <option>اختر الحاله</option>
                    <option value={true}>نشط</option>
                    <option value={false}>غير نشط</option>
                  </select>
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التاريخ
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    Value={new Date().toLocaleDateString()}
                    required
                    readOnly
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الملاحظات
                  </label>
                  <textarea
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => setNotes(e.target.value)}
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

      <div id="editStockItemModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={(e) => editStockItem(e, employeeLoginInfo.id)}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">تعديل صنف بالمخزن</h4>
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
                    defaultValue={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    المخزن
                  </label>
                  <div className="checkbox-group border-primary col-6 p-2">
                    {allStores.map((store, i) => (
                      <div key={i} className="form-check p-0 pl-0">
                        <input
                          type="checkbox"
                          id={`store-${store._id}`}
                          name="stores"
                          value={store._id}
                          className="form-check-input"
                          checked={stores.find((s) => s.storeId === store._id) !== undefined}
                          onChange={handleStoreSelection}
                        />
                        <label
                          htmlFor={`store-${store._id}`}
                          className="form-check-label mr-4"
                        >
                          {store.storeName}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التصنيف
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value={stockitem.categoryId?._id}>
                      {stockitem.categoryId?.categoryName}
                    </option>
                    {AllCategoryStock.map((category, i) => {
                      return (
                        <option value={category._id} key={i}>
                          {category.categoryName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الكود
                  </label>
                  <div className="form-group col-12 d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control border-primary m-0 p-2 h-auto"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                    />
                    <input
                      type="button"
                      className="btn btn-primary ms-2 m-0 p-2 h-auto"
                      value="انشاء كود"
                      onClick={generateItemCode}
                    />
                  </div>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الوحدة الكبيرة
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={largeUnit}
                    onChange={(e) => setLargeUnit(e.target.value)}
                  ></input>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الوحدة الصغيره
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={smallUnit}
                    onChange={(e) => setSmallUnit(e.target.value)}
                  ></input>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الحد الادني
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="form-control border-primary m-0 p-2 h-auto"
                    value={minThreshold}
                    onChange={(e) => {
                      setMinThreshold(e.target.value);
                    }}
                  />
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    عدد الوحدات
                  </label>
                  <input
                    type="Number"
                    min={0}
                    className="form-control border-primary m-0 p-2 h-auto"
                    value={parts}
                    onChange={(e) => {
                      setParts(e.target.value);
                    }}
                  />
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    طريقه حساب التكلفه
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => setCostMethod(e.target.value)}
                  >
                    <option value={costMethod}>{costMethod}</option>
                    {costMethodEN.map((method, i) => {
                      return (
                        <option value={method} key={i}>
                          {costMethodAR[i]}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الحاله
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    defaultValue={isActive}
                    onChange={(e) => setisActive(e.target.value)}
                  >
                    <option value={isActive}>
                      {isActive ? "نشط" : "غير نشط"}
                    </option>
                    <option value={true}>نشط</option>
                    <option value={false}>غير نشط</option>
                  </select>
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التاريخ
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    Value={new Date().toLocaleDateString()}
                    readOnly
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الملاحظات
                  </label>
                  <textarea
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => setNotes(e.target.value)}
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
            <form onSubmit={deleteStockItem}>
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

export default StockItem;
