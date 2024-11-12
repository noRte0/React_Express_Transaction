import React, { useState, useEffect } from 'react'; 
import axios from 'axios';

const TableManagement = ({ userId }) => {
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState([]);

  const addTable = async () => {
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

      setTables([...tables, response.data]);
      setTableName('');
    } catch (error) {
      console.error("Error adding table:", error);
    }
  };

  const deleteTable = async (tableId) => {
    if (!tableId) {
      console.log("Please select a table to delete");
      return;
    }

    try {
      await axios.delete(`http://localhost:3030/api/tables/${tableId}`, {
        data: { userId: userId },
      });

      setTables(tables.filter((table) => table.id !== tableId));
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  const getTables = async () => {
    if (!userId) {
      console.log("User is not authenticated");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3030/api/gettables?userId=${userId}`);
      setTables(response.data);  
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

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
