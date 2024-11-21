const QRCode = require("qrcode");
const TableModel = require("../models/Table.model");

// Create a new table
const createTable = async (req, res) => {
  const {
    tableNumber,
    tableCode,
    chairs,
    sectionNumber,
    isValid,
    status,
    location,
    notes,
  } = req.body;
  const createdBy = req.employee.id;
  try {
    // Create a new table document in the database
    const tableCreated = await TableModel.create({
      tableNumber,
      tableCode,
      chairs,
      sectionNumber,
      isValid,
      status,
      location,
      notes,
      createdBy,
    });

    return res.status(201).json({
      message: "Table created successfully",
      data: tableCreated,
    });
  } catch (err) {
    console.error("Error creating table:", err.message);
    return res.status(400).json({
      message: "Error creating table",
      error: err.message,
    });
  }
};

// Generate a QR code for a table
const createQR = async (req, res) => {
  const { URL } = req.body;

  try {
    const QR = await QRCode.toDataURL(URL);
    return res.status(200).json({ QRCode: QR });
  } catch (err) {
    console.error("Error generating QR code:", err.message);
    return res.status(400).json({
      message: "Error generating QR code",
      error: err.message,
    });
  }
};

// Retrieve all tables
const showAllTables = async (_req, res) => {
  try {
    const allTables = await TableModel.find()
      .populate("createdBy", "fullname username") // Include creator details
      .populate("updatedBy", "fullname username"); // Include updater details

    return res.status(200).json(allTables);
  } catch (error) {
    console.error("Error fetching all tables:", error.message);
    return res.status(500).json({
      message: "Error fetching tables",
      error: error.message,
    });
  }
};

// Retrieve a specific table by ID
const showOneTable = async (req, res) => {
  const id = req.params.tableid;

  try {
    const oneTable = await TableModel.findById(id)
      .populate("createdBy", "fullname username")
      .populate("updatedBy", "fullname username");

    if (!oneTable) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res.status(200).json(oneTable);
  } catch (err) {
    console.error("Error fetching table:", err.message);
    return res.status(500).json({
      message: "Error fetching table",
      error: err.message,
    });
  }
};

// Update a table by ID
const updateTable = async (req, res) => {
  const id = req.params.tableid;
  const updatedBy = req.employee.id;

  const {
    tableNumber,
    tableCode,
    chairs,
    sectionNumber,
    isValid,
    status,
    location,
    notes,
  } = req.body;

  try {
    const updatedTable = await TableModel.findByIdAndUpdate(
      id,
      {
        $set: {
          tableNumber,
          tableCode,
          chairs,
          sectionNumber,
          isValid,
          status,
          location,
          notes,
          updatedBy,
        },
      },
      { new: true } // Return the updated document
    ).exec();

    if (!updatedTable) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res.status(200).json({
      message: "Table updated successfully",
      data: updatedTable,
    });
  } catch (err) {
    console.error("Error updating table:", err.message);
    return res.status(400).json({
      message: "Error updating table",
      error: err.message,
    });
  }
};

// Delete a table by ID
const deleteTable = async (req, res) => {
  const id = req.params.tableid;

  try {
    const deletedTable = await TableModel.findByIdAndDelete(id).exec();

    if (!deletedTable) {
      return res.status(404).json({
        message: "Table not found or already deleted",
      });
    }

    return res.status(200).json({
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting table:", error.message);
    return res.status(500).json({
      message: "Error deleting table",
      error: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  createTable,
  createQR,
  showAllTables,
  showOneTable,
  updateTable,
  deleteTable,
};
