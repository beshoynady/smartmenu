import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { dataContext } from "../../../../App";
import { toast } from "react-toastify";
import "../orders/Orders.css";

const StockMovement = () => {
  const {
    permissionsList,
    employeeLoginInfo,
    formatDateTime,
    formatDate,
    isLoading,
    setisLoading,
    EditPagination,
    startPagination,
    endPagination,
    setStartPagination,
    setEndPagination,
    filterByTime,
    filterByDateRange,
    setStartDate,
    setEndDate,
    handleGetTokenAndConfig,
    apiUrl,
  } = useContext(dataContext);

  const stockMovementPermission =
    permissionsList &&
    permissionsList.filter(
      (perission) => perission.resource === "stock Movement"
    )[0];

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
    "مشتريات",
    "إرجاع مشتريات",
    "صرف",
    "إرجاع منصرف",
    "هدر",
    "تالف",
    "تعديل المخزون",
    "رصيد افتتاحي",
  ];

  const [itemId, setItemId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costMethod, setCostMethod] = useState(""); // FIFO, LIFO, Weighted Average
  const [source, setSource] = useState(""); // Purchase, Issuance, etc.
  const [unit, setUnit] = useState("");
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
  const [sourceDate, setSourceDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(0); // Total quantity for the movement
  const [costUnit, setCostUnit] = useState(0); // Cost per unit
  const [sender, setSender] = useState(""); // Sender (optional)
  const [receiver, setReceiver] = useState(""); // Receiver (optional)
  const [parts, setParts] = useState(); // Related parts (optional)
  const [expirationDate, setExpirationDate] = useState(); // Expiry date for perishable items
  const [expirationDateEnabled, setExpirationDateEnabled] = useState(false); // Toggle for expiration date field

  const [actionId, setِActionId] = useState("");
  const [AllStockactions, setAllStockactions] = useState([]);
  const [AllStockactionsStore, setAllStockactionsStore] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const getEmployee = async () => {
    try {
      const config = await handleGetTokenAndConfig();
      const response = await axios.get(apiUrl + "/api/employee", config);
      setEmployees(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSupplier = async () => {
    try {
      const config = await handleGetTokenAndConfig();
      const response = await axios.get(apiUrl + "/api/supplier", config);
      setSuppliers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createStockAction = async (e) => {
    e.preventDefault();
    const config = await handleGetTokenAndConfig();
    if (stockMovementPermission && !stockMovementPermission.create) {
      toast.warn("ليس لك صلاحية لانشاء حركه المخزن");
      return;
    }

    const lastStockAction = AllStockactionsStore.filter(
      (stockAction) =>
        stockAction.itemId?._id === itemId && stockAction._id === storeId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    console.log({ inbound, outbound, balance });
    if (source === "Issuance" || source === "Wastage" || source === "Damaged") {
      if (costMethod === "FIFO") {
        const batches = AllStockactionsStore.filter((stockAction) => {
          const isValidAction =
            stockAction && stockAction.itemId && stockAction.itemId._id;
          const isMatchingItem =
            isValidAction && stockAction.itemId._id === itemId;
          const isInboundPositive =
            stockAction.inbound && stockAction.inbound.quantity > 0;
          const hasRemainingQuantity = stockAction.remainingQuantity > 0;

          // التحقق من جميع الشروط المطلوبة
          return isMatchingItem && isInboundPositive && hasRemainingQuantity;
        }).sort((a, b) => new Date(a.movementDate) - new Date(b.movementDate));

        console.log({ batches });

        let totalQuantity = Number(quantity);
        let totalCost = 0;
        console.log({ totalQuantity, totalCost });

        for (const batch of batches) {
          if (totalQuantity > 0) {
            const availableQuantity = batch.remainingQuantity;
            const quantityToUse = Math.min(totalQuantity, availableQuantity);
            const costForThisBatch = quantityToUse * batch.inbound?.unitCost;

            totalQuantity -= quantityToUse;
            totalCost += costForThisBatch;

            batch.remainingQuantity -= quantityToUse;

            // إرسال التحديث إلى قاعدة البيانات
            const updateBatch = await axios.put(
              `${apiUrl}/api/stockmovement/${batch._id}`,
              {
                remainingQuantity: batch.remainingQuantity,
              },
              config
            );

            console.log({ updateBatch, quantityToUse });

            outbound.quantity += quantityToUse;
            outbound.unitCost = totalCost / (quantity - totalQuantity);
            outbound.totalCost = totalCost;

            balance.quantity -= quantityToUse;
            balance.totalCost -= costForThisBatch;

            if (totalQuantity <= 0) break;
          }
        }
      } else if (costMethod === "LIFO") {
        const batches = AllStockactionsStore.filter(
          (stockAction) =>
            stockAction.itemId?._id === itemId &&
            stockAction.inbound?.quantity > 0 &&
            stockAction.remainingQuantity > 0
        ).sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));

        let totalQuantity = quantity;
        let totalCost = 0;

        for (const batch of batches) {
          if (totalQuantity > 0) {
            const availableQuantity = batch.remainingQuantity;
            const quantityToUse = Math.min(totalQuantity, availableQuantity);
            const costForThisBatch = quantityToUse * batch.inbound.unitCost;

            totalQuantity -= quantityToUse;
            totalCost += costForThisBatch;

            // تحديث الرصيد المتبقي في الدُفعة
            batch.remainingQuantity -= quantityToUse;
            const updateBatch = await axios.put(
              `${apiUrl}/api/stockmovement/${batch._id}`,
              {
                remainingQuantity: batch.remainingQuantity,
              },
              config
            );
            console.log({ updateBatch });
            // تحديث حركة الصادر
            outbound.quantity += quantityToUse;
            outbound.unitCost = totalCost / (quantity - totalQuantity);
            outbound.totalCost = totalCost;

            // تحديث الرصيد بعد الصادر
            balance.quantity -= quantityToUse;
            balance.totalCost -= costForThisBatch;

            if (totalQuantity <= 0) break;
          }
        }
      } else if (costMethod === "Weighted Average") {
        const batches = AllStockactionsStore.filter((stockAction) => {
          const isValidAction =
            stockAction && stockAction.itemId && stockAction.itemId._id;
          const isMatchingItem =
            isValidAction && stockAction.itemId._id === itemId;
          const isInboundPositive =
            stockAction.inbound && stockAction.inbound.quantity > 0;
          const hasRemainingQuantity = stockAction.remainingQuantity > 0;

          return isMatchingItem && isInboundPositive && hasRemainingQuantity;
        }).sort((a, b) => new Date(a.movementDate) - new Date(b.movementDate));

        const totalQuantityInStock = batches.reduce(
          (acc, curr) => acc + curr.remainingQuantity,
          0
        );
        const totalCostInStock = batches.reduce(
          (acc, curr) => acc + curr.remainingQuantity * curr.inbound.unitCost,
          0
        );

        const weightedAverageCost = totalCostInStock / totalQuantityInStock;

        outbound.quantity = quantity;
        outbound.unitCost = weightedAverageCost;
        outbound.totalCost = outbound.quantity * outbound.unitCost;

        balance.quantity -= quantity;
        balance.totalCost -= outbound.totalCost;

        let totalQuantity = Number(quantity);
        let totalCost = 0;

        for (const batch of batches) {
          if (totalQuantity > 0) {
            const availableQuantity = batch.remainingQuantity;
            const quantityToUse = Math.min(totalQuantity, availableQuantity);
            const costForThisBatch = quantityToUse * batch.inbound.unitCost;

            totalQuantity -= quantityToUse;
            totalCost += costForThisBatch;

            batch.remainingQuantity -= quantityToUse;

            const updateBatch = await axios.put(
              `${apiUrl}/api/stockmovement/${batch._id}`,
              {
                remainingQuantity: batch.remainingQuantity,
              },
              config
            );
            console.log({ updateBatch });
            if (totalQuantity <= 0) break;
          }
        }

        if (balance.quantity < 0) {
          throw new Error(
            "Insufficient stock to fulfill the issuance request."
          );
        }
      }

      if (source === "Issuance") {
        const costPerPart = outbound.unitCost;
        console.log({ costPerPart });
        const updateCostPerPart = await axios.put(
          `${apiUrl}/api/stockitem/${itemId}`,
          {
            costPerPart,
          },
          config
        );
        if (updateCostPerPart) {
          toast.info("تم تعديل تكلفه الوحده");
        }
      }
    } else if (source === "ReturnIssuance") {
      inbound.quantity = quantity;
      inbound.unitCost = lastStockAction ? lastStockAction.unitCost : 0;
      inbound.totalCost = inbound.quantity * inbound.unitCost;

      balance.quantity += quantity;
      balance.totalCost += inbound.totalCost;
    } else if (source === "Purchase") {
      inbound.quantity = quantity;
      inbound.unitCost = costUnit;
      inbound.totalCost = quantity * costUnit;

      balance.quantity += Number(quantity);
      balance.unitCost =
        (balance.totalCost + inbound.totalCost) / balance.quantity;
      balance.totalCost += inbound.totalCost;
      setRemainingQuantity(quantity);
    } else if (source === "OpeningBalance") {
      setRemainingQuantity(quantity);

      inbound.quantity = quantity;
      inbound.unitCost = costUnit;
      inbound.totalCost = quantity * inbound.unitCost;

      balance.quantity = quantity;
      balance.unitCost = costUnit;
      balance.totalCost = inbound.totalCost;
    } else if (source === "ReturnPurchase") {
      outbound.quantity = quantity;
      outbound.unitCost = costUnit;
      outbound.totalCost = quantity * outbound.unitCost;

      balance.quantity -= quantity;
      balance.totalCost -= outbound.totalCost;

      if (balance.quantity < 0) {
        throw new Error(
          "Invalid operation: Return quantity exceeds current balance."
        );
      }
    }

    const data = {
      itemId,
      storeId,
      categoryId,
      costMethod,
      source,
      unit,
      inbound,
      outbound,
      balance,
      remainingQuantity: inbound.quantity > 0 ? Number(quantity) : 0,
      sourceDate,
      receiver,
      sender,
      notes,
    };
    console.log({ data });

    try {
      const response = await axios.post(
        `${apiUrl}/api/stockmovement`,
        data,
        config
      );
      if (response) {
        if (outbound.unitCost > 0) {
          const addCostOfUnit = await axios.put(
            `${apiUrl}/api/stockitem/${itemId}`,
            {
              costPerPart: Number(outbound.unitCost) / Number(parts),
            },
            config
          );
          if (addCostOfUnit) {
            toast.success("تم تعديل تكلفه الصرف");
          }
        }
        toast.success("تم تسجيل حركة المخزون بنجاح");
      }
    } catch (error) {
      toast.error("فشل تسجيل حركة المخزون!");
      console.error("Error creating stock source:", error);
    } finally {
      getallStockaction();
      setQuantity(0);
      setCostUnit(0);
      setSource(0);
      setStoreId("");
      setCategoryId("");
      setCostMethod("");
      inbound.quantity = 0;
      inbound.unitCost = 0;
      inbound.totalCost = 0;

      outbound.quantity = 0;
      outbound.unitCost = 0;
      outbound.totalCost = 0;

      balance.quantity = 0;
      balance.unitCost = 0;
      balance.totalCost = 0;
    }
  };

  // const updateStockaction = async (e, employeeId) => {
  //   e.preventDefault();

  //   const config = await handleGetTokenAndConfig();
  //   if (stockMovementPermission && !stockMovementPermission.update) {
  //     toast.warn("ليس لك صلاحية لتعديل حركه المخزن");
  //     return;
  //   }

  //   setisLoading(true);
  //   const data = {
  //     itemId,
  //     storeId,
  //     categoryId,
  //     costMethod,
  //     source,
  //     unit,
  //     inbound,
  //     outbound,
  //     balance,
  //     remainingQuantity,
  //     sourceDate,
  //     notes,
  //   };

  //   try {
  //     const response = await axios.put(
  //       `${apiUrl}/api/stockmovement/${actionId}`,
  //       data,
  //       config
  //     );
  //     toast.success("تم تحديث حركة المخزون بنجاح");
  //     return response.data;
  //   } catch (error) {
  //     toast.error("فشل تحديث حركة المخزون!");
  //     console.error("Error updating stock source:", error);
  //   }
  // };

  const getallStockaction = async () => {
    try {
      const config = await handleGetTokenAndConfig();
      const response = await axios.get(apiUrl + "/api/stockmovement/", config);
      console.log(response.data);
      const Stockactions = await response.data;
      setAllStockactions(Stockactions.reverse());
    } catch (error) {
      console.log(error);
    }
  };

  const deleteStockaction = async (e) => {
    e.preventDefault();
    const config = await handleGetTokenAndConfig();
    if (stockMovementPermission && !stockMovementPermission.delete) {
      toast.warn("ليس لك صلاحية لحذف حركه المخزن");
      return;
    }
    // setisLoading(true);
    try {
      // Delete the selected stock action
      const response = await axios.delete(
        `${apiUrl}/api/stockmovement/${actionId}`,
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

  const [allStores, setAllStores] = useState([]);

  const getAllStores = async () => {
    const config = await handleGetTokenAndConfig();

    try {
      const response = await axios.get(apiUrl + "/api/store/", config);
      setAllStores(response.data.reverse());
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("حدث خطأ اثناء جلب بيانات المخزنات! اعد تحميل الصفحة");
    }
  };

  const [StockItems, setStockItems] = useState([]);
  const getStockItems = async () => {
    const config = await handleGetTokenAndConfig();
    try {
      const response = await axios.get(apiUrl + "/api/stockitem/", config);
      if (response) {
        console.log(response.data);
        setStockItems(response.data.reverse());
      }
    } catch (error) {
      toast.error("فشل استيراد الاصناف بشكل صحيح !اعد تحميل الصفحة ");
    }
  };

  const [allCategoryStock, setAllCategoryStock] = useState([]);

  const getAllCategoryStock = async () => {
    const config = await handleGetTokenAndConfig();

    try {
      const response = await axios.get(apiUrl + "/api/categoryStock/", config);
      setAllCategoryStock(response.data.reverse());
    } catch (error) {
      console.error("Error fetching category stock:", error);
      toast.error("حدث خطأ اثناء جلب بيانات التصنيفات ! اعد تحميل الصفحة");
    }
  };

  // Fetch all cash registers
  const handleSelectedItem = (e) => {
    const selectedItem = StockItems.find((item) => item._id === e.target.value);
    console.log({ selectedItem });
    if (selectedItem) {
      const { _id, storageUnit, parts, costMethod } = selectedItem;
      setItemId(_id);
      setUnit(storageUnit);
      setParts(parts);
      setCostMethod(costMethod);
    }
  };
  const handleSelectedStore = (id) => {
    setStoreId(id);
    const selectedStockactions = AllStockactions.filter(
      (Stockactions) => Stockactions._id === id
    );
    if (selectedStockactions) {
      setAllStockactionsStore(selectedStockactions);
    }
  };

  const [AllCashRegisters, setAllCashRegisters] = useState([]);
  const getAllCashRegisters = async () => {
    const config = await handleGetTokenAndConfig();
    try {
      const response = await axios.get(apiUrl + "/api/cashregister", config);
      setAllCashRegisters(response.data.reverse());
    } catch (err) {
      toast.error("Error fetching cash registers");
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
  const searchByStore = (storeId) => {
    if (!storeId) {
      getallStockaction();
      return;
    }
    const items = AllStockactions.filter(
      (Stockactions) => Stockactions.store?._id === storeId
    );
    setAllStockactions(items);
  };
  const searchByaction = (action) => {
    if (!action) {
      getallStockaction();
      return;
    }
    const items = AllStockactions.filter(
      (Stockactions) => Stockactions.source === action
    );
    setAllStockactions(items);
  };

  useEffect(() => {
    getallStockaction();
    getStockItems();
    getAllStores();
    getAllCategoryStock();
    getAllCashRegisters();
    getEmployee();
    getSupplier();
  }, []);

  useEffect(() => {
    const lastStockAction = AllStockactionsStore.filter(
      (stockAction) =>
        stockAction.itemId?._id === itemId && stockAction._id === storeId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    setInbound({
      quantity: 0,
      unitCost: 0,
      totalCost: 0,
    });
    setOutbound({
      quantity: 0,
      unitCost: 0,
      totalCost: 0,
    });
    setBalance({
      quantity: lastStockAction ? Number(lastStockAction.balance?.quantity) : 0,
      unitCost: lastStockAction ? Number(lastStockAction.balance?.unitCost) : 0,
      totalCost: lastStockAction
        ? Number(lastStockAction.balance?.totalCost)
        : 0,
    });
  }, [quantity, source, itemId, AllStockactions, costUnit]);

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
                {stockMovementPermission && stockMovementPermission.create && (
                  <a
                    href="#addStockactionModal"
                    className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-success"
                    data-toggle="modal"
                  >
                    <span>انشاء حركه مخزن</span>
                  </a>
                )}
                {/* {stockMovementPermission &&
                  stockMovementPermission.delete && (
                    <a
                      href="#deleteStockactionModal"
                      className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-danger"
                      data-toggle="modal"
                    >
                      <span>حذف</span>
                    </a>
                  )} */}
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
              <div class="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                  المخزن
                </label>
                <select
                  class="form-control border-primary m-0 p-2 h-auto"
                  onChange={(e) => searchByStore(e.target.value)}
                >
                  <option value={""}>الكل</option>
                  {allStores.map((store, i) => {
                    return (
                      <option key={i} value={store._id}>
                        {store.name}
                      </option>
                    );
                  })}
                </select>
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
                  {sourceEn.map((source, i) => {
                    return (
                      <option key={i} value={source}>
                        {sourceAr[i]}
                      </option>
                    );
                  })}
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
                <th rowspan="2">الوحدة</th>
                <th rowspan="2">المرسل</th>
                <th rowspan="2">المستلم</th>
                <th colspan="3">صادر</th>
                <th colspan="3">وارد</th>
                <th colspan="3">الرصيد</th>
                <th rowspan="2">تاريخ الحركة</th>
                <th rowspan="2">أضيف بواسطة</th>
                {/* <th rowspan="2">إجراءات</th> */}
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
                  if (i >= startPagination && i < endPagination) {
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{action.itemId?.itemName}</td>
                        <td>{action.storeId?.storeName}</td>
                        <td>{action.categoryId?.categoryName}</td>
                        <td>{action.costMethod}</td>
                        <td>{action.source}</td>
                        <td>{action.unit}</td>
                        <td>{action.sender?.fullname}</td>
                        <td>{action.receiver?.fullname}</td>
                        <td>{action.outbound?.quantity || 0}</td>
                        <td>{action.outbound?.unitCost || 0}</td>
                        <td>{action.outbound?.totalCost || 0}</td>
                        <td>{action.inbound?.quantity || 0}</td>
                        <td>{action.inbound?.unitCost || 0}</td>
                        <td>{action.inbound?.totalCost || 0}</td>
                        <td>{action.balance?.quantity || 0}</td>
                        <td>
                          {action.balance?.unitCost?.toFixed(2) || "0.00"}
                        </td>
                        <td>{action.balance?.totalCost || 0}</td>
                        <td>{formatDateTime(action.createdAt)}</td>
                        <td>{action.createdBy?.fullname}</td>
                        {/* <td>
                          {stockMovementPermission &&
                            stockMovementPermission.update && (
                              <button

data-target="#editStockactionModal"
                                className="btn btn-sm btn-primary ml-2 "
                                data-toggle="modal"
                                onClick={() => {
                                  setِActionId(action._id);
                                }}
                              >
                                <i
                                  className="material-icons"
                                  data-toggle="tooltip"
                                  title="Edit"
                                >
                                  &#xE254;
                          </i>
                        </button>
                            )}
                          {stockMovementPermission &&
                            stockMovementPermission.delete && (
                              <button

data-target="#deleteStockactionModal"
                                className="btn btn-sm btn-danger"
                                data-toggle="modal"
                                onClick={() => setِActionId(action._id)}
                              >
                                <i
                                  className="material-icons"
                                  data-toggle="tooltip"
                                  title="Delete"
                                >
                                  &#xE872;
                                </i>
                              </button>
                            )}
                        </td> */}
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
                {AllStockactions.length > endPagination
                  ? endPagination
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

      <div id="addStockactionModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded">
            <form onSubmit={createStockAction}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">تسجيل حركة بالمخزن</h4>
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
                    المخزن
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => handleSelectedStore(e.target.value)}
                  >
                    <option value="">اختر المخزن</option>
                    {allStores.map((store, i) => (
                      <option key={i} value={store._id}>
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التصنيف
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                    }}
                  >
                    <option value="">اختر التصنيف</option>
                    {allCategoryStock.map((category, i) => (
                      <option key={i} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    الصنف
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => {
                      handleSelectedItem(e);
                    }}
                  >
                    <option value="">اختر الصنف</option>
                    {StockItems.filter(
                      (item) =>
                        item.stores &&
                        item.stores?.some((store) => store._id === storeId) &&
                        item.categoryId?._id === categoryId
                    )?.map((item, i) => (
                      <option key={i} value={item._id}>
                        {item.itemName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    نوع العملية
                  </label>
                  <select
                    className="form-control border-primary m-0 p-2 h-auto"
                    onChange={(e) => {
                      setSource(e.target.value);
                    }}
                  >
                    <option value="">اختر العملية</option>
                    {sourceEn.map((source, i) => (
                      <option key={i} value={source}>
                        {sourceAr[i]}
                      </option>
                    ))}
                  </select>
                </div>

                {["Issuance", "ReturnIssuance", "Wastage", "Damaged"].includes(
                  source
                ) ? (
                  <>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        المرسل
                      </label>
                      <select
                        className="form-control border-primary m-0 p-2 h-auto"
                        required
                        onChange={(e) => {
                          setSender(e.target.value);
                        }}
                      >
                        <option value="">اختر المرسل</option>
                        {employees.map((employee, i) => (
                          <option key={i} value={employee._id}>
                            {employee.fullname}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        المستلم
                      </label>
                      <select
                        className="form-control border-primary m-0 p-2 h-auto"
                        required
                        onChange={(e) => {
                          setReceiver(e.target.value);
                        }}
                      >
                        <option value="">اختر المستلم</option>
                        {employees.map((employee, i) => (
                          <option key={i} value={employee._id}>
                            {employee.fullname}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        الكمية
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          className="form-control border-primary flex-grow-1"
                          required
                          max={balance.quantity}
                          onChange={(e) => {
                            setQuantity(Number(e.target.value));
                          }}
                        />
                        <input
                          type="text"
                          className="form-control border-primary ms-2"
                          defaultValue={unit}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        طريقه حساب تكلفه الوجده
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control border-primary flex-grow-1"
                          readOnly
                          value={costMethod}
                        />
                      </div>
                    </div>
                  </>
                ) : ["OpeningBalance", "Purchase", "ReturnPurchase"].includes(
                    source
                  ) ? (
                  <>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        المرسل
                      </label>
                      <select
                        className="form-control border-primary m-0 p-2 h-auto"
                        required
                        onChange={(e) => {
                          setSender(e.target.value);
                        }}
                      >
                        <option value="">اختر المورد</option>
                        {suppliers.map((supplier, i) => (
                          <option key={i} value={supplier._id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        المستلم
                      </label>
                      <select
                        className="form-control border-primary m-0 p-2 h-auto"
                        required
                        onChange={(e) => {
                          setReceiver(e.target.value);
                        }}
                      >
                        <option value="">اختر المستلم</option>
                        {employees.map((employee, i) => (
                          <option key={i} value={employee._id}>
                            {employee.fullname}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        الكمية
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          className="form-control border-primary flex-grow-1"
                          required
                          onChange={(e) => {
                            setQuantity(Number(e.target.value));
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-group col-12 col-md-6">
                      <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                        تكلفه الوحده
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          className="form-control border-primary flex-grow-1"
                          required
                          onChange={(e) => {
                            setCostUnit(e.target.value);
                          }}
                        />
                        <input
                          type="text"
                          className="form-control border-primary ms-2"
                          defaultValue={unit}
                          readOnly
                        />
                      </div>
                    </div>
                  </>
                ) : null}
                <div className="form-group col-12 col-md-6">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">
                    التاريخ
                  </label>
                  <input
                    type="text"
                    className="form-control border-primary m-0 p-2 h-auto"
                    Value={formatDate(new Date())}
                    readOnly
                  />
                </div>
              </div>
              <div className="modal-footer d-flex flex-nowrap align-items-center justify-content-between m-0 p-1">
                <input
                  type="submit"
                  className="btn btn-success col-6 h-100 px-2 py-3 m-0"
                  value="اضافة"
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

export default StockMovement;
