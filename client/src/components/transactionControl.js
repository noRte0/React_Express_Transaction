import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddTransaction = ({ userId, tables }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [transactions, setTransactions] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category || !selectedTableId) {
      console.log('Please provide all required fields.');
      return;
    }

    const transactionData = {
      amount,
      category,
      note,
      image,
      userId,
      tableId: selectedTableId,
    };

    try {
      const response = await axios.post('http://localhost:3030/api/addTransaction', transactionData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response.data);

      // Reset form fields
      setAmount('');
      setCategory('');
      setNote('');
      setImage(null);
      setSelectedTableId('');
      fetchTransactions(selectedTableId); // Fetch updated transactions
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  // Function to fetch transactions for the selected table
  const fetchTransactions = async (tableId) => {
    try {
      const response = await axios.get(`http://localhost:3030/api/transactions/${tableId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      await axios.delete(`http://localhost:3030/api/transactions/${transactionId}`);
      setTransactions(transactions.filter(transaction => transaction.id !== transactionId)); // Remove deleted transaction from state
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Fetch transactions when the selected table changes
  useEffect(() => {
    if (selectedTableId) {
      fetchTransactions(selectedTableId);
    }
  }, [selectedTableId]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select Category</option>
          <option value="income">Income</option>
          <option value="expenses">Expenses</option>
        </select>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
        <input type="file" onChange={handleImageChange} />

        {/* Dropdown to select table */}
        <select
          value={selectedTableId}
          onChange={(e) => setSelectedTableId(e.target.value)}
          required
        >
          <option value="">Select Table</option>
          {tables && tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </select>

        <button type="submit">Submit Transaction</button>
      </form>

      <div>
        <h3>Transactions for Selected Table</h3>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Note</th>
              <th>Date</th>
              <th>Attachment</th>
              <th>Actions</th> {/* Add Actions column */}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.amount}</td>
                <td>{transaction.category}</td>
                <td>{transaction.note}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>
                  {transaction.attachmentUrl ? (
                    <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      View Image
                    </a>
                  ) : (
                    'No attachment'
                  )}
                </td>
                <td>
                  <button onClick={() => handleDelete(transaction.id)}>Delete</button> {/* Add Delete button */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default AddTransaction;
