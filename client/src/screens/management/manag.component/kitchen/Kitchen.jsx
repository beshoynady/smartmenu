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

  const {
    formatDate,
    formatTime,
    isRefresh,
    setisRefresh,
    waiterSocket,
  } = useContext(detacontext);

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
      const response = await axios.get(`${apiUrl}/api/preparationsection`, config);
      if (response.status === 200) {
        setPreparationSections(response.data.data);
      } else {
        throw new Error("Failed to fetch sections.");
      }
    } catch (error) {
      console.error("Error fetching preparation sections:", error);
      toast.error("An error occurred while fetching sections. Please try again later.");
    }
  };

  // Fetch tickets and consumption items for the selected section
  const fetchSectionData = async (sectionId) => {
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/api/preparationticket`, config);
      const tickets = response.data.data;
      const filteredTickets = tickets.filter(
        (ticket) => ticket.preparationSection._id === sectionId && ticket.isActive
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
            const ingredients = recipes.find(
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

  useEffect(() => {
    fetchPreparationSections();
  }, []);

  useEffect(() => {
    if (selectedSectionId) {
      fetchSectionData(selectedSectionId);
    }
  }, [selectedSectionId, isRefresh]);

  return (
    <div className="w-100 h-100 d-flex flex-column align-items-start overflow-auto bg-light p-3">
      <div className="w-100 d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex flex-column align-items-start bg-white shadow-sm rounded p-2">
          <label htmlFor="section-select" className="fw-bold text-dark">
            Select Section:
          </label>
          <select
            id="section-select"
            className="form-select"
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            <option value="" disabled selected>
              Choose a section
            </option>
            {preparationSections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex flex-wrap justify-content-around w-50">
          <div className="ticket-box text-center bg-light shadow-sm rounded p-3">
            <h6 className="text-dark">Waiting Approval</h6>
            <p className="text-primary">{sectionStats.waitingApproval}</p>
          </div>
          <div className="ticket-box text-center bg-light shadow-sm rounded p-3">
            <h6 className="text-dark">In Progress</h6>
            <p className="text-warning">{sectionStats.inProgress}</p>
          </div>
          <div className="ticket-box text-center bg-light shadow-sm rounded p-3">
            <h6 className="text-dark">Completed</h6>
            <p className="text-success">{sectionStats.completed}</p>
          </div>
          <div className="ticket-box text-center bg-light shadow-sm rounded p-3">
            <h6 className="text-dark">Rejected</h6>
            <p className="text-danger">{sectionStats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-start">
        {consumptionItems.map((item, index) => (
          <div key={index} className="card bg-primary text-white m-2" style={{ width: "150px" }}>
            <div className="card-body text-center">
              <h6>{item.name}</h6>
              <p>Stock: {item.amount}</p>
              <p>Unit: {item.unit}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex flex-wrap justify-content-start">
        {activeTickets.map((ticket, index) => (
          <div key={index} className="card bg-light m-2" style={{ width: "250px" }}>
            <div className="card-header">
              <h6>Order #{ticket.TicketNum}</h6>
            </div>
            <div className="card-body">
              <p>Status: {ticket.preparationStatus}</p>
              <p>Created At: {formatTime(ticket.createdAt)}</p>
            </div>
            <div className="card-footer d-flex justify-content-between">
              {ticket
.preparationStatus === "Pending" && (
  <button
    className="btn btn-primary"
    onClick={() => updateTicketStatus(ticket._id, "Preparing")}
  >
    Start Preparing
  </button>
)}
{ticket.preparationStatus === "Preparing" && (
  <button
    className="btn btn-success"
    onClick={() => updateTicketStatus(ticket._id, "Prepared")}
  >
    Mark as Completed
  </button>
)}
{ticket.preparationStatus === "Prepared" && (
  <button
    className="btn btn-info"
    onClick={() => toast.info("Waiting for waiter pickup.")}
  >
    Waiting Pickup
  </button>
)}
</div>
</div>
))}
</div>
</div>
);
};

export default PreparationScreen;
