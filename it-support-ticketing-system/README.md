# Internal IT Support Ticketing System

## Overview
This project is a role-based internal IT support ticketing system built with React, Vite, JavaScript, and Material UI.

The goal was to simulate a real internal IT support workflow where employees submit tickets, technicians manage assigned work, and managers oversee escalations, approvals, reassignment, and closure requests.

## Tech Stack
- React
- Vite
- JavaScript
- Material UI
- React Router
- Browser/session storage for demo behavior

## Demo Users
Use these sample accounts in the demo app:

| Role | Email |
|---|---|
| Employee | `employee@allstars.com` |
| Technician | `bob.joe@allstars.com` |
| Manager | `manager@allstars.com` |

The app uses simulated authentication for demo purposes.

## Key Features
- Role-based login and navigation
- Employee, technician, and manager workflows
- Ticket creation and ticket details pages
- Status updates: Open, In Progress, Resolved, Closed
- Priority filters and ticket reassignment
- Internal notes for technician/manager communication
- Employee-technician conversation flow
- Manager approval workflows for escalations and closure requests
- Notification-style updates for ticket activity
- Attachment-style workflow support in the UI

## My Role
- Helped design and build the internal IT support workflow
- Implemented role-based views for employees, technicians, and managers
- Built ticket management features including status updates, filters, reassignment, internal notes, and manager review flows
- Practiced translating business requirements into functional application features
- Presented the project as a support workflow and technical system demo

## Project Structure
```text
src/
  components/       Layout and shared UI components
  pages/            Login, tickets, ticket details, create ticket, internal notes
  services/         Ticket data/service logic
  utils/            Notification helper logic
  assets/           Logo and visual assets
docs/
  final-project-report.pdf
```

## How to Run Locally
```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Supporting Documentation
- [Final project report](docs/final-project-report.pdf)

## Limitations
- Demo project only
- Authentication is simulated
- Uses browser/session storage rather than a production backend
- Does not include production database/API authorization
- File attachment behavior is limited compared to a real production ticketing platform

## Future Improvements
- Add backend authentication
- Connect to a production database
- Add role-based API authorization
- Add manager analytics/dashboard views
- Add email or Slack-style notifications
- Deploy the front end to a cloud hosting service

