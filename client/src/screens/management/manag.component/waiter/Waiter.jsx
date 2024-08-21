import React, { useState, useEffect, useRef, useContext } from "react";
import { detacontext } from "../../../../App";
// import './Waiter.css'
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const Waiter = () => {
  const { employeeLoginInfo , isRefresh, setisRefresh } = useContext(detacontext);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Refs for buttons
  const start = useRef();
  const ready = useRef();

  // State for pending orders and payments
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  // Function to fetch pending orders and payments
  const fetchPendingData = async () => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      const res = await axios.get(apiUrl + "/api/order/limit/50", config);
      const filterMyOrder = res.data?.filter(
        (order) => order.waiter?._id === employeeLoginInfo.id
      );
      if (filterMyOrder.length > 0) {
        const recentStatus = filterMyOrder.filter(
          (order) => order.status === "Pending"
        );

        const recentPaymentStatus = filterMyOrder.filter(
          (order) => order.payment_status === "Pending"
        );
        setPendingOrders(recentStatus);
        setPendingPayments(recentPaymentStatus);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // State for internal orders
  const [internalOrders, setInternalOrders] = useState([]);

  // Function to fetch internal orders
  const fetchInternalOrders = async () => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      const res = await axios.get(apiUrl + "/api/order/limit/50", config);

      const filterMyOrder = res.data?.filter(
        (order) => order.waiter?._id === employeeLoginInfo.id
      );

      const activeOrders = filterMyOrder.filter(
        (order) => order.isActive === true
      );
      const internalOrdersData = activeOrders.filter(
        (order) => order.orderType === "Internal"
      );

      console.log({ internalOrdersData: internalOrdersData });
      const products =
        internalOrdersData.length > 0
          ? internalOrdersData.flatMap((order) => order.products)
          : [];
      console.log({ products: products });
      const productsFiltered =
        products.length > 0
          ? products.filter(
              (product) =>
                product.isDone === true && product.isDeleverd === false
            )
          : [];

      console.log({ productsFiltered: productsFiltered });

      if (productsFiltered.length > 0) {
        setInternalOrders(internalOrdersData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateOrderOnWay = async (id) => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      const status = "On the way";
      await axios.put(`${apiUrl}/api/order/${id}`, { status }, config);
      fetchInternalOrders();
      fetchPendingData();
      toast.success("تم تاكيد استلام الاوردر!");
    } catch (error) {
      console.log(error);
      toast.error("حدث خطا اثناء قبول الاوردر!");
    }
  };

  const updateOrderDelivered = async (id) => {
    try {
      const orderData = await axios.get(`${apiUrl}/api/order/${id}`, config);
      const products = orderData.data.products.map((prod) => ({
        ...prod,
        isDeleverd: true,
      }));
      const status = "Delivered";
      const updateOrder = await axios.put(
        `${apiUrl}/api/order/${id}`,
        {
          status,
          products,
        },
        config
      );
      if (updateOrder.status === 200) {
        fetchInternalOrders();
        fetchPendingData();
        toast.success("تم تاكيد توصيل الاوردر!");
      }
    } catch (error) {
      console.log(error);
      toast.error("حدث خطا اثناء تاكيد توصيل الاوردر!");
    }
  };

  const helpOnWay = async (id) => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      const helpStatus = "On the way";
      const res = await axios.put(
        `${apiUrl}/api/order/${id}`,
        { helpStatus },
        config
      );
      if (res.status === 200) {
        fetchInternalOrders();
        fetchPendingData();
        toast.success("تم تاكيد الاتجاه لتقديم المساعده!");
      }
    } catch (error) {
      console.log(error);
      toast.error("حدث خطاء اثناء تاكيد الاتجاه للعميل!");
    }
  };

  const helpDone = async (id) => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      const helpStatus = "Assistance done";
      await axios.put(`${apiUrl}/api/order/${id}`, { helpStatus }, config);
      fetchPendingData();
      fetchInternalOrders();
      toast.success("تم تاكيد تقديم المساعده!");
    } catch (error) {
      console.log(error);
      toast.error("حدث خطا اثناء تاكيد تقديم المساعدع!");
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchPendingData();
    fetchInternalOrders();
  }, []);
  useEffect(() => {
    fetchPendingData();
    fetchInternalOrders();
  }, [isRefresh]);

  return (
    <div className="container-fluid d-flex flex-wrap align-content-start justify-content-around align-items-start h-100 overflow-auto bg-transparent py-5 px-3">
      {pendingPayments &&
        pendingPayments
          .filter(
            (order) =>
              order.helpStatus === "Send waiter" ||
              order.helpStatus === "On the way"
          )
          .map((order, i) => {
            return (
              <div
                className="card text-white bg-success"
                style={{ width: "260px" }}
              >
                <div
                  className="card-body text-right d-flex justify-content-between p-0 m-1"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                >
                  <div className="col-6 p-0">
                    <p className="card-text">
                      الطاولة: {order.table?.tableNumber}
                    </p>
                    <p className="card-text">رقم الفاتورة: {order.serial}</p>
                  </div>
                  <div className="col-6 p-0">
                    <p className="card-text">
                      الويتر: {order.waiter?.username}
                    </p>
                    <p className="card-text">
                      التنفيذ:{" "}
                      {new Date(order.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="card-text">
                      الاستلام:{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <ul className="list-group list-group-flush">
                  <li
                    className="list-group-item bg-light text-dark d-flex justify-content-between align-items-center"
                    key={i}
                  >
                    <span style={{ fontSize: "18px" }}>
                      طاولة : {order.table?.tableNumber}
                    </span>
                    <span
                      className="badge bg-secondary rounded-pill"
                      style={{ fontSize: "16px" }}
                    >
                      {order.help === "Requests assistance"
                        ? "يحتاج المساعدة"
                        : order.help === "Requests bill"
                        ? "يطلب الحساب"
                        : ""}
                    </span>
                  </li>
                </ul>
                <div className="card-footer text-center">
                  {order.helpStatus === "On the way" ? (
                    <button
                      className="btn w-100 btn-success h-100 btn btn-lg"
                      onClick={() => helpDone(order._id)}
                    >
                      تم
                    </button>
                  ) : (
                    <button
                      className="btn w-100 btn-warning h-100 btn btn-lg"
                      onClick={() => {
                        helpOnWay(order._id);
                      }}
                    >
                      متجة للعميل
                    </button>
                  )}
                </div>
              </div>
            );
          })}

      {internalOrders &&
        internalOrders.map((order, i) => {
          if (
            order.products.filter(
              (pr) => pr.isDone === true && pr.isDeleverd === false
            ).length > 0
          ) {
            return (
              <div
                className="card text-white bg-success"
                style={{ width: "260px" }}
              >
                <div
                  className="card-body text-right d-flex justify-content-between p-0 m-1"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                >
                  <div className="col-6 p-0">
                    <p className="card-text">
                      الطاولة: {order.table?.tableNumber}
                    </p>
                    <p className="card-text">رقم الفاتورة: {order.serial}</p>
                    <p className="card-text">نوع الطلب: {order.orderType}</p>
                  </div>
                  <div className="col-6 p-0">
                    <p className="card-text">
                      الويتر: {order.waiter?.username}
                    </p>
                    <p className="card-text">
                      التنفيذ:{" "}
                      {new Date(order.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="card-text">
                      الاستلام:{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <ul className="list-group list-group-flush">
                  {order.products
                    .filter(
                      (pr) => pr.isDone === true && pr.isDeleverd === false
                    )
                    .map((product, i) => {
                      return (
                        <>
                          <li
                            className="list-group-item d-flex flex-column justify-content-between align-items-center"
                            key={i}
                            style={
                              product.isAdd
                                ? {
                                    backgroundColor: "red",
                                    color: "white",
                                  }
                                : { color: "black" }
                            }
                          >
                            <div className="d-flex justify-content-between align-items-center w-100">
                              <p
                                style={{
                                  fontSize: "1.2em",
                                  fontWeight: "bold",
                                }}
                              >
                                {i + 1}- {product.name}
                              </p>
                              <span
                                style={{
                                  fontSize: "1.2em",
                                  fontWeight: "bold",
                                }}
                              >
                                {" "}
                                × {product.quantity}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "1.2em",
                                fontWeight: "bold",
                              }}
                            >
                              {product.notes}
                            </div>
                          </li>
                          {product.extras &&
                            product.extras.length > 0 &&
                            product.extras.map((extra, j) => {
                              if (extra && extra.isDone === false) {
                                return (
                                  <li
                                    className="list-group-item d-flex flex-column justify-content-between align-items-center"
                                    key={`${i}-${j}`}
                                    style={
                                      product.isAdd
                                        ? {
                                            backgroundColor: "red",
                                            color: "white",
                                          }
                                        : { color: "black" }
                                    }
                                  >
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                      {extra.extraDetails.map((detail) => (
                                        <p
                                          className="badge badge-secondary m-1"
                                          key={detail.extraid}
                                        >
                                          {`${detail.name}`}
                                        </p>
                                      ))}
                                    </div>
                                  </li>
                                );
                              } else {
                                return null;
                              }
                            })}
                        </>
                      );
                    })}
                </ul>
                <div className="card-footer text-center">
                  {order.status === "Prepared" ? (
                    <button
                      className="btn w-100 btn-warning h-100 btn btn-lg"
                      onClick={() => {
                        updateOrderOnWay(order._id);
                      }}
                    >
                      استلام الطلب
                    </button>
                  ) : (
                    <button
                      className="btn w-100 btn-success h-100 btn btn-lg"
                      onClick={() => {
                        updateOrderDelivered(order._id);
                      }}
                    >
                      تم التسليم
                    </button>
                  )}
                </div>
              </div>
            );
          }
        })}
    </div>
  );
};

export default Waiter;
