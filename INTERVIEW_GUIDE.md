# StudentOS — Interview Preparation & Q&A Guide

This guide contains technical explanations and model answers for interview questions related to the **StudentOS** full-stack project.

---

## 1. JavaScript Core

### Q: What is the difference between `let`, `const`, and `var`?
- **`var`**: Function-scoped or globally-scoped. Can be re-declared and updated. Variables are hoisted and initialized to `undefined`.
- **`let`**: Block-scoped (`{}`). Can be updated but **cannot** be re-declared within the same scope. Hoisted but remains in the "Temporal Dead Zone" until declared.
- **`const`**: Block-scoped (`{}`). Cannot be updated or re-declared. Must be initialized during declaration. Rebinding is prohibited, though object/array properties can still be mutated.

### Q: What is a closure in JavaScript?
- A closure is a function bundled together with references to its surrounding lexical state (lexical environment).
- It allows an inner function to access variables from an outer function's scope even after the outer function has finished executing.
- **Example in StudentOS**: Express middleware functions accessing configuration variables defined in outer parent scope.

### Q: What is the difference between `==` and `===`?
- **`==` (Loose Equality)**: Performs type coercion before comparing values (e.g. `'5' == 5` returns `true`).
- **`===` (Strict Equality)**: Compares both value and data type without coercion (e.g. `'5' === 5` returns `false`). Always prefer `===`.

### Q: What are Promises and `async/await`?
- **Promise**: An object representing the eventual completion or failure of an asynchronous operation. States: `pending`, `fulfilled`, or `rejected`.
- **`async/await`**: Syntactic sugar built on top of Promises, allowing asynchronous code to be written sequentially like synchronous code.

---

## 2. React

### Q: Why use component-based architecture?
- Reusability: Components like `TaskModal` or `AttendanceModal` can be reused across different views.
- Maintainability: Encapsulates HTML template logic, styling, and state management in isolated modular files.
- Separates concerns cleanly across UI layers.

### Q: Props vs State?
- **Props**: Immutable data passed down from parent to child components.
- **State**: Internal mutable data managed within a component that triggers a UI re-render when updated via hooks (`useState`).

### Q: What causes a component to re-render in React?
1. Changes to component state (`useState` setter call).
2. Changes to incoming props passed from parent.
3. Parent component re-rendering.
4. Context value changes (`useContext`).

### Q: Why do lists need unique `key` props?
- React uses keys during the Reconciliation process (Virtual DOM diffing) to identify which items have changed, been added, or removed. Keys preserve component state across re-orders.

---

## 3. Backend & REST API

### Q: What is REST (Representational State Transfer)?
- An architectural style for designing networked applications using standard HTTP methods:
  - `GET`: Retrieve resources (`/api/tasks`)
  - `POST`: Create a new resource (`/api/tasks`)
  - `PATCH`: Partially update a resource (`/api/tasks/:id`)
  - `DELETE`: Remove a resource (`/api/tasks/:id`)

### Q: What is Middleware in Express?
- Functions that have access to the request (`req`), response (`res`), and the `next` function in the application HTTP cycle. Used for logging, CORS, body parsing, and authentication (`authenticateToken`).

---

## 4. Authentication & Security

### Q: How does JWT (JSON Web Token) authentication work?
1. User submits login credentials to `POST /api/auth/login`.
2. Backend verifies credentials against database (`bcrypt.compare`).
3. Server generates a signed JWT containing payload data (`{ id, email }`) using a secret key.
4. Client stores the token in `localStorage` and includes it in the `Authorization: Bearer <token>` header for protected requests.
5. Server validates token signature with `jwt.verify` on protected routes.

### Q: Why hash passwords on the server?
- Passwords should never be stored in plain text. Storing bcrypt salt + hash prevents password exposure even if database records are compromised.

---

## 5. Database & SQL Architecture

### Q: Primary Key vs Foreign Key?
- **Primary Key**: A column (or set of columns) that uniquely identifies each row in a database table (e.g. `users.id`).
- **Foreign Key**: A column that references the primary key of another table, establishing a parent-child relationship (e.g. `tasks.user_id` referencing `users.id`).

### Q: How do you prevent a user from accessing another user's data?
- Every SQL query on user-specific resources filters explicitly by the authenticated user's ID (`req.user.id` extracted from verified JWT):
  ```sql
  SELECT * FROM tasks WHERE user_id = ? AND id = ?;
  ```
