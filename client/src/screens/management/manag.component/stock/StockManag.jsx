import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { detacontext } from "../../../../App";
import { toast } from "react-toastify";
import "../orders/Orders.css";

const StockManag = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e"); // Retrieve the token from localStorage
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const {
    permissionsList,
    employeeLoginInfo,
    formatDateTime,
    isLoading,
    setisLoading,
    EditPagination,
    startpagination,
    endpagination,
    setstartpagination,
    setendpagination,
    filterByTime,
    filterByDateRange,
    setStartDate,
    setEndDate,
  } = useContext(detacontext);

  const stockManagementPermission =
    permissionsList &&
    permissionsList.filter(
      (perission) => perission.resource === "stock Management"
    )[0];

  const [allrecipes, setallrecipes] = useState([]);

  const getallrecipes = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    try {
      const response = await axios.get(`${apiUrl}/api/recipe`, config);
      if (response) {
        console.log(response);
        const allRecipe = await response.data;
        setallrecipes(allRecipe);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [StockItems, setStockItems] = useState([]);
  const getaStockItems = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    try {
      if (stockManagementPermission && !stockManagementPermission.read) {
        toast.warn("ليس لك صلاحية لعرض حركات المخزن");
        return;
      }
      const response = await axios.get(apiUrl + "/api/stockitem/", config);
      if (response) {
        console.log(response.data);
        setStockItems(response.data.reverse());
      }
    } catch (error) {
      toast.error("فشل استيراد الاصناف بشكل صحيح !اعد تحميل الصفحة ");
    }
  };

  const sourceEn = [
    "Purchase",
    "ReturnPurchase",
    "Issuance",
    "ReturnIssuance",
    "Wastage",
    "Damaged",
    "stockAdjustment",
    "OpeningBalance",
  ];

  const sourceAr = [
    "شراء",
    "إرجاع شراء",
    "صرف",
    "إرجاع صرف",
    "هدر",
    "تالف",
    "تعديل المخزون",
    "رصيد افتتاحي",
  ];

  const [itemId, setItemId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costMethod, setCostMethod] = useState("");
  const [source, setSource] = useState("");
  const [inbound, setInbound] = useState({
    quantity: 0,
    unitCost: 0,
    totalCost: 0,
  });
  const [outbound, setOutbound] = useState({
    quantity: 0,
    unitCost: 0,
    totalCost: 0,
  });
  const [balance, setBalance] = useState({
    quantity: 0,
    unitCost: 0,
    totalCost: 0,
  });
  const [remainingQuantity, setRemainingQuantity] = useState(0);
  const [movementDate, setMovementDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  // Additional fields based on the provided variables
  const [receiver, setReceiver] = useState("");
  const [supplier, setSupplier] = useState("");
  const [itemName, setItemName] = useState("");
  const [largeUnit, setLargeUnit] = useState("");
  const [smallUnit, setSmallUnit] = useState("");
  const [parts, setParts] = useState();
  const [expirationDate, setExpirationDate] = useState();
  const [expirationDateEnabled, setExpirationDateEnabled] = useState(false);

  const handleSelectedItem = (e) => {
    const selectedItem = StockItems.find((item) => item._id === e.target.value);
    console.log({ selectedItem });
    if (selectedItem) {
      const { _id, largeUnit, itemName, smallUnit,parts, costMethod } = selectedItem;
      console.log({
        _id,
        largeUnit,
        itemName,
        smallUnit,
        costMethod,
        parts
      });
      setItemId(_id);
      setLargeUnit(largeUnit);
      setitemName(itemName);
      setSmallUnit(smallUnit);
      setcostOfPart(costOfPart);
      setprice(price);
    }
  };

  const [AllCashRegisters, setAllCashRegisters] = useState([]);
  // Fetch all cash registers
  const getAllCashRegisters = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    try {
      const response = await axios.get(apiUrl + "/api/cashregister", config);
      setAllCashRegisters(response.data.reverse());
    } catch (err) {
      toast.error("Error fetching cash registers");
    }
  };

  const [actionId, setactionId] = useState("");
  const actionAt = new Date().toLocaleString();
  const [AllStockactions, setAllStockactions] = useState([]);

  const createStockAction = async (e) => {
    // console.log({ itemId, movement, quantity, cost, balance: newBalance, oldBalance, price,})
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    try {
      if (stockManagementPermission && !stockManagementPermission.create) {
        toast.warn("ليس لك صلاحية لاضافه حركه المخزن");
        return;
      }
      setisLoading(true);

      const unit = movement === "Purchase" ? largeUnit : smallUnit;
      // Update the stock item's movement
      const changeItem = await axios.put(
        `${apiUrl}/api/stockitem/movement/${itemId}`,
        { newBalance, price, newcost, costOfPart },
        config
      );

      console.log(changeItem);

      if (changeItem.status === 200) {
        // Create a new stock action
        const response = await axios.post(
          apiUrl + "/api/stockmanag/",
          {
            itemId,
            movement,
            quantity,
            cost,
            unit,
            balance: newBalance,
            oldBalance,
            price,
            ...(movement === "Purchase" && { expirationDate }),
          },
          config
        );

        // console.log(response.data);

        if (movement === "Purchase") {
          for (const recipe of allrecipes) {
            const recipeid = recipe._id;
            const productname = recipe.product.name;
            const arrayingredients = recipe.ingredients;

            const newIngredients = arrayingredients.map((ingredient) => {
              if (ingredient.itemId === itemId) {
                const costofitem = costOfPart;
                const unit = ingredient.unit;
                const amount = ingredient.amount;
                const totalcostofitem = amount * costOfPart;
                return {
                  itemId,
                  name: itemName,
                  amount,
                  costofitem,
                  unit,
                  totalcostofitem,
                };
              } else {
                return ingredient;
              }
            });
            console.log({ newIngredients });
            const totalcost = newIngredients.reduce((acc, curr) => {
              return acc + (curr.totalcostofitem || 0);
            }, 0);
            // Update the product with the modified recipe and total cost
            const updateRecipe = await axios.put(
              `${apiUrl}/api/recipe/${recipeid}`,
              { ingredients: newIngredients, totalcost },
              config
            );

            console.log({ updateRecipe });

            // Toast for successful update based on recipe change
            toast.success(`تم تحديث وصفة  ${productname}`);
          }
        }
      }

      // Update the stock actions list and stock items
      getallStockaction();
      getaStockItems();
      setisLoading(false);
      // Toast notification for successful creation
      toast.success("تم تسجيل حركه المخزن بنجاح");
    } catch (error) {
      setisLoading(false);
      console.log(error);
      // Toast notification for error
      toast.error("فشل تسجيل حركه المخزن ! حاول مره اخري");
    } finally {
      setisLoading(false);
    }
  };

  const updateStockaction = async (e, employeeId) => {
    e.preventDefault();

    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    setisLoading(true);
    try {
      if (stockManagementPermission && !stockManagementPermission.update) {
        toast.warn("ليس لك صلاحية لتعديل حركه المخزن");
        return;
      }
      const actionBy = employeeId;
      const unit = movement === "Purchase" ? largeUnit : smallUnit;

      // Update the stock item's movement
      const changeItem = await axios.put(
        `${apiUrl}/api/stockitem/movement/${itemId}`,
        { newBalance, price, newcost, costOfPart },
        config
      );

      if (changeItem.status === 200) {
        // Update the existing stock action
        const response = await axios.put(
          `${apiUrl}/api/stockmanag/${actionId}`,
          {
            itemId,
            movement,
            quantity,
            cost,
            unit,
            newBalance,
            oldBalance,
            price,
            expirationDate,
            actionBy,
          },
          config
        );
        console.log(response.data);

        if (movement === "Purchase") {
          for (const recipe of allrecipes) {
            const recipeid = recipe._id;
            const productname = recipe.product.name;
            const arrayingredients = recipe.ingredients;

            const newIngredients = arrayingredients.map((ingredient) => {
              if (ingredient.itemId === itemId) {
                const costofitem = costOfPart;
                const unit = ingredient.unit;
                const amount = ingredient.amount;
                const totalcostofitem = amount * costOfPart;
                return {
                  itemId,
                  name: itemName,
                  amount,
                  costofitem,
                  unit,
                  totalcostofitem,
                };
              } else {
                return ingredient;
              }
            });
            console.log({ newIngredients });
            const totalcost = newIngredients.reduce((acc, curr) => {
              return acc + (curr.totalcostofitem || 0);
            }, 0);
            // Update the product with the modified recipe and total cost
            const updateRecipe = await axios.put(
              `${apiUrl}/api/recipe/${recipeid}`,
              { ingredients: newIngredients, totalcost },
              config
            );

            console.log({ updateRecipe });

            // Toast for successful update based on recipe change
            toast.success(`تم تحديث وصفه ${productname}`);
          }
        }
        // Update the stock actions list and stock items
        getallStockaction();
        getaStockItems();
        setisLoading(false);
        // Toast notification for successful update
        toast.success("تم تحديث العنصر بنجاح");
      }
    } catch (error) {
      setisLoading(false);
      console.log(error);
      // Toast notification for error
      toast.error("فشل في تحديث العنصر ! حاول مره اخري");
    } finally {
      setisLoading(false);
    }
  };

  const getallStockaction = async () => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      const response = await axios.get(apiUrl + "/api/stockmanag/", config);
      console.log(response.data);
      const Stockactions = await response.data;
      setAllStockactions(Stockactions.reverse());
    } catch (error) {
      console.log(error);
    }
  };

  const deleteStockaction = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error("رجاء تسجيل الدخول مره اخري");
      return;
    }
    // setisLoading(true);
    try {
      if (stockManagementPermission && !stockManagementPermission.delete) {
        toast.warn("ليس لك صلاحية لحذف حركه المخزن");
        return;
      }
      // Delete the selected stock action
      const response = await axios.delete(
        `${apiUrl}/api/stockmanag/${actionId}`,
        config
      );
      console.log(response);

      if (response) {
        // Update the stock actions list after successful deletion
        getallStockaction();
        // setisLoading(false);
        // Toast notification for successful deletion
        toast.success("تم حذف حركه المخزن بنجاح");
      }
    } catch (error) {
      // setisLoading(false);
      console.log(error);
      // Toast notification for error
      toast.error("فشل حذف حركه المخزن ! حاول مره اخري ");
    } finally {
      // setisLoading(false);
    }
  };

  const searchByitem = (item) => {
    if (!item) {
      getallStockaction();
      return;
    }
    const items = AllStockactions.filter(
      (action) => action.itemId.itemName.startsWith(item) === true
    );
    setAllStockactions(items);
  };
  const searchByaction = (action) => {
    if (!action) {
      getallStockaction();
      return;
    }
    const items = AllStockactions.filter(
      (Stockactions) => Stockactions.movement === action
    );
    setAllStockactions(items);
  };

  useEffect(() => {
    getallStockaction();
    getaStockItems();
    getAllCashRegisters();
    getallrecipes();
  }, []);

  // useEffect(() => {
  //   if (movement === "Issuance" || movement === "Wastage") {
  //     setnewBalance(Number(oldBalance) - Number(quantity / parts))
  //     setnewcost(Number(oldCost) - Number(cost))
  //     setcostOfPart(Number(price) / Number(parts))
  //   } else if (movement === 'Purchase') {
  //     const calcNewBalance = Number(oldBalance) + Number(quantity)
  //     const calcNewCost = Number(oldCost) + Number(cost)
  //     const calcCostOfPart = Math.round((price / calcNewBalance) * 10) / 10;
  //     console.log({calcCostOfPart})
  //     setnewBalance(calcNewBalance)
  //     setnewcost(calcNewCost)
  //     setcostOfPart(calcCostOfPart)

  //   } else if (movement === "Return") {
  //     setnewBalance(Number(oldBalance) + Number(quantity / parts))
  //     setnewcost(Number(oldCost) + Number(cost))
  //     setcostOfPart(Number(price) / Number(parts))

  //   }
  // }, [quantity, price])

  useEffect(() => {
    if (
      movement === "Issuance" ||
      movement === "Wastage" ||
      movement === "Damaged"
    ) {
      const calcNewBalance =
        Number(oldBalance) - Number(quantity) / Number(parts);
      const countparts = calcNewBalance * Number(parts);
      const calcCostOfPart = Math.round((price / countparts) * 100) / 100;
      setnewBalance(calcNewBalance);
      setcostOfPart(calcCostOfPart);
    } else if (movement === "ReturnIssuance") {
      const calcNewBalance =
        Number(oldBalance) + Number(quantity) / Number(parts);
      const countparts = calcNewBalance * Number(parts);
      const calcCostOfPart = Math.round((price / countparts) * 100) / 100;
      setnewBalance(calcNewBalance);
      setcostOfPart(calcCostOfPart);
    } else if (movement === "Purchase") {
      const calcNewBalance = Number(oldBalance) + Number(quantity);
      const countparts = calcNewBalance * Number(parts);
      const calcCostOfPart = Math.round((price / countparts) * 100) / 100;
      console.log({ calcNewBalance, calcCostOfPart, countparts });
      setnewBalance(calcNewBalance);
      setcostOfPart(calcCostOfPart);
    } else if (movement === "ReturnPurchase") {
      const calcNewBalance = Number(oldBalance) - Number(quantity);
      const countparts = calcNewBalance * Number(parts);
      const calcCostOfPart = Math.round((price / countparts) * 100) / 100;
      setnewBalance(calcNewBalance);
      setcostOfPart(calcCostOfPart);
    }
  }, [quantity, price]);

  return (
    <div className="w-100 px-3 d-flex align-itmes-center justify-content-start">
      <div className="table-responsive">
        <div className="table-wrapper p-3 mw-100">
          <div className="table-title">
            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between">
              <div className="text-right">
                <h2>
                  ادارة <b>حركه المخزن</b>
                </h2>
              </div>
              <div className="col-12 col-md-6 p-0 m-0 d-flex flex-wrap aliegn-items-center justify-content-end print-hide">
                {stockManagementPermission.create && (
                  <a
                    href="#addStockactionModal"
                    className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-success"
                    data-toggle="modal"
                  >
                    <span>انشاء حركه مخزن</span>
                  </a>
                )}
                {stockManagementPermission.delete && (
                  <a
                    href="#deleteStockactionModal"
                    className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-danger"
                    data-toggle="modal"
                  >
                    <span>حذف</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div class="table-filter print-hide">
            <div class="col-12 text-dark d-flex flex-wrap align-items-center justify-content-start p-0 m-0">
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

              <div class="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  اسم الصنف
                </label>
                <input
                  type="text"
                  class="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchByitem(e.target.value)}
                />
              </div>
              <div class="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  نوع الاوردر
                </label>
                <select
                  class="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchByaction(e.target.value)}
                >
                  <option value={""}>الكل</option>
                  {StockmovementEn.map((movement, i) => {
                    return (
                      <option key={i} value={movement}>
                        {StockmovementAr[i]}
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
                      setAllStockactions(
                        filterByTime(e.target.value, AllStockactions)
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
                        setAllStockactions(filterByDateRange(AllStockactions))
                      }
                    >
                      <i className="fa fa-search"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning h-100 p-2"
                      onClick={getallStockaction}
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
                <th rowspan="2">م</th>
                <th rowspan="2">اسم الصنف</th>
                <th rowspan="2">المخزن</th>
                <th rowspan="2">التصنيف</th>
                <th rowspan="2">طريقه حساب التكلفه</th>
                <th rowspan="2">مصدر الحركة</th>
                <th colspan="3">صادر</th>
                <th colspan="3">وارد</th>
                <th colspan="3">الرصيد</th>
                <th rowspan="2">تاريخ الحركة</th>
                <th rowspan="2">أضيف بواسطة</th>
                <th rowspan="2">إجراءات</th>
              </tr>
              <tr>
                <th>الكمية</th>
                <th>تكلفة الوحدة</th>
                <th>الإجمالي</th>
                <th>الكمية</th>
                <th>تكلفة الوحدة</th>
                <th>الإجمالي</th>
                <th>الكمية</th>
                <th>تكلفة الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {AllStockactions &&
                AllStockactions.map((action, i) => {
                  if (i >= startpagination && i < endpagination) {
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{action.itemId?.itemName}</td>
                        <td>{action.storeId?.storeName}</td>
                        <td>{action.categoryId?.categoryName}</td>
                        <td>{action.costMethod}</td>
                        <td>{action.source}</td>
                        <td>{action.outbound?.quantity || 0}</td>
                        <td>{action.outbound?.unitCost || 0}</td>
                        <td>{action.outbound?.totalCost || 0}</td>
                        <td>{action.inbound?.quantity || 0}</td>
                        <td>{action.inbound?.unitCost || 0}</td>
                        <td>{action.inbound?.totalCost || 0}</td>
                        <td>{action.balance?.quantity || 0}</td>
                        <td>{action.balance?.unitCost || 0}</td>
                        <td>{action.balance?.totalCost || 0}</td>
                        <td>{formatDateTime(action.movementDate)}</td>
                        <td>{action.createdBy?.fullname}</td>
                        <td>
                          {stockManagementPermission.update && (
                            <a
                              href="#editStockactionModal"
                              className="edit"
                              data-toggle="modal"
                              onClick={() => {
                                setactionId(action._id);
                                setitemName(action.itemId?.itemName);
                                setoldBalance(action.balance?.quantity || 0);
                                setprice(action.outbound?.unitCost || 0);
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
                          {stockManagementPermission.delete && (
                            <a
                              href="#deleteStockactionModal"
                              className="delete"
                              data-toggle="modal"
                              onClick={() => setactionId(action._id)}
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
                {AllStockactions.length > endpagination
                  ? endpagination
                  : AllStockactions.length}
              </b>{" "}
              من <b>{AllStockactions.length}</b> عنصر
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

      <div id="addStockactionModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={(e) => createStockAction(e, employeeLoginInfo.id)}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">تسجيل حركه بالمخزن</h4>
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
                    نوع الحركه
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name=""
                    id=""
                    onChange={(e) => setmovement(e.target.value)}
                  >
                    <option value="">اختر الاجراء</option>
                    {StockmovementEn.map((movement, i) => {
                      return (
                        <option key={i} value={movement}>
                          {StockmovementAr[i]}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الصنف
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name=""
                    id=""
                    onChange={(e) => {
                      handleSelectedItem(e);
                    }}
                  >
                    <option value="">اختر الصنف</option>
                    {StockItems.map((item, i) => {
                      return (
                        <option key={i} value={item._id}>
                          {item.itemName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {["Issuance", "ReturnIssuance", "Wastage", "Damaged"].includes(
                  movement
                ) ? (
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      الكمية
                    </label>
                    <div className="d-flex align-items-center">
                      {/* Input for quantity */}
                      <input
                        type="number"
                        className="form-control border-primary flex-grow-1"
                        required
                        onChange={(e) => {
                          setquantity(e.target.value);
                          setcost(Number(e.target.value) * costOfPart);
                        }}
                      />
                      <input
                        type="text"
                        className="form-control border-primary ms-2"
                        defaultValue={smallUnit}
                        readOnly
                      />
                    </div>
                  </div>
                ) : ["Purchase", "ReturnPurchase"].includes(movement) ? (
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      الكمية
                    </label>
                    <div className="d-flex align-items-center">
                      {/* Input for quantity */}
                      <input
                        type="number"
                        className="form-control border-primary flex-grow-1"
                        required
                        onChange={(e) => {
                          setquantity(e.target.value);
                        }}
                      />
                      {/* Display large unit */}
                      <input
                        type="text"
                        className="form-control border-primary ms-2"
                        defaultValue={largeUnit}
                        readOnly
                      />
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {/* {movement === "Purchase" &&   
                <>
                            <div className="form-group col-12 col-md-6">
                              <label className="form-label text-wrap text-right fw-bolder p-0 m-0">تاريخ الانتهاء</label>
                              <input type="checkbox" className="form-check-input form-check-input-lg" checked={expirationDateEnabled} onChange={() => setExpirationDateEnabled(!expirationDateEnabled)} />
                              {expirationDateEnabled &&
                                <input type='date' className="form-control border-primary m-0 p-2 h-auto" required onChange={(e) => { setexpirationDate(e.target.value); }} />}
                            </div>
                          </>
                        } */}

                {movement === "Issuance" ||
                movement === "ReturnIssuance" ||
                movement === "Wastage" ||
                movement === "Damaged" ? (
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">{`سعر ${smallUnit}`}</label>
                    <input
                      type="text"
                      className="form-control border-primary m-0 p-2 h-auto"
                      readOnly
                      defaultValue={costOfPart}
                    />
                  </div>
                ) : ["Purchase", "ReturnPurchase"].includes(movement) ? (
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">{`سعر ${smallUnit}`}</label>

                    <input
                      type="Number"
                      className="form-control border-primary m-0 p-2 h-auto"
                      required
                      onChange={(e) => {
                        setprice(Number(e.target.value));
                        setcost(Number(e.target.value) * quantity);
                      }}
                    />
                  </div>
                ) : (
                  ""
                )}

                {["Purchase", "ReturnPurchase"].includes(movement) ? (
                  <div className="form-group col-12 col-md-6">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                      التكلفة
                    </label>
                    <input
                      type="Number"
                      className="form-control border-primary m-0 p-2 h-auto"
                      Value={cost}
                      readOnly
                    />
                  </div>
                ) : (
                  ""
                )}

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الرصيد
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control border-primary flex-grow-1"
                      Value={oldBalance}
                      readOnly
                    />
                    <input
                      type="text"
                      className="form-control border-primary ms-2"
                      defaultValue={largeUnit}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الرصيد الجديد
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control border-primary flex-grow-1"
                      Value={newBalance}
                      readOnly
                    />
                    <input
                      type="text"
                      className="form-control border-primary ms-2"
                      defaultValue={largeUnit}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التاريخ
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    Value={actionAt}
                    readOnly
                  />
                </div>
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
                  className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                  value="اضافه"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="editStockactionModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={(e) => updateStockaction(e, employeeLoginInfo.id)}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">تعديل حركه بالمخزن</h4>
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
                    نوع الحركه
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name=""
                    id=""
                    onChange={(e) => setmovement(e.target.value)}
                  >
                    <option value={movement}>{movement}</option>
                    {StockmovementEn.map((movement, i) => {
                      return (
                        <option key={i} value={movement}>
                          {StockmovementAr[i]}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الصنف
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    name=""
                    id=""
                    onChange={(e) => {
                      setitemId(e.target.value);
                      setlargeUnit(
                        StockItems.filter((i) => i._id === e.target.value)[0]
                          .largeUnit
                      );
                      setsmallUnit(
                        StockItems.filter((i) => i._id === e.target.value)[0]
                          .smallUnit
                      );
                    }}
                  >
                    <option value="">اختر الصنف</option>
                    {StockItems.map((item, i) => {
                      return (
                        <option key={i} value={item._id}>
                          {item.itemName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الكمية
                  </label>
                  {movement === "Issuance" ||
                  movement === "ReturnIssuance" ||
                  movement === "Wastage" ||
                  movement === "Damaged" ? (
                    <>
                      <input
                        type="Number"
                        className="form-control border-primary m-0 p-2 h-auto"
                        required
                        onChange={(e) => {
                          setquantity(e.target.value);
                          setcost(Number(e.target.value) * costOfPart);
                        }}
                      />
                      <input
                        type="text"
                        className="form-control border-primary m-0 p-2 h-auto"
                        defaultValue={smallUnit}
                        readOnly
                      />
                    </>
                  ) : movement === "Purchase" ||
                    movement === "ReturnPurchase" ? (
                    <>
                      <input
                        type="Number"
                        className="form-control border-primary m-0 p-2 h-auto"
                        required
                        onChange={(e) => {
                          setquantity(e.target.value);
                        }}
                      />
                      <input
                        type="text"
                        className="form-control border-primary m-0 p-2 h-auto"
                        defaultValue={largeUnit}
                        readOnly
                      />
                    </>
                  ) : (
                    ""
                  )}
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    السعر
                  </label>
                  {movement === "Issuance" ||
                  movement === "ReturnIssuance" ||
                  movement === "Wastage" ||
                  movement === "Damaged" ? (
                    <input
                      type="Number"
                      className="form-control border-primary m-0 p-2 h-auto"
                      readOnly
                      required
                      defaultValue={price}
                    />
                  ) : (
                    <input
                      type="Number"
                      className="form-control border-primary m-0 p-2 h-auto"
                      required
                      onChange={(e) => {
                        setprice(Number(e.target.value));
                        setcost(e.target.value * quantity);
                      }}
                    />
                  )}
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التكلفة
                  </label>
                  <input
                    type="Number"
                    className="form-control border-primary m-0 p-2 h-auto"
                    Value={cost}
                    readOnly
                  />
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الرصيد
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control border-primary flex-grow-1"
                      Value={oldBalance}
                      readOnly
                    />
                    <input
                      type="text"
                      className="form-control border-primary ms-2"
                      defaultValue={largeUnit}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الرصيد الجديد
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control border-primary flex-grow-1"
                      Value={newBalance}
                      readOnly
                    />
                    <input
                      type="text"
                      className="form-control border-primary ms-2"
                      defaultValue={largeUnit}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التاريخ
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    Value={actionAt}
                    readOnly
                  />
                </div>
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
                  className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                  value="اضافه"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="deleteStockactionModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={deleteStockaction}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">حذف حركه مخزن</h4>
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

export default StockManag;
