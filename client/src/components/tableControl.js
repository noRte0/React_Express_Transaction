import React, { useState, useEffect } from 'react'; 
import axios from 'axios';

const TableManagement = ({ userId, tables, setTables, setSelectedTableId }) => {
  const [tableName, setTableName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Function to add a new table
  const addTable = async () => {
    console.log("Attempting to add table with name:", tableName, "for userId:", userId);

    if (!tableName || !userId) {
      console.log("Please provide a table name and userId.");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3030/api/tables',
        {
          name: tableName,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const newTable = response.data;
      console.log("New table added:", newTable);
      
      setTables((prevTables) => [...prevTables, newTable]); // Add new table to state
      setSelectedTableId(newTable.id);  // Select newly created table
      setTableName('');
    } catch (error) {
      console.error("Error adding table:", error);
    }
  };

  // Function to delete a specified table
  const deleteTable = async (tableId) => {
    console.log("Attempting to delete table with ID:", tableId);

    if (!tableId) {
      console.log("Please select a table to delete");
      return;
    }

    try {
      // Check if the table has associated transactions
      const transactionResponse = await axios.get(`http://localhost:3030/api/transactions/${tableId}`);
      console.log("Transactions found for table ID:", tableId, "are:", transactionResponse.data);

      if (transactionResponse.data && transactionResponse.data.length > 0) {
        setErrorMessage("Cannot delete table: transactions exist within this table.");
        console.log("Deletion blocked: table has transactions.");
        return;
      }

      // Proceed with deletion if no transactions are found
      await axios.delete(`http://localhost:3030/api/tables/${tableId}`, {
        data: { userId: userId },
      });
      console.log("Table deleted successfully with ID:", tableId);
      
      setTables(tables.filter((table) => table.id !== tableId)); // Update table list
      setErrorMessage(''); // Clear any existing error messages
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  // Function to fetch tables for the authenticated user
  const getTables = async () => {
    console.log("Fetching tables for userId:", userId);

    if (!userId) {
      console.log("User is not authenticated");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3030/api/gettables?userId=${userId}`);
      console.log("Fetched tables:", response.data);

      setTables(response.data);  // Update tables state with fetched data
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  // Fetch tables when component mounts or userId changes
  useEffect(() => {
    getTables();
  }, [userId]);

  return (
    <div>
      <h3>Table Management</h3>

      <input
        type="text"
        placeholder="Enter table name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <button onClick={addTable}>Add Table</button>

      {/* Display error message if any */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <ul>
        {tables.map((table) => (
          <li key={table.id}>
            {table.name}
            <button onClick={() => deleteTable(table.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableManagement;
