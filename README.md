
# React_Express_Transaction


Description
React_Express_Transaction is a web application designed to manage and track financial transactions seamlessly. Built with a React frontend and an Express backend, it allows users to record, update, and visualize transactions in real time. The system uses Prisma for database management, ensuring smooth and reliable interactions with the database.

Key Features
Transaction Management: Record and organize transactions with ease.
Real-time Updates: Automatically updates transaction records for all users.
Data Visualization: Displays transaction history and financial data insights.
Target Users
This project is ideal for:

Small Businesses: To track expenses, income, and other financial transactions.
Individuals: For personal budgeting and expense tracking.
Developers: Those looking to learn or implement a full-stack project using React, Express, Prisma, and Docker.

## Installation

Install 

```bash
 git clone https://github.com/noRte0/React_Express_Transactiongit
 cd React_Express_Transaction
```
Project Setup

root
```bash
npm install --force
```
(root) run docker compose
```bash
docker compose up
```
cd to server
```bash
cd server
npm install --force
```
in server cd src and migration 
```bash
cd src 
npx prisma migrate dev --name [name]
```
run server side
```bash
node index.js
```
cd to client
```bash
cd force
npm install --force
```
run client side
```bash
npm start
```

Client port http://localhost:3000

Server port http://localhost:3030


## Tech Stack

**Client:** React, 

**Server:** Node, Express

