# Real-Estate Investment & Rental Profitability Tracker

A full MERN stack web application for a Data Engineering course project that showcases MongoDB NoSQL capabilities through a real-estate investment and rental operations use case. The project includes a seeded dataset with thousands of documents, a dashboard for analytics, a searchable property explorer, a rental tracker, and a query showcase page built around 20 MongoDB queries mapped to lecture topics.

## Tech Stack

- Frontend: React (Vite), React Router v6, Tailwind CSS, Recharts
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ODM
- Data Generation: `@faker-js/faker`

## Features

- 5,000 seeded property documents, 4,000 rental documents, and 500 market trend documents
- Dashboard metrics and charts for property counts, income, rent, and appreciation
- Property explorer with filters for city, type, status, price, bedrooms, and amenities
- Property detail page with investment metrics, owner info, and rental history
- Rental tracker with expandable payment history and add-payment workflow
- Full-text property search powered by MongoDB text indexes
- Analytics page with appreciation, yield, price-per-sqft, and maintenance charts
- Academic query showcase page with 20 lecture-linked MongoDB queries, exact code display, live execution, result preview, topic filters, and print/export summary

## Project Structure

```text
real-estate-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.js
│   ├── createIndexes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── .env.example
└── README.md
```

## Setup

1. Clone the repository and open the project root.
2. Create a `.env` file in `backend/` or copy values from the root `.env.example`.
3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Seed the database:

```bash
node seed.js
```

5. Create MongoDB indexes:

```bash
node createIndexes.js
```

6. Start the backend in dev mode:

```bash
npm run dev
```

7. In a new terminal, install and run the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

## Runtime URLs

- Backend API: `http://localhost:5000`
- Frontend App: `http://localhost:5173`

## Seeded Collections

- `properties`: 5,000 documents
- `rentals`: 4,000 documents
- `market_trends`: 500 documents

## MongoDB Concepts Demonstrated

- Logical operators: `$and`, `$or`, `$nor`, `$not`, `$ne`
- Comparison operators: `$lt`, `$lte`, `$gt`, `$gte`, `$eq`, `$in`
- Nested document queries with dot notation
- Array queries: `$elemMatch`, `$all`, `$size`, array index dot notation
- Array updates: `$push`, `$pull`, `$pop`, `$pullAll`
- Update operators: `$set`, `$inc`, `$mul`, `$min`, `$max`, `$rename`, `$unset`, `$currentDate`
- Expression queries: `$expr`
- Text search and text score metadata
- Index types: single field, compound, multikey, text, embedded field, nested subdocument index

## Showcase Queries

| Query ID | Name | Topics Covered | Lecture |
| --- | --- | --- | --- |
| Q1 | Premium unsold properties in Mumbai or Delhi with 3+ bedrooms under 2 Crore | Logical Operators, `$and`, `$or`, `$ne`, `$lt`, `$gte`, `$gt`, Comparison Operators | Lec 2 - CRUD Operations |
| Q2 | Apartments and villas that are neither sold nor under maintenance in top metros | `$nor`, `$in`, `$gte`, `$lte`, Logical Operators, Comparison Operators, Nested document field query | Lec 2 + Lec 3 - Logical Operators and Nested Fields |
| Q3 | Properties not listed by owner and priced outside the 50L to 1Cr mid-range | `$not`, `$eq`, `$or`, `$lt`, `$gt`, Logical Operators, Comparison Operators | Lec 2 - CRUD Operations |
| Q4 | Rentals where a payment was late and exceeded the agreed rent amount | `$elemMatch`, Array of embedded documents, Nested documents, Array operators | Lec 3 + Lec 5 - Nested Documents and Arrays |
| Q5 | Fully-loaded properties with exactly 5 amenities including parking, gym and pool | `$all`, `$size`, Array operators, `$ne` | Lec 5 - Array Operators |
| Q6 | Rentals where the first recorded payment was late | Array index dot notation, Nested document access, Array querying, `$gt` | Lec 3 + Lec 5 - Nested Documents and Arrays |
| Q7 | Rentals with at least one high-cost and one low-cost maintenance request | Compound conditions on array without `$elemMatch`, Cross-element matching, Array operators | Lec 5 - Array Operators |
| Q8 | Full-text search for luxury furnished properties using text index | Text indexes, `$text`, `$search`, `$caseSensitive`, `$diacriticSensitive`, `textScore` | Lec 6 - Indexes and Text Search |
| Q9 | Emergency renovation budget increase for properties under maintenance | `$inc`, `$set`, `$currentDate`, `updateMany`, Embedded document update | Lec 4 - Update Operators |
| Q10 | Apply 8 percent appreciation to underperforming Bangalore properties | `$mul`, `$inc`, Multiple field update, `$lt`, `$ne` | Lec 4 - Update Operators |
| Q11 | Conservative valuation update with `$max` and `$min` | `$max`, `$min`, `$currentDate`, Conditional update operators | Lec 4 - Update Operators |
| Q12 | Correct the second payment entry for a specific rental | `$set`, Array element by index, Dot notation on arrays, Embedded arrays | Lec 4 + Lec 5 - Updates on Arrays |
| Q13 | Add a new maintenance request to a rental | `$push`, Array append, Embedded documents | Lec 5 - Array Operators |
| Q14 | Remove resolved low-priority maintenance requests older than 6 months | `$pull`, Condition on embedded array documents, Array cleanup | Lec 5 - Array Operators |
| Q15 | Remove the oldest payment record from overflowing payment histories | `$pop`, `$expr`, `$size`, Array trimming | Lec 5 - Array Operators |
| Q16 | Remove semi-furnished and resale tags from Jaipur properties | `$pullAll`, Remove specific array values, Array updates | Lec 5 - Array Operators |
| Q17 | Rename tenant contact and remove deprecated `id_proof` field | `$rename`, `$unset`, Field cleanup, `$exists` | Lec 4 - Update Operators |
| Q18 | High-ROI available apartments using the compound city, type, status index | Compound indexes, Index prefix rule, Sort on indexed field, `$in`, `$gte` | Lec 6 - Indexes and Performance |
| Q19 | Rentals with high-priority unresolved maintenance over 3000 using multikey index | Multikey index, `$elemMatch`, `$in`, Array of subdocuments | Lec 5 + Lec 6 - Arrays and Indexes |
| Q20 | High-yield premium market trends where monthly average rent exceeds 30000 | Text index on keywords, `$elemMatch`, Nested document query, Compound conditions | Lec 3 + Lec 5 + Lec 6 - Nested Data, Arrays, and Indexes |

## API Highlights

- `GET /api/properties` with pagination and filters
- `GET /api/properties/:id` for single-property detail and rental history
- `GET /api/properties/search/text` for MongoDB text search
- `GET /api/rentals` with pagination and status filters
- `PUT /api/rentals/:id/payment` to append payment history
- `PUT /api/rentals/:id/maintenance` to append maintenance requests
- `GET /api/dashboard/stats` for dashboard cards and charts
- `GET /api/dashboard/analytics` for deeper analytics datasets
- `GET /api/queries` for query metadata
- `GET /api/queries/:queryId` to run any showcase query

## Screenshot Placeholders

- Dashboard: add screenshot of metric cards, bar chart, pie chart, and line chart
- Property Explorer: add screenshot of filters and property card grid
- Property Detail: add screenshot of investment panel and rental history
- Rental Tracker: add screenshot of expandable payment history rows
- Query Showcase: add screenshot of query sidebar, code block, and execution results
- Text Search: add screenshot of search interface and highlighted results
- Analytics: add screenshot of charts and top appreciation table

## Notes

- Run `node createIndexes.js` after seeding to enable the text and multikey demonstrations used by the query showcase.
- The query showcase page uses the same server-side query metadata and query strings that drive execution so the displayed MongoDB code stays aligned with the API behavior.
- API errors are returned in the format `{ success: false, message: "..." }`.
