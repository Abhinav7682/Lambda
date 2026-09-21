# E-Commerce Project: Team Roles & Delegation Matrix

## Member 1: Cloud Infrastructure & Security Architect
**Functional Domain:** AWS Environment and Security Perimeter
*   **Core Deliverables:** Provisioning the AWS EC2 t3.micro instance running Amazon Linux 2023[cite: 1]. Configuring the Security Group to allow inbound Port 80 globally and restricting Port 22 (SSH) to the team's IP addresses[cite: 1]. Handling Elastic IP assignment and OS package updates[cite: 1].
*   **Antigravity Focus:** Utilizes the Antigravity CLI to troubleshoot Linux package dependencies, SSH connectivity, and generate server hardening scripts (like fail2ban and UFW)[cite: 1].
*   **Presentation Duty (Phase 1):** Introduces the video, demonstrates the AWS EC2 dashboard, and validates that the attached Security Group rules enforce the proper network restrictions[cite: 1].

## Member 2: Backend API & AI Orchestrator
**Functional Domain:** Node.js Application Logic and Agent Configuration
*   **Core Deliverables:** Setting up the Node.js environment on the EC2 instance, integrating the SQLite database, and creating the systemd service file (\ecommerce.service\) to run the backend as a daemon[cite: 1].
*   **Antigravity Focus:** Authors the master project rules (\.agents/rules/\) and procedural skills (\SKILL.md\)[cite: 1]. Spawns subagents to autonomously generate robust RESTful endpoints in Express.js[cite: 1].
*   **Presentation Duty (Phase 2):** Takes over the screen share to walk through the Antigravity 2.0 IDE, showcasing the rule files, generated artifacts, and the Node.js backend routing logic[cite: 1].

## Member 3: Frontend & Web Proxy Integrator
**Functional Domain:** User Interface and Nginx Routing
*   **Core Deliverables:** Generating HTML, CSS, and UI components that dynamically render the SQLite product data[cite: 1]. Installing and configuring the Nginx web server to reverse proxy Port 80 traffic to the internal Node.js process[cite: 1].
*   **Antigravity Focus:** Uses Antigravity's Browser Agent to simulate user interactions, validate dynamic frontend artifacts, and test Nginx routing[cite: 1].
*   **Presentation Duty (Phase 3):** Demonstrates the live environment via an SSH terminal to show the systemd status and \
ginx.conf\[cite: 1]. Opens a web browser to prove the live storefront and shopping cart are fully functional via the public IPv4 address[cite: 1].

## Member 4: Quality Assurance & Release Manager
**Functional Domain:** Testing, Performance Monitoring, and Video Production
*   **Core Deliverables:** End-to-end integration testing, continuously monitoring the t3.micro CPU burst credit balance, and analyzing Nginx/systemd error logs for application crashes[cite: 1]. 
*   **Antigravity Focus:** Generates automated testing scripts using the AI agent[cite: 1]. Monitors AWS CloudWatch metrics[cite: 1].
*   **Presentation Duty (Phase 4):** Explains the compute economics of the t3.micro instance using the CloudWatch dashboard[cite: 1]. Highlights security implementations (UFW, non-root execution, Nginx headers) and manages the final 10-to-20-minute video choreography, ensuring all faces and audio are clear[cite: 1].
