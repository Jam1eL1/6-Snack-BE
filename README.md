# 🍪 Snack — One-Stop Workplace Purchase Management

Snack is a responsive workplace purchasing platform that combines product requests, approvals, budgets, payments, and purchase records in one workflow. Teams can register products from different online stores, submit requests, control company spending, and review purchase history.

## 🔄 How Snack Works

Snack uses three roles: **Super Admin**, **Admin**, and **User**.

The person responsible for company purchasing—such as a procurement manager, office manager, or team lead—creates the company account as the **Super Admin**. They manage the company’s members, roles, and purchasing budget.

Employee accounts are invite-only. The Super Admin invites coworkers to join Snack and assigns each person one of these roles:

- **User:** Browses products and submits purchase requests.
- **Admin:** Has all User permissions, plus the ability to review purchase requests and manage completed orders.

This role system gives each member the tools they need for their responsibilities.

> **Explore each workflow 👇** Click a section below to view its feature GIF and a short explanation.

<details>
  <summary><strong>🔐 Account setup and sign-in</strong></summary>

  <br />

|                                                           Super Admin signup and sign-in                                                            |                                                           Invited member signup and sign-in                                                            |
| :-------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: |
| <img width="250" alt="Super Admin signup and sign-in flow" src="https://github.com/user-attachments/assets/29dedca7-0b4a-47c6-b362-867a6b283d44" /> | <img width="250" alt="Invited member signup and sign-in flow" src="https://github.com/user-attachments/assets/c3756c39-5731-4a70-8fae-1d49f756d4a5" /> |
|                        A Super Admin creates the company account and becomes responsible for its members, roles, and budget.                        |                      Employees join through an email invitation and finish setting up their account through a unique signup link.                      |

Existing Users, Admins, and Super Admins use the same sign-in page.

</details>

---

<details>
  <summary><strong>👤 User: Find products and request a purchase</strong></summary>

  <br />

|                                                                       Browse and request products                                                                        |                                                                    Register and manage listings                                                                    |                                                                       Save favorites                                                                        |                                                                         Review requests                                                                         |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <img width="210" alt="User browsing products and submitting a purchase request" src="https://github.com/user-attachments/assets/2124aef6-40a3-4332-84e5-e483873ed2fe" /> | <img width="210" alt="User registering a product and viewing My Listings" src="https://github.com/user-attachments/assets/954da944-3c32-4593-9b49-1ba86b9aea8e" /> | <img width="210" alt="User liking a product and viewing Favorites" src="https://github.com/user-attachments/assets/184666be-250f-440f-ba71-c1b639478159" /> | <img width="210" alt="User reviewing and canceling a purchase request" src="https://github.com/user-attachments/assets/0780c93a-c76d-4b17-acb3-79aef96bf2be" /> |
|                                                  Browse products, add items to the cart, and submit a purchase request.                                                  |                                                        Register products and view them in **My Listings**.                                                         |                                                     Like products and find them later in **Favorites**.                                                     |                                                      Review or cancel submitted requests in **My Orders**.                                                      |

</details>

---

<details>
  <summary><strong>🛡️ Admin: Review and complete orders</strong></summary>

  <br />

|                                                                    Review purchase requests                                                                     |                                                                   Process payments                                                                   |                                                                  Review order history                                                                   |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
| <img width="250" alt="Admin reviewing and approving purchase requests" src="https://github.com/user-attachments/assets/26b292d2-3ed0-4f48-9c53-859302d6b400" /> | <img width="250" alt="Admin completing a simulated payment" src="https://github.com/user-attachments/assets/f49582b9-a0e1-4617-bd1b-274d30824c8e" /> | <img width="250" alt="Admin reviewing completed order history" src="https://github.com/user-attachments/assets/d9be9069-3774-4a53-8ff1-e6a272f11a9e" /> |
|                                                 Approve or reject team purchase requests in **Manage Orders**.                                                  |                                           Complete approved orders through the simulated payment workflow.                                           |                                                Review completed company purchases in **Order History**.                                                 |

> **Note:** Purchase requests submitted by an Admin are approved automatically.

</details>

---

<details>
  <summary><strong>👑 Super Admin: Manage the company</strong></summary>

  <br />

|                                                                    Invite members                                                                     |                                                                    Remove members                                                                     |                                                                Change member roles                                                                 |                                                                Manage the company budget                                                                |
| :---------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
| <img width="210" alt="Super Admin inviting a company member" src="https://github.com/user-attachments/assets/308e457e-2785-4d62-9ea4-89d6427e7196" /> | <img width="210" alt="Super Admin removing a company member" src="https://github.com/user-attachments/assets/b363779b-ef33-4e2c-8ad1-3a2534d3dcdd" /> | <img width="210" alt="Super Admin changing a member role" src="https://github.com/user-attachments/assets/64c36b60-3124-4a2d-a83d-f70383ef1b22" /> | <img width="210" alt="Super Admin managing the company budget" src="https://github.com/user-attachments/assets/e3827b83-0d4d-41f7-b860-a2c53d0d15cd" /> |
|                                           Invite coworkers to join the company through **Administration**.                                            |                                                       Remove existing members from the company.                                                       |                                                     Assign members the `USER` or `ADMIN` role.                                                     |                                  Set current or upcoming budgets, track spending, and review previous budget periods.                                   |

> **Note:** Super Admins have all Admin permissions. Snack is designed around one primary Super Admin per company, although this is not an enforced limit. Members can only be assigned the `USER` or `ADMIN` role.

</details>

## 🔗 Project Links

| Resource                     | Link                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| Live application             | [sn8ck.com](https://sn8ck.com)                              |
| Frontend repository          | [Jam1eL1/6-Snack-FE](https://github.com/Jam1eL1/6-Snack-FE) |
| Backend repository           | [Jam1eL1/6-Snack-BE](https://github.com/Jam1eL1/6-Snack-BE) |
| Original frontend repository | [De-cal/6-Snack-FE](https://github.com/De-cal/6-Snack-FE)   |
| Original backend repository  | [De-cal/6-Snack-BE](https://github.com/De-cal/6-Snack-BE)   |

<details>
  <summary><strong>About the original project</strong></summary>

Our full-stack team originally built Snack in Korean. The current production version is translated into English and includes additional changes made after the team project.
The [original Figma design](https://www.figma.com/design/c3Lo8L4eTWNHEazE9lDNTu/-%EC%8A%A4%ED%94%84%EB%A6%B0%ED%84%B0-%EA%B3%B5%EC%9C%A0%EC%9A%A9--SNACK_V2--Copy-?node-id=0-1&t=Yoj5wZj8yq7nTkwf-1) for this bootcamp project was provided by [Codeit](https://www.codeit.kr/), a coding education company based in South Korea.
For a detailed record of those updates, see the closed pull requests for the [frontend](https://github.com/Jam1eL1/6-Snack-FE/pulls?q=is%3Apr+is%3Aclosed) and [backend](https://github.com/Jam1eL1/6-Snack-BE/pulls?q=is%3Apr+is%3Aclosed).

</details>

## 🏗️ System Architecture

```text
Browser
  ├── sn8ck.com -> Next.js frontend on Vercel
  ├── API request -> Cloudflare -> Express API on Amazon EC2
  │                                   ├── PostgreSQL on Amazon RDS
  │                                   └── Product uploads to Amazon S3
  └── Product image request -> Amazon CloudFront -> Amazon S3
```

The Next.js frontend sends REST requests with cookie-based JWT authentication to the Express backend. The backend follows a controller-service-repository structure: controllers handle HTTP requests, services run business logic, and repositories access PostgreSQL through Prisma. Product images are stored in Amazon S3 and delivered through Amazon CloudFront, which caches them at edge locations for faster loading.

## 🛠️ Technology Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, TanStack Query, and Zustand
- **Backend:** Node.js, Express, Prisma, PostgreSQL, and JWT authentication
- **Infrastructure:** Vercel, Amazon EC2, Amazon RDS, Amazon S3, Amazon CloudFront, and Cloudflare

## 📁 Project Structure

### Frontend

```text
src/
├── app/          # Routes, layouts, and page-specific components
├── assets/       # Icons, fonts, and static assets
├── components/   # Shared UI and layout components
├── hooks/        # Reusable React and data-fetching hooks
├── lib/          # API clients, schemas, constants, and utilities
├── providers/    # Application context providers
├── stores/       # Client-side stores
├── types/        # Shared TypeScript types
└── proxy.ts      # Authentication-aware request proxy
```

### Backend

```text
src/
├── config/        # Environment and database configuration
├── constants/     # Shared server constants
├── controllers/   # HTTP request handlers
├── cron/          # Scheduled budget job
├── dtos/          # Request and response data contracts
├── middlewares/   # Authentication, validation, and error handling
├── repositories/  # Database queries
├── routes/        # REST route definitions
├── services/      # Business workflows
├── types/         # Shared server types
└── utils/         # Cookies, tokens, dates, and S3 helpers

prisma/
├── migrations/    # Database migrations
├── mocks/         # Development seed records
├── schema.prisma  # Relational data model
└── seed.ts        # Destructive development seed script
```

## 🚀 Development

<details>
  <summary><strong>Local development</strong></summary>

### Requirements

- A supported Node.js version from the backend `engines` field
- npm
- PostgreSQL
- AWS credentials with S3 access if testing product image uploads locally

### Frontend

```bash
git clone https://github.com/Jam1eL1/6-Snack-FE.git
cd 6-Snack-FE
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

The application runs at [http://localhost:3000](http://localhost:3000).

### Backend

```bash
git clone https://github.com/Jam1eL1/6-Snack-BE.git
cd 6-Snack-BE
npm install
```

Create `.env` with the required local values:

```env
DATABASE_URL=<postgresql-connection-string>
PORT=8080
ACCESS_TOKEN_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
JWT_EXPIRATION=<expiration>
AWS_BUCKET_NAME=<bucket-name>
SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>
SMTP_FROM_NAME=<sender-name>
SIGNUP_HOST=http://localhost:3000
```

Prepare the database and start the API:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The API runs at [http://localhost:8080](http://localhost:8080) with the configuration above.

> The backend seed command deletes existing records before inserting mock data. Do not run it against a database you need to preserve.

</details>

<details>
  <summary><strong>Available scripts</strong></summary>

### Frontend scripts

| Command         | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| `npm run dev`   | Start the Next.js development server with Turbopack. |
| `npm run build` | Create a production frontend build.                  |
| `npm run start` | Run the production frontend build.                   |
| `npm run lint`  | Run the configured frontend lint command.            |

### Backend scripts

| Command         | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `npm run dev`   | Start the API with automatic TypeScript reloads.       |
| `npm run build` | Compile the backend into `dist/`.                      |
| `npm run start` | Run the compiled API.                                  |
| `npm run cron`  | Run the compiled monthly-budget job.                   |
| `npm run seed`  | Delete existing database records and insert mock data. |

</details>

## 👥 Team

- **Team Lead:** [De-cal](https://github.com/De-cal)
- **Assistant Lead:** [Jam1eL1](https://github.com/Jam1eL1)
- **Team Member:** [wooju01](https://github.com/wooju01)
- **Team Member:** [rakaso598](https://github.com/rakaso598)
- **Team Member:** [xdnjs7](https://github.com/xdnjs7)
- **Team Member:** [JJOBO](https://github.com/JJOBO)
