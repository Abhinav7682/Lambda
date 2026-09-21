name: deploy-aws-node
description: Executes the deployment sequence for the Node.js application on the AWS EC2 instance running Amazon Linux 2023. Handles dependency updates, service restarts, and Nginx validation.
---
# Goal
Deploy the current local state of the Node.js application to the EC2 production environment efficiently and securely without downtime.

# Instructions
1.  **Dependency Synchronization:**
    *   Connect to the EC2 instance via SSH.
    *   Navigate to the project directory: cd /home/ec2-user/shopping-project.
    *   Install new dependencies: npm install.
2.  **Daemon Reloading:**
    *   Execute sudo systemctl daemon-reload to catch any changes to the unit files.
    *   Restart the application server: sudo systemctl restart ecommerce.service.
3.  **Reverse Proxy Verification:**
    *   Validate Nginx syntax: sudo nginx -t.
    *   If the syntax test passes, restart the web server: sudo systemctl restart nginx.
4.  **Health Check:**
    *   Use the curl tool to send a GET request to http://localhost to verify the application is responding with a 200 OK status before concluding the workflow.
