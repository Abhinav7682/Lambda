# E-Commerce Project: Detailed Team Roles & Execution Plan

To get the online shopping website containing a frontend, backend application, and product information fully operational[cite: 3], the following detailed tasks must be completed by each assigned member.

## 1. AWS & Cloud Infrastructure Lead
**Responsibility:** Physical server provisioning, network security, and web server configuration.
**Detailed Tasks:**
*   **Provisioning:** Launch an Amazon EC2 t3.micro instance running the Amazon Linux operating system[cite: 3].
*   **Networking:** Configure the EC2 Security Group to allow inbound HTTP traffic on port 80 (for users) and restrict SSH access on port 22 to the team's IPs[cite: 3]. Allocate and attach an Elastic IP.
*   **Server Setup:** SSH into the instance and install Node.js, npm, PM2, and the Nginx web server[cite: 3].
*   **Reverse Proxy:** Write the \
ginx.conf\ server block to capture port 80 traffic and proxy it (e.g., \proxy_pass http://localhost:3000\) to the internal Node.js application[cite: 3].
*   **Process Management:** Configure PM2 to run the Node.js application in the background and set it to automatically restart if the EC2 instance reboots.

## 2. Backend Developer
**Responsibility:** Database architecture and Express.js API logic.
**Detailed Tasks:**
*   **Initialization:** Set up the Node.js project (\
pm init\) and install core backend dependencies (Express, SQLite/better-sqlite3, CORS).
*   **Database Schema:** Create a script (\init_db.js\) to initialize the SQLite database and create a \products\ table with ID, name, description, price, and stock quantity.
*   **Data Seeding:** Write a function to pre-populate the database with at least 5-10 dummy products so the frontend has data to fetch.
*   **API Routes:** 
    *   Build \GET /api/products\ to query the database and return the full catalog as JSON.
    *   Build \GET /api/products/:id\ to fetch a single product's details.
    *   Build \POST /api/checkout\ to receive cart data, validate it, deduct stock from the database, and return a success response.

## 3. Frontend Developer
**Responsibility:** User interface, design system, and client-side logic.
**Detailed Tasks:**
*   **UI Construction:** Build the HTML structure and style it exclusively using Tailwind CSS to match the strict Antigravity design mandate.
*   **Dynamic Rendering:** Write client-side JavaScript to fetch data from \GET /api/products\ and dynamically generate product cards in the DOM.
*   **State Management:** Implement a client-side shopping cart using \localStorage\ or an array state. Build functions to add items, remove items, and calculate the total price.
*   **Checkout Integration:** Build the checkout form UI. Write the \etch()\ logic to send the cart payload to the \POST /api/checkout\ endpoint and display the success/failure message to the user.

## 4. Full Stack Integrator
**Responsibility:** Bridging the frontend and backend, managing deployments, and final QA.
**Detailed Tasks:**
*   **Environment Configuration:** Set up \.env\ variables so the frontend knows to call \http://localhost:3000\ during local development but calls the public EC2 IP in production.
*   **CORS & Middleware:** Ensure the backend Express app has the correct CORS headers enabled so the frontend can successfully make requests without browser security blocks.
*   **Deployment Execution:** Pull the combined code onto the EC2 instance, run \
pm install\, and use PM2 to start/restart the server (\pm2 start app.js --name "ecommerce"\).
*   **End-to-End Validation:** Access the website via the public IP[cite: 3], manually click through the entire user flow (view product -> add to cart -> checkout), verify the backend database updates correctly, and check the Nginx error logs if anything fails.
