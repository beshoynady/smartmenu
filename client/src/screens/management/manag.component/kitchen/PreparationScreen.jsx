import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { detacontext } from "../../../../App";
import { toast } from "react-toastify";

const PreparationScreen = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token_e");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const { formatTime, isRefresh, setisRefresh, waiterSocket } =
    useContext(detacontext);

  const [preparationSections, setPreparationSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [activeTickets, setActiveTickets] = useState([]);
  const [consumptionItems, setConsumptionItems] = useState([]);
  const [sectionStats, setSectionStats] = useState({
    waitingApproval: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
  });

  // Fetch all preparation sections
  const fetchPreparationSections = async () => {
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/api/preparationsection`,
        config
      );
      if (response.status === 200) {
        setPreparationSections(response.data.data);
      } else {
        throw new Error("Failed to fetch sections.");
      }
    } catch (error) {
      console.error("Error fetching preparation sections:", error);
      toast.error(
        "An error occurred while fetching sections. Please try again later."
      );
    }
  };

  // Fetch tickets and consumption items for the selected section
  const fetchSectionData = async (sectionId) => {
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/api/preparationticket`,
        config
      );
      const tickets = response.data.data;
      const filteredTickets = tickets.filter(
        (ticket) =>
          ticket.preparationSection._id === sectionId && ticket.isActive
      );

      setActiveTickets(filteredTickets);

      // Update section stats
      const stats = {
        waitingApproval: filteredTickets.filter(
          (ticket) => ticket.preparationStatus === "Pending"
        ).length,
        inProgress: filteredTickets.filter(
          (ticket) => ticket.preparationStatus === "Preparing"
        ).length,
        completed: filteredTickets.filter(
          (ticket) => ticket.preparationStatus === "Prepared"
        ).length,
        rejected: filteredTickets.filter(
          (ticket) => ticket.preparationStatus === "Rejected"
        ).length,
      };
      setSectionStats(stats);

      // Fetch consumption items
      const recipeResponse = await axios.get(`${apiUrl}/api/recipe`, config);
      const recipes = recipeResponse.data;

      const updatedConsumptionItems = [];
      filteredTickets.forEach((ticket) => {
        ticket.products.forEach((product) => {
          if (!product.isDone) {
            const ingredients =
              recipes.find(
                (recipe) => recipe.productId._id === product.productid?._id
              )?.ingredients || [];

            ingredients.forEach((ingredient) => {
              const existingItemIndex = updatedConsumptionItems.findIndex(
                (item) => item.itemId?._id === ingredient.itemId?._id
              );
              const amount = ingredient.amount * product.quantity;

              if (existingItemIndex !== -1) {
                updatedConsumptionItems[existingItemIndex].amount += amount;
              } else {
                updatedConsumptionItems.push({
                  itemId: ingredient.itemId,
                  name: ingredient.name,
                  unit: ingredient.unit,
                  amount,
                });
              }
            });
          }
        });
      });

      setConsumptionItems(updatedConsumptionItems);
    } catch (error) {
      console.error("Error fetching section data:", error);
      toast.error("An error occurred while fetching data for the section.");
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/api/preparationticket/${ticketId}`,
        { preparationStatus: status },
        config
      );

      if (response.status === 200) {
        toast.success(`Ticket status updated to ${status}.`);
        fetchSectionData(selectedSectionId);
      } else {
        throw new Error("Failed to update ticket status.");
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("An error occurred while updating ticket status.");
    }
  };

  const [activeTab, setActiveTab] = useState("newTickets");
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const waitingTime = (t) => {
    const t1 = new Date(t).getTime();
    const t2 = new Date().getTime();
    const elapsedTime = t2 - t1;

    const minutesPassed = Math.floor(elapsedTime / (1000 * 60));
    return minutesPassed;
  };

  useEffect(() => {
    fetchPreparationSections();
  }, []);

  useEffect(() => {
    if (selectedSectionId) {
      fetchSectionData(selectedSectionId);
    }
  }, [selectedSectionId, isRefresh]);

  return (
    <div
      className="w-100 d-flex align-items-start overflow-auto bg-transparent p-2"
      style={{ backgroundColor: "rgba(0, 0, 255, 0.1)" }}
    >
      {/* Section selection and ticket stats */}
      <div
        className=" d-flex col-lg-2 col-sm-3 flex-column align-items-start justify-content-between mb-3"
        style={{ alignItems: "flex-end" }}
      >
        {/* Section selection */}
        <div
          className="d-flex flex-column align-items-end bg-white shadow-sm rounded p-2 mb-3 w-100"
          style={{ maxWidth: "200px" }}
        >
          <label
            htmlFor="section-select"
            className="fw-bold text-dark"
            style={{ fontSize: "1.2rem" }}
          >
            اختر القسم:
          </label>
          <select
            id="section-select"
            className="form-select"
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            <option value="" disabled selected>
              اختر القسم
            </option>
            {preparationSections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ticket stats */}
        <div
          className="w-100 d-flex flex-column align-items-end justify-content-between flex-wrap"
          style={{ maxWidth: "200px" }}
        >
          <div
            className="ticket-box text-center bg-light shadow-sm rounded p-3 mb-2"
            style={{ width: "100%" }}
          >
            <h6 className="text-dark">انتظار الموافقة</h6>
            <p className="text-primary">{sectionStats.waitingApproval}</p>
          </div>
          <div
            className="ticket-box text-center bg-light shadow-sm rounded p-3 mb-2"
            style={{ width: "100%" }}
          >
            <h6 className="text-dark">جاري التنفيذ</h6>
            <p className="text-warning">{sectionStats.inProgress}</p>
          </div>
          <div
            className="ticket-box text-center bg-light shadow-sm rounded p-3 mb-2"
            style={{ width: "100%" }}
          >
            <h6 className="text-dark">تم التنفيذ</h6>
            <p className="text-success">{sectionStats.completed}</p>
          </div>
          <div
            className="ticket-box text-center bg-light shadow-sm rounded p-3"
            style={{ width: "100%" }}
          >
            <h6 className="text-dark">مرفوض</h6>
            <p className="text-danger">{sectionStats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Preparation Ticket Details */}
      <div className=" d-flex col-lg-10 col-sm-9 flex-column justify-content-between align-items-start p-0 m-0">
        <div className="w-100 d-flex justify-content-between align-items-center bg-transparent p-1 mb-3">
          <button
            className="btn btn-primary w-100 w-sm-auto mb-2 mb-sm-0"
            onClick={() => handleTabChange("newTickets")}
          >
            التذاكر الجديدة
          </button>
          <button
            className="btn btn-success w-100 w-sm-auto mb-2 mb-sm-0"
            onClick={() => handleTabChange("completedTickets")}
          >
            التذاكر المنفذة
          </button>
          <button
            className="btn btn-danger w-100 w-sm-auto mb-2 mb-sm-0"
            onClick={() => handleTabChange("cancelledTickets")}
          >
            التذاكر الملغاة
          </button>
          <button
            className="btn btn-info w-100 w-sm-auto mb-2 mb-sm-0"
            onClick={() => handleTabChange("storeConsumption")}
          >
            المخزن الاستهلاك
          </button>
        </div>

        {/* عرض التذاكر والمخزن حسب التبويب */}
        <div className="w-100 h-auto p-0 m-0 text-right">
          {activeTab === "newTickets" && (
            <>
              <h5 calssName="text-right text-dark font-weight-bold mb-4">التذاكر الجديدة</h5>
              <div className="d-flex flex-wrap ">
                {activeTickets.length === 0 ? (
                  <p>لا توجد تذاكر جديدة.</p>
                ) : (
                  activeTickets.map((Ticket, i) => {
                    if (
                      Ticket.preparationStatus === "Pending" || Ticket.preparationStatus === "Preparing"
                    ) {
                      return (
                        <div
                          className="col-lg-4 col-md-4 col-sm-6 col-12 mb-4 ml-2 card text-white bg-success p-0 m-0"
                          key={i}
                        >
                          <div
                            className="card-body text-right d-flex justify-content-between p-0 m-1"
                            style={{ fontSize: "14px", fontWeight: "500" }}
                          >
                            <div className="col-6 p-0">
                              <p className="card-text">
                                {" "}
                                {Ticket.table != null
                                  ? `طاولة: ${Ticket.table?.tableNumber}`
                                  : Ticket.user
                                  ? `العميل: ${Ticket.user?.username}`
                                  : ""}
                              </p>
                              <p className="card-text">
                                رقم الطلب:{" "}
                                {Ticket.order?.TicketNum
                                  ? Ticket.order?.TicketNum
                                  : ""}
                              </p>
                              <p className="card-text">
                                الفاتورة: {Ticket.order?.serial}
                              </p>
                              <p className="card-text">
                                نوع الطلب: {Ticket.order?.orderType}
                              </p>
                            </div>

                            <div className="col-6 p-0">
                              {Ticket.waiter ? (
                                <p className="card-text">
                                  الويتر:{" "}
                                  {Ticket.waiter && Ticket.waiter?.username}
                                </p>
                              ) : (
                                ""
                              )}
                              <p className="card-text">
                                الاستلام: {formatTime(Ticket.createdAt)}
                              </p>
                              <p className="card-text">
                                الانتظار:{" "}
                                {setTimeout(
                                  () => waitingTime(Ticket.updateAt),
                                  60000
                                )}{" "}
                                دقيقه
                              </p>
                            </div>
                          </div>
                          <ul className="list-group list-group-flush">
                            {Ticket.products.map((product, i) => {
                              return (
                                <>
                                  <li
                                    className="list-group-item d-flex flex-column justify-content-between align-items-center p-1"
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
                                    <div className="d-flex justify-content-between align-items-center w-100 p-1">
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
                                            className="list-group-item d-flex flex-column justify-content-between align-items-center p-1"
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
                                            <div className="d-flex justify-content-between align-items-center w-100 p-1">
                                              {extra.extraDetails.map(
                                                (detail) => (
                                                  <p
                                                    className="badge badge-secondary m-1"
                                                    key={detail.extraid}
                                                  >{`${detail.name}`}</p>
                                                )
                                              )}
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
                          <div className="text-center w-100 d-flex flex-row">
                            {Ticket.preparationStatus === "Preparing" ? (
                              <button
                                className="btn w-100 btn-warning h-100 btn btn-lg"
                                onClick={() => {
                                  updateTicketStatus(Ticket._id, "Prepared");
                                }}
                              >
                                تم التنفيذ
                              </button>
                            ) : Ticket.preparationStatus === "Pending" ? (
                              <button
                                className="btn w-100 btn-primary h-100 btn btn-lg"
                                onClick={() =>
                                  updateTicketStatus(Ticket._id, "Preparing")
                                }
                              >
                                بدء التنفيذ
                              </button>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      );
                    } else if (
                      Ticket.preparationStatus === "Prepared"
                    ) {
                      return (
                        <div
                          className="col-lg-4 col-md-4 col-sm-6 col-12 mb-4 ml-2 card text-white bg-success p-0 m-0"
                          key={i}
                        >
                          <div
                            className="card-body text-right d-flex justify-content-between p-0 m-1"
                            style={{ fontSize: "14px", fontWeight: "500" }}
                          >
                            <div className="col-6 p-0">
                              <p className="card-text">
                                {" "}
                                {Ticket.table != null
                                  ? `طاولة: ${Ticket.table?.tableNumber}`
                                  : Ticket.user
                                  ? `العميل: ${Ticket.user.username}`
                                  : ""}
                              </p>
                              <p className="card-text">
                                رقم الطلب:{" "}
                                {Ticket.order?.TicketNum
                                  ? Ticket.order?.TicketNum
                                  : ""}
                              </p>
                              <p className="card-text">
                                الفاتورة: {Ticket.order?.serial}
                              </p>
                              <p className="card-text">
                                نوع الطلب: {Ticket.order?.orderType}
                              </p>
                            </div>

                            <div className="col-6 p-0">
                              {Ticket.waiter ? (
                                <p className="card-text">
                                  الويتر:{" "}
                                  {Ticket.waiter && Ticket.waiter.username}
                                </p>
                              ) : (
                                ""
                              )}
                              <p className="card-text">
                                الاستلام: {formatTime(Ticket.createdAt)}
                              </p>
                              <p className="card-text">
                                الانتظار:{" "}
                                {setTimeout(
                                  () => waitingTime(Ticket.updateAt),
                                  60000
                                )}{" "}
                                دقيقه
                              </p>
                            </div>
                          </div>
                          <ul className="list-group list-group-flush">
                            {Ticket.products.map((product, i) => {
                                return (
                                  <>
                                    <li
                                      className="list-group-item d-flex flex-column justify-content-between align-items-center p-1"
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
                                      <div className="d-flex justify-content-between align-items-center w-100 p-1">
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
                                              className="list-group-item d-flex flex-column justify-content-between align-items-center p-1"
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
                                              <div className="d-flex justify-content-between align-items-center w-100 p-1">
                                                {extra.extraDetails.map(
                                                  (detail) => (
                                                    <p
                                                      className="badge badge-secondary m-1"
                                                      key={detail.extraid}
                                                    >{`${detail.name}`}</p>
                                                  )
                                                )}
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
                          <div className="text-center w-100 d-flex flex-row">
                            <button className="btn w-100 btn-info h-100 btn btn-lg">
                              انتظار الاستلام
                            </button>
                          </div>
                        </div>
                      );
                    }
                  })
                )}
              </div>
            </>
          )}

          {activeTab === "completedTickets" && (
            <>
              <h5 calssName="text-right text-dark font-weight-bold mb-4">التذاكر المنفذة</h5>
              <div>
                {activeTickets.filter(
                  (ticket) => ticket.preparationStatus === "Delivered"
                ).length === 0 ? (
                  <p>لا توجد تذاكر تم تنفيذها.</p>
                ) : (
                  activeTickets
                    .filter((ticket) => ticket.preparationStatus === "Delivered")
                    .map((ticket) => (
                      <div key={ticket._id} className="ticket-card mb-3">
                        <h6>{ticket.productName}</h6>
                        <p>{ticket.details}</p>
                      </div>
                    ))
                )}
              </div>
            </>
          )}

          {activeTab === "cancelledTickets" && (
            <div>
              <h5 calssName="text-right text-dark font-weight-bold mb-4">التذاكر الملغاة</h5>
              {activeTickets.filter(
                (ticket) => ticket.preparationStatus === "Rejected"
              ).length === 0 ? (
                <p>لا توجد تذاكر ملغاة.</p>
              ) : (
                activeTickets
                  .filter((ticket) => ticket.preparationStatus === "Rejected")
                  .map((ticket) => (
                    <div key={ticket._id} className="ticket-card mb-3">
                      <h6>{ticket.productName}</h6>
                      <p>{ticket.details}</p>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === "storeConsumption" && (
            <div>
              <h5 calssName="text-right text-dark font-weight-bold mb-4">عناصر المخزن الاستهلاك</h5>
              {consumptionItems.length === 0 ? (
                <p>لا توجد عناصر مخزن استهلاك.</p>
              ) : (
                consumptionItems.map((item, index) => (
                  <div key={index} className="consumption-item mb-3">
                    <h6>{item.name}</h6>
                    <p>
                      الكمية: {item.amount} {item.unit}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreparationScreen;
