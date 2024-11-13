import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter } from 'bad-words';

const AddTransaction = ({ userId, tables, selectedTableId, setSelectedTableId }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filterDate, setFilterDate] = useState('');

  const filter = new Filter();

  // Function to clean offensive words in the note
  const cleanNote = (note) => {
    console.log('Cleaning note:', note);
    const cleanedNote = filter.clean(note);
    console.log('Cleaned note:', cleanedNote);
    return cleanedNote;
  };

  // Handle image file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image file selected:', file.name);
      setImage(file.name);  // Only save the image filename
    }
  };

  // Handle form submission to add a transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Transaction data before submit:', { amount, category, note, image, userId, selectedTableId });

    if (!amount || !category || !selectedTableId) {
      console.log('Please provide all required fields.');
      return;
    }

    const transactionData = {
      amount,
      category,
      note,
      image: image || "-",
      userId,
      tableId: selectedTableId,
    };

    try {
      console.log('Submitting transaction data:', transactionData);

      const response = await axios.post('http://localhost:3030/api/addTransaction', transactionData, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Transaction submitted, response:', response.data);
      
      setAmount('');
      setCategory('');
      setNote('');
      setImage(null);
      setSelectedTableId('');
      fetchTransactions(selectedTableId, page, itemsPerPage);
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  // Fetch transactions for a given table, page, and limit
  const fetchTransactions = async (tableId, page = 1, limit = 10) => {
    console.log('Fetching transactions for tableId:', tableId, 'Page:', page, 'Limit:', limit);

    try {
      const response = await axios.get(`http://localhost:3030/api/transactions/${tableId}`, {
        params: { page, limit },
      });

      console.log('Fetched transactions:', response.data);

      if (Array.isArray(response.data)) {
        setTransactions(response.data);
        setTotalTransactions(response.data.length);
        setTotalPages(Math.ceil(response.data.length / limit));
        setFilteredTransactions(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Handle deleting a transaction
  const handleDelete = async (transactionId) => {
    console.log('Deleting transaction with ID:', transactionId);

    try {
      await axios.delete(`http://localhost:3030/api/transactions/${transactionId}`);
      console.log('Transaction deleted:', transactionId);
      
      setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
      setFilteredTransactions(filteredTransactions.filter(transaction => transaction.id !== transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    console.log('Changing page to:', newPage);

    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchTransactions(selectedTableId, newPage, itemsPerPage);
  };

  // Handle change in number of items per page
  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    console.log('Items per page changed to:', newLimit);

    setItemsPerPage(newLimit);
    setPage(1);
    fetchTransactions(selectedTableId, 1, newLimit);
  };

  // Handle date filter change
  const handleFilterDateChange = (e) => {
    const dateInput = e.target.value;
    console.log('Date filter changed to:', dateInput);
    setFilterDate(dateInput);

    if (dateInput) {
      const [day, month, year] = dateInput.split('/');
      const thaiYear = parseInt(year, 10);
      const gregorianYear = thaiYear - 543;
      const formattedDate = new Date(gregorianYear, month - 1, day);

      const filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getDate() === formattedDate.getDate() &&
          transactionDate.getMonth() === formattedDate.getMonth() &&
          transactionDate.getFullYear() === formattedDate.getFullYear()
        );
      });

      console.log('Filtered transactions by date:', filtered);
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  };

  useEffect(() => {
    if (selectedTableId) {
      fetchTransactions(selectedTableId, page, itemsPerPage);
    }
  }, [selectedTableId, page, itemsPerPage]);

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

        <select
          value={selectedTableId}
          onChange={(e) => setSelectedTableId(e.target.value)}
          required
        >
          <option value="">Select Table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </select>

        <button type="submit">Submit Transaction</button>
      </form>

      <div>
        <h3>Transactions for Selected Table</h3>

        {/* Date filter */}
        <div>
          <input
            type="text"
            placeholder="Filter by date (dd/mm/yyyy)"
            value={filterDate}
            onChange={handleFilterDateChange}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Category</th>
                <th>Note</th>
                <th>Date</th>
                <th>Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions && filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.amount}</td>
                    <td>{transaction.category}</td>
                    <td>{cleanNote(transaction.note)}</td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.attachmentUrl || 'No attachment'}</td>
                    <td>
                      <button onClick={() => handleDelete(transaction.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">Please Select Table..</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div>
          <label>
            Items per page:
            <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>

        <div>
          <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span>{` Page ${page} of ${totalPages} `}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
