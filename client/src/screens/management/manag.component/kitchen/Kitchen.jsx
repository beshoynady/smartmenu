import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { detacontext } from "../../../../App";
import { toast } from "react-toastify";

const Kitchen = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const {
    formatDate,
    formatTime,
    isRefresh,
    setisRefresh,
    cashierSocket,
    kitchenSocket,
    BarSocket,
    GrillSocket,
    waiterSocket,
  } = useContext(detacontext);

  const start = useRef();
  const ready = useRef();

  const [PreparationTicketActive, setPreparationTicketActive] = useState([]); // State for active Tickets
  const [consumptionPreparationTicketActive, setConsumptionPreparationTicketActive] = useState([]); // State for active Tickets
  const [AllPreparationTicket, setAllPreparationTicket] = useState([]); // State for all Tickets

  const [allRecipe, setallRecipe] = useState([]); // State for all Tickets

  const getAllRecipe = async () => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }

      const getAllRecipe = await axios.get(`${apiUrl}/api/recipe`, config);
      const allRecipeData = getAllRecipe.data;
      setallRecipe(allRecipeData);
      console.log({ getAllRecipe });
    } catch (error) {
      console.error("Error fetching product recipe:", error.message);
    }
  };

  const getAllPreparationTicket = async () => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }

      // Fetch Tickets from the API
      const Response = await axios.get(`${apiUrl}/api/preparationticket`, config);
      const PreparationTicket = Response.data.data;
      console.log({Response, PreparationTicket });
      // console.log({ kitchenTickets })
      // Set all Tickets state
      setAllPreparationTicket(PreparationTicket);
      const kitchenPreparationTicket = PreparationTicket.filter(
        (ticket) =>
          ticket.preparationSection === "Kitchen" && ticket.isActive === true
      );
      // Filter active Tickets based on certain conditions
      // const activePreparationTicket = kitchenPreparationTicket.filter(
      //   (ticket) =>
      //     ticket.isActive &&
      //     ticket.preparationStatus === "Approved" &&
      //     (ticket.preparationStatus === "Pending" ||
      //       ticket.preparationStatus === "Preparing" ||
      //       ticket.preparationStatus === "Prepared")
      // );

      console.log({ kitchenPreparationTicket });
      // Set active Tickets state
      setPreparationTicketActive(kitchenPreparationTicket);
      const getAllRecipe = await axios.get(`${apiUrl}/api/recipe`, config);
      const allRecipeData = await getAllRecipe.data;

      const allRecipe = allRecipeData;

      const updatedConsumptionPreparationTicketActive = [];

      // console.log({ allRecipe, activeTickets })
      kitchenPreparationTicket &&
        kitchenPreparationTicket.forEach((ticket) => {
          ticket.products.forEach((product) => {
            if (!product.isDone) {
              // console.log({ Ticket, product })
              const productIngredients = product.sizeId
                ? allRecipe.find(
                    (recipe) =>
                      recipe.productId._id === product.productid?._id &&
                      recipe.sizeId === product.sizeId
                  )?.ingredients
                : allRecipe.find(
                    (recipe) => recipe.productId._id === product.productid?._id
                  )?.ingredients || [];

              // console.log({ productIngredients })

              // Update consumptionPreparationTicketActive
              productIngredients &&
                productIngredients.forEach((item) => {
                  const existingItemIndex =
                    updatedConsumptionPreparationTicketActive.findIndex(
                      (con) => con.itemId?._id === item.itemId?._id
                    );
                  const amount = item.amount * product.quantity;

                  if (existingItemIndex !== -1) {
                    // If the item already exists, update the amount
                    updatedConsumptionPreparationTicketActive[existingItemIndex].amount +=
                      amount;
                  } else {
                    // If the item does not exist, add it to the array
                    updatedConsumptionPreparationTicketActive.push({
                      itemId: item.itemId,
                      name: item.name,
                      unit: item.unit,
                      amount,
                    });
                  }
                });

              product.extras &&
                product.extras.map((productextra) => {
                  productextra.extraDetails.map((extra) => {
                    const extraIngredients =
                      allRecipe.find(
                        (recipe) => recipe.productId._id === extra.extraId._id
                      )?.ingredients || [];

                    // console.log({ extraIngredients })

                    // Update consumptionPreparationTicketActive
                    extraIngredients &&
                      extraIngredients.forEach((item) => {
                        const existingItemIndex =
                          updatedConsumptionPreparationTicketActive.findIndex(
                            (con) => con.itemId?._id === item.itemId?._id
                          );
                        const amount = item.amount;

                        if (existingItemIndex !== -1) {
                          // If the item already exists, update the amount
                          updatedConsumptionPreparationTicketActive[
                            existingItemIndex
                          ].amount += amount;
                        } else {
                          // If the item does not exist, add it to the array
                          updatedConsumptionPreparationTicketActive.push({
                            itemId: item.itemId,
                            name: item.name,
                            unit: item.unit,
                            amount,
                          });
                        }
                      });
                  });
                });
            }
          });
        });
      console.log({ updatedConsumptionPreparationTicketActive });

      // Set updated consumptionPreparationTicketActive state
      setConsumptionPreparationTicketActive(updatedConsumptionPreparationTicketActive);
    } catch (error) {
      // Handle errors
      console.error("Error fetching Tickets:", error);
    }
  };
  const today = formatDate(new Date());
  const [date, setDate] = useState(today);
  const [allKitchenConsumption, setAllKitchenConsumption] = useState([]);
  const [filteredKitchenConsumptionToday, setFilteredKitchenConsumptionToday] =
    useState([]);

  const getKitchenConsumption = async () => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مرة أخرى");
        return;
      }

      setFilteredKitchenConsumptionToday([]);
      // console.log("Fetching kitchen consumption...");

      const response = await axios.get(`${apiUrl}/api/consumption`, config);

      if (response && response.data) {
        const kitchenConsumptions = response.data.data || [];
        setAllKitchenConsumption(kitchenConsumptions);

        const kitchenConsumptionsToday = kitchenConsumptions.filter(
          (kitItem) => {
            const itemDate = formatDate(kitItem.createdAt);
            return itemDate === date;
          }
        );

        // console.log({ kitchenConsumptionsToday, kitchenConsumptions });
        setFilteredKitchenConsumptionToday(kitchenConsumptionsToday);
      } else {
        console.error("Unexpected response or empty data");
      }
    } catch (error) {
      console.error("Error fetching kitchen consumption:", error);
      toast.error("حدث خطأ أثناء جلب استهلاك المطبخ");
    }
  };

  // Updates an Ticket status to 'Preparing'

  const TicketInProgress = async (id) => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      const preparationStatus = "Preparing";
      const response = await axios.put(
        `${apiUrl}/api/preparationticket/${id}`,
        {preparationStatus},
        config
      );
      console.log({id, preparationStatus,response})
      if (response.status === 200) {
        // Fetch Tickets from the API
        getAllPreparationTicket();
        toast.success("الاوردر يجهز!");
      } else {
        toast.error("حدث خطأ اثناء قبول الاوردر ! حاول مره اهري");
      }
    } catch (error) {
      console.error(error);
      toast.error("فش بدء الاوردر ! اعد تحميل الصفحة ");
    }
  };

  const updateTicketDone = async (id, type) => {
    if (!token) {
      toast.error("رجاء تسجيل الدخول مره أخرى");
      return;
    }

    try {
      // 1. Fetch Ticket and product data
      const preparationticketData = await axios.get(
        `${apiUrl}/api/preparationticket/${id}`,
        config
      );
      const { products: kitchenProducts } = preparationticketData.data.data;

      const orderProducts = preparationticketData.data.data.order?.products;
      console.log({ TicketProducts });

      if (!kitchenProducts.length) {
        toast.warn("لا توجد منتجات بحاجة إلى تجهيز في المطبخ");
        return;
      }

      // 2. Fetch today's kitchen consumption data
      const { data: consumptionData } = await axios.get(
        `${apiUrl}/api/consumption`,
        config
      );
      const allKitchenConsumption = consumptionData.data;
      const kitchenConsumptionsToday = allKitchenConsumption.filter((item) => {
        const itemDate = formatDate(item.createdAt);
        return itemDate === date;
      });

      // 3. Prepare total consumption Ticket
      const totalConsumptionTicket = [];

      for (const product of kitchenProducts) {
        if (product.isDone) continue;

        // Fetch product ingredients from recipes
        const productIngredients = product.sizeId
          ? allRecipe.find(
              (recipe) =>
                recipe.productId._id === product.productid?._id &&
                recipe.sizeId === product.sizeId
            )?.ingredients
          : allRecipe.find(
              (recipe) => recipe.productId._id === product.productid?._id
            )?.ingredients || [];

        // Process ingredients
        for (const ingredient of productIngredients || []) {
          const existingItemIndex = totalConsumptionTicket.findIndex(
            (item) => item.itemId?._id === ingredient.itemId?._id
          );

          const amount = ingredient.amount * product.quantity;

          if (existingItemIndex !== -1) {
            totalConsumptionTicket[existingItemIndex].amount += amount;
          } else {
            const kitchenConsumption = kitchenConsumptionsToday.find(
              (kitItem) => kitItem.stockItemId._id === ingredient.itemId?._id
            );

            totalConsumptionTicket.push({
              itemId: ingredient.itemId,
              amount,
              productsProduced: kitchenConsumption
                ? [...kitchenConsumption.productsProduced]
                : [],
            });
          }
        }

        // Process extras
        for (const extraGroup of product.extras || []) {
          for (const extra of extraGroup.extraDetails) {
            const extraIngredients =
              allRecipe.find(
                (recipe) => recipe.productId._id === extra.extraId._id
              )?.ingredients || [];

            for (const ingredient of extraIngredients) {
              const existingItemIndex = totalConsumptionTicket.findIndex(
                (item) => item.itemId?._id === ingredient.itemId?._id
              );
              const amount = ingredient.amount;

              if (existingItemIndex !== -1) {
                totalConsumptionTicket[existingItemIndex].amount += amount;
              } else {
                totalConsumptionTicket.push({
                  itemId: ingredient.itemId,
                  amount,
                });
              }
            }
          }
        }
      }

      // 4. Update consumption data in the kitchen
      for (const item of totalConsumptionTicket) {
        const kitchenConsumption = kitchenConsumptionsToday.find(
          (kitItem) => kitItem.stockItemId._id === item.itemId?._id
        );

        if (kitchenConsumption) {
          const consumptionQuantity =
            kitchenConsumption.consumptionQuantity + item.amount;
          const bookBalance = kitchenConsumption.bookBalance - item.amount;

          await axios.put(
            `${apiUrl}/api/consumption/${kitchenConsumption._id}`,
            {
              consumptionQuantity,
              bookBalance,
              productsProduced: item.productsProduced,
            },
            config
          );
        }
      }

      const updateTicketProducts = kitchenProducts.map((product) => {
        return { ...product, isDone: true };
      });

      // 5. Update Ticket Products
      const updatedOrderProducts = orderProducts.map((product) => {
        if (
          kitchenProducts.some(
            (kitchenProduct) =>
              kitchenProduct.productid?._id === product.productid._id
          )
        ) {
          return { ...product, isDone: true };
        } else {
          return product;
        }
      });

      const updateTicket = axios.put(
        `${apiUrl}/api/preparationticket/${id}`,
        { products: updateTicketProducts, preparationStatus: "Prepared"},
        config
      );
      console.log({updatedOrderProducts, updateTicketProducts, updateTicket})

      // const preparationStatus = { "preparationStatus.Kitchen": "Prepared" };

      if (type === "Internal") {
        const waiter = await specifiedWaiter(id);
        if (!waiter) {
          toast.warn("لا يوجد نادل متاح لتسليم الطلب. يرجى مراجعة الإدارة!");
          return;
        }
        const response = await axios.put(
          `${apiUrl}/api/order/${id}`,
          {
            "preparationStatus.Kitchen": "Prepared",
            products: updatedOrderProducts,
            waiter,
          },
          config
        );
        waiterSocket.emit("orderready", `أورد جاهز في المطبخ-${waiter}`);
      } else {
        await axios.put(
          `${apiUrl}/api/order/${id}`,
          {
            products: updatedOrderProducts,
            "preparationStatus.Kitchen": "Prepared",
          },
          config
        );
        waiterSocket.emit("orderready", "أورد جاهز في المطبخ");
      }

      // 6. Refresh state
      // getAllPreparationTicket();
      getKitchenConsumption();
      toast.success("تم تجهيز الطلب بنجاح!");
    } catch (error) {
      console.error("Error in updating Ticket:", error);
      toast.error("حدث خطأ أثناء تعديل حالة الطلب. يرجى إعادة المحاولة.");
    }
  };

  const [AllWaiters, setAllWaiters] = useState([]); // State for active waiters

  const getAllWaiters = async () => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }

      const allEmployees = await axios.get(apiUrl + "/api/employee", config);

      const allWaiters =
        allEmployees.data.length > 0
          ? allEmployees.data.filter((employee) => employee.role === "waiter")
          : [];
      const waiterActive =
        allWaiters.length > 0
          ? allWaiters.filter((waiter) => waiter.isActive === true)
          : [];
      setAllWaiters(waiterActive);
    } catch (error) {
      console.log(error);
    }
  };

  // Determines the next available waiter to take an Ticket
  const specifiedWaiter = async (id) => {
    try {
      if (!token) {
        // Handle case where token is not available
        toast.error("رجاء تسجيل الدخول مره اخري");
        return;
      }
      if (AllWaiters.length === 0) {
        // Handle case where token is not available
        toast.warn(
          "قائمه الندلاء فارغه ! رجاء اعاده تحميل الصفحة و اذا ظلت المشكله ابلغ الاداره"
        );
        return;
      }
      // البحث عن الطلب بالمعرف المحدد
      const getTicket = AllPreparationTicket.find((Ticket) => Ticket._id === id);
      if (!getTicket) {
        throw new Error("Ticket not found");
      }

      if (getTicket.status) {
      }
      // استخراج رقم القسم من بيانات الطاولة المرتبطة بالطلب
      const tablesectionNumber =
        getTicket.table && getTicket.table?.sectionNumber;
      if (!tablesectionNumber) {
        throw new Error("Table section number not found");
      }

      // البحث عن النوادل في القسم المحدد
      const sectionWaiters = AllWaiters.filter(
        (waiter) => waiter.sectionNumber === tablesectionNumber
      );
      if (sectionWaiters.length === 0) {
        throw new Error("No waiters found in the specified section");
      }

      const TicketSection = AllPreparationTicket
        .filter(
          (Ticket) =>
            Ticket.waiter && Ticket.waiter.sectionNumber === tablesectionNumber
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      let waiterId = "";

      if (TicketSection.length > 0) {
        const lastWaiterId = TicketSection[0]?.waiter?._id;
        const lastWaiterIndex = sectionWaiters.findIndex(
          (waiter) => waiter._id === lastWaiterId
        );
        console.log({ lastWaiterId, lastWaiterIndex });

        waiterId =
          lastWaiterIndex !== -1 && lastWaiterIndex < sectionWaiters.length - 1
            ? sectionWaiters[lastWaiterIndex + 1]._id
            : sectionWaiters[0]._id;
      } else {
        console.log("لا توجد طلبات سابقة لهذه الطاولة");
        waiterId = sectionWaiters[0]._id;
      }

      console.log({ waiterId });

      return waiterId;
    } catch (error) {
      console.error("Error fetching table or waiter data:", error);
      return "";
    }
  };

  // Calculates the waiting time for an Ticket
  const waitingTime = (t) => {
    const t1 = new Date(t).getTime();
    const t2 = new Date().getTime();
    const elapsedTime = t2 - t1;

    const minutesPassed = Math.floor(elapsedTime / (1000 * 60));
    return minutesPassed;
  };

  // Fetches Tickets and active waiters on initial render
  useEffect(() => {
    getAllRecipe();
    getAllWaiters();
    getAllPreparationTicket()
    getKitchenConsumption();
  }, []);

  useEffect(() => {
    getAllRecipe();
    getAllWaiters();
    getAllPreparationTicket()
    getKitchenConsumption();
  }, [isRefresh]);

  return (
    <div
      className="w-100 h-100 d-flex flex-wrap align-content-start justify-content-around align-items-start  overflowY-auto bg-transparent p-1"
      style={{ backgroundColor: "rgba(0, 0, 255, 0.1)" }}
    >
      <div
        className="col-12 h-auto mb-1 pb-1 d-flex flex-wrap justify-content-around align-items-start"
        style={{ bTicketBottom: "1px solid red" }}
      >
        {PreparationTicketActive &&
          consumptionPreparationTicketActive &&
          consumptionPreparationTicketActive.map((item, index) => (
            <div
              className="card bg-primary text-white"
              style={{ height: "100px", width: "130px" }}
              key={index}
            >
              <div
                className="card-body d-flex flex-column justify-content-center text-center"
                style={{ padding: "5px" }}
              >
                <h5
                  className="card-title text-center"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  {item.name}
                </h5>
                <p
                  className="card-text text-center"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                >
                  الرصيد:{" "}
                  {filteredKitchenConsumptionToday.find(
                    (cons) => cons.stockItemId._id === item.itemId?._id
                  )
                    ? filteredKitchenConsumptionToday.find(
                        (cons) => cons.stockItemId._id === item.itemId?._id
                      ).bookBalance
                    : "0"}{" "}
                  {item.unit}
                </p>
                <p
                  className="card-text text-center"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                >
                  المطلوب: {item.amount}
                </p>
              </div>
            </div>
          ))}
      </div>

      <div className="col-12 d-flex flex-wrap justify-content-around align-items-start">
        {PreparationTicketActive &&
          PreparationTicketActive.map((Ticket, i) => {
            if (
              Ticket.products.filter(
                (product) =>
                  product.isDone === false
              ).length > 0
            ) {
              return (
                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4" key={i}>
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
                          {" "}
                          {Ticket.table != null
                            ? `طاولة: ${Ticket.table.tableNumber}`
                            : Ticket.user
                            ? `العميل: ${Ticket.user.username}`
                            : ""}
                        </p>
                        <p className="card-text">
                          رقم الطلب: {Ticket.TicketNum ? Ticket.TicketNum : ""}
                        </p>
                        <p className="card-text">الفاتورة: {Ticket.serial}</p>
                        <p className="card-text">
                          نوع الطلب: {Ticket.TicketType}
                        </p>
                      </div>

                      <div className="col-6 p-0">
                        {Ticket.waiter ? (
                          <p className="card-text">
                            الويتر: {Ticket.waiter && Ticket.waiter?.username}
                          </p>
                        ) : (
                          ""
                        )}
                        <p className="card-text">
                          الاستلام: {formatTime(Ticket.createdAt)}
                        </p>
                        <p className="card-text">
                          الانتظار:{" "}
                          {setTimeout(() => waitingTime(Ticket.updateAt), 60000)}{" "}
                          دقيقه
                        </p>
                      </div>
                    </div>
                    <ul className="list-group list-group-flush">
                      {Ticket.products
                        .filter(
                          (product) =>
                            product.isDone === false &&
                            product.productid?.preparationSection === "Kitchen"
                        )
                        .map((product, i) => {
                          return (
                            <>
                              <li
                                className="list-group-item d-flex flex-column justify-content-between align-items-center"
                                key={i}
                                style={
                                  product.isAdd
                                    ? { backgroundColor: "red", color: "white" }
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
                                    {i + 1}- {product.name}{" "}
                                    {product.size ? product.size : ""}
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
                                            >{`${detail.name}`}</p>
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
                    <div className="card-footer text-center w-100 d-flex flex-row">
                      {Ticket.preparationStatus === "Preparing" ? (
                        <button
                          className="btn w-100 btn-warning h-100 btn btn-lg"
                          onClick={() => {
                            updateTicketDone(Ticket._id, Ticket.order.orderType);
                          }}
                        >
                          تم التنفيذ
                        </button>
                      ) : Ticket.preparationStatus === "Pending" ? (
                        <button
                          className="btn w-100 btn-primary h-100 btn btn-lg"
                          onClick={() => TicketInProgress(Ticket._id)}
                        >
                          بدء التنفيذ
                        </button>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              );
            } else if (
              Ticket.preparationStatus === "Prepared" &&
              Ticket.products.filter(
                (pr) => pr.isDone === true && pr.isDeleverd === false
              ).length > 0
            ) {
              return (
                <div className="col-md-4 mb-4" key={i}>
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
                          {" "}
                          {Ticket.table != null
                            ? `طاولة: ${Ticket.table.tableNumber}`
                            : Ticket.user
                            ? `العميل: ${Ticket.user.username}`
                            : ""}
                        </p>
                        <p className="card-text">
                          رقم الطلب: {Ticket.TicketNum ? Ticket.TicketNum : ""}
                        </p>
                        <p className="card-text">الفاتورة: {Ticket.serial}</p>
                        <p className="card-text">
                          نوع الطلب: {Ticket.TicketType}
                        </p>
                      </div>

                      <div className="col-6 p-0">
                        {Ticket.waiter ? (
                          <p className="card-text">
                            الويتر: {Ticket.waiter && Ticket.waiter.username}
                          </p>
                        ) : (
                          ""
                        )}
                        <p className="card-text">
                          الاستلام: {formatTime(Ticket.createdAt)}
                        </p>
                        <p className="card-text">
                          الانتظار:{" "}
                          {setTimeout(() => waitingTime(Ticket.updateAt), 60000)}{" "}
                          دقيقه
                        </p>
                      </div>
                    </div>
                    <ul className="list-group list-group-flush">
                      {Ticket.products
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
                                    ? { backgroundColor: "red", color: "white" }
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
                                    {i + 1}- {product.name}{" "}
                                    {product.size ? product.size : ""}
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
                                            >{`${detail.name}`}</p>
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
                    <div className="card-footer text-center w-100 d-flex flex-row">
                      <button className="btn w-100 btn-info h-100 btn btn-lg">
                        انتظار الاستلام
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

export default Kitchen;
