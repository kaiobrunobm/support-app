# SystemPulse IT Support

SystemPulse is a comprehensive IT asset management tool built with Electron. It consists of a silent agent that collects system information from company devices and an admin dashboard for IT professionals to view and search for this information in real-time.

---

##  Features

- **System Agent:** A lightweight, background agent that collects and sends vital system stats.
- **Admin Dashboard:** A secure, intuitive interface to search, filter, and view device data.
- **Instant Search:** Find any device in seconds using its IP address or hostname.
- **Secure:** All data transmission is encrypted over HTTPS.

---

##  Tech Stack

- **Framework:** Electron
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Frontend (Admin):** React / Vue / Svelte (or your choice)
- **Styling:** Tailwind CSS

---

##  Installation

### 1. Agent Setup
*Prerequisites: Node.js, Yarn*
```bash
# Clone the repository
git clone https://github.com/kaiobrunobm/support-app.git
cd support-app

# Install dependencies
yarn install

# Configure the ./agent/src/config.ts for the api url endpoint
export const config = {

  apiUrl: "https://your-api-url", 

};

```

### 2. Backend Setup

```bash

# ./backend/.env setup a postgreSQL locally or any service you like
DATABASE_URL="your-postgresql-url"

# Deploy the backend locally or any service you like (eg. Vercel, Render)

```

### 3. Agent destribution

```bash

# Make the agent installer
yarn make:agent


```

Install the agent in every machine you want

