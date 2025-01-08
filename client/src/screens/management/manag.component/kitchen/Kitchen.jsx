import { useState, useEffect, useRef, useContext } from "react";
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

  const { formatDate, formatTime, isRefresh, setisRefresh, waiterSocket } =
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

  const [activeTab, setActiveTab] = useState("newTickets"); // قيمة مبدئية للزر النشط
  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
      className="w-100 d-flex flex-column align-items-end overflow-auto bg-transparent p-3"
      style={{ backgroundColor: "rgba(0, 0, 255, 0.1)" }}
    >
      {/* Section selection and ticket stats */}
      <div
        className="w-100 d-flex flex-column align-items-start justify-content-between mb-3"
        style={{ alignItems: "flex-end" }}
      >
        {/* Section selection */}
        <div
          className="d-flex flex-column align-items-end bg-white shadow-sm rounded p-2 mb-3 w-100"
          style={{ maxWidth: "300px" }}
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
          style={{ maxWidth: "400px" }}
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
      <div className="w-100 d-flex flex-column justify-content-between align-items-start">
        <div className="w-100 d-flex justify-content-between align-items-center bg-transparent p-3 mb-3">
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
            عناصر المخزن الاستهلاك
          </button>
        </div>

        {/* عرض التذاكر بناءً على الزر النشط */}
        {activeTab === "newTickets" && (
          <div className="row">
            {PreparationTicketActive &&
              PreparationTicketActive.map((Ticket, i) => {
                if (
                  Ticket.products.filter((product) => product.isDone === false)
                    .length > 0
                ) {
                  return (
                    <div
                      className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4"
                      key={i}
                    >
                      {/* محتوى التذاكر الجديدة */}
                      <div
                        className="card text-white bg-success"
                        style={{ width: "260px" }}
                      >
                        <div className="card-body text-right d-flex justify-content-between p-0 m-1">
                          <div className="col-6 p-0">
                            <p className="card-text">
                              {Ticket.table != null
                                ? `طاولة: ${Ticket.table.tableNumber}`
                                : Ticket.user
                                ? `العميل: ${Ticket.user.username}`
                                : ""}
                            </p>
                            <p className="card-text">
                              رقم الطلب:{" "}
                              {Ticket.TicketNum ? Ticket.TicketNum : ""}
                            </p>
                            <p className="card-text">
                              الفاتورة: {Ticket.serial}
                            </p>
                            <p className="card-text">
                              نوع الطلب: {Ticket.TicketType}
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
                        {/* المزيد من المحتوى الخاص بالمنتجات */}
                      </div>
                    </div>
                  );
                }
              })}
          </div>
        )}

        {activeTab === "completedTickets" && (
          <div className="row">
            {PreparationTicketActive &&
              PreparationTicketActive.map((Ticket, i) => {
                if (
                  Ticket.preparationStatus === "Prepared" &&
                  Ticket.products.filter(
                    (pr) => pr.isDone === true && pr.isDeleverd === false
                  ).length > 0
                ) {
                  return (
                    <div className="col-md-4 mb-4" key={i}>
                      {/* محتوى التذاكر المنفذة */}
                      <div
                        className="card text-white bg-success"
                        style={{ width: "260px" }}
                      >
                        <div className="card-body text-right d-flex justify-content-between p-0 m-1">
                          {/* محتوى البيانات مثل "طاولة"، "رقم الطلب" */}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
          </div>
        )}

        {activeTab === "cancelledTickets" && (
          <div className="row">
            {PreparationTicketActive &&
              PreparationTicketActive.map((Ticket, i) => {
                if (Ticket.preparationStatus === "Rejected") {
                  return (
                    <div className="col-md-4 mb-4" key={i}>
                      {/* محتوى التذاكر الملغاة */}
                      <div
                        className="card text-white bg-danger"
                        style={{ width: "260px" }}
                      >
                        <div className="card-body text-right d-flex justify-content-between p-0 m-1">
                          {/* محتوى البيانات مثل "طاولة"، "رقم الطلب" */}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
          </div>
        )}

        {activeTab === "storeConsumption" && (
          <div className="row">
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
        )}
      </div>
    </div>
  );
};

export default PreparationScreen;
