# SplitIt - Finance Management Application

SplitIt is a finance management application that simplifies the process of adding bills and splitting expenses among group members. With advanced functionalities for expense management, including features for adding, updating, deleting expenses, and settling balances, SplitIt emerges as an ideal tool for efficient management of shared finances within a group.

## Latest Feature: Participants-Based Splitting

### Overview

In the latest update, SplitIt introduces a sophisticated expense splitting mechanism based on the participants involved in each bill. This enhancement provides users with more flexibility and accuracy in dividing expenses among group members.

### How it Works

1. **Dynamic Splitting**: SplitIt dynamically calculates the split amount for each participant based on the total expense and the number of participants.

2. **Equal Distribution**: Expenses are divided equally among all participants, ensuring a fair distribution of financial responsibilities.

3. **Real-time Balancing**: The application updates participant balances in real-time, reflecting the immediate impact of added or deleted expenses.

4. **Participant Validation**: The system performs participant validation to ensure that each member is correctly linked to the group before processing the expense.

### Implementation in Action

1. Add Expense by selecting involved participants 

![Participants-based Splitting](gitSnaps/Participants_based_Expense_1.png "Participants-based Splitting")

2. Updated Group Balance 

![Participants-based Splitting](gitSnaps/Participants_based_Expense_2.png "Participants-based Splitting")

3. Edit Expense and change payer or participants

![Participants-based Splitting](gitSnaps/Participants_based_Expense_3.png "Participants-based Splitting")

4. Updated Group Balance

![Participants-based Splitting](gitSnaps/Participants_based_Expense_4.png "Participants-based Splitting")


## Features

- **User Authentication**: SplitIt provides user registration and login functionalities to ensure secure access to your finance management account.

- **Bill Management**: Users can easily add, edit, and delete bills. Each bill can be associated with a description, amount, and the members involved in the expense.

- **Expense Splitting**: SplitIt calculates how much each member owes or is owed based on the bills and the members involved. It simplifies the process of dividing expenses evenly with a participant-based splitting mechanism for spliting exclusively among involved members, guaranteeing a tailored and accurate financial management experience without impacting others.

- **Balance Settlement**: Users can settle balances among group members, making it easy to track who owes money and who is owed.

- **Validation**: SplitIt incorporates validation mechanisms to ensure that the bills and expenses are correctly input and that calculations are accurate.

- **Expense Filter**: Effortlessly locate expenses by utilizing our intuitive search bar and refine results further with a selectable date range, providing a seamless and tailored filtering experience.

- **Expense Pagination**: Users can take control of thier expense list with our Pagination feature, allowing to view and manage expenses at thier own pace.

## Technologies Used

- **Frontend (Angular)**: The frontend of SplitIt is built using Angular, a popular web application framework. Angular provides a robust structure for building dynamic and responsive user interfaces.

- **Backend (Node.js with Express)**: The backend of SplitIt is powered by Node.js, a server-side JavaScript runtime, and Express, a web application framework for Node.js. Together, they handle the server-side logic and API endpoints for the application.

- **MongoDB**: SplitIt uses MongoDB, a NoSQL database, to store and manage data. MongoDB's flexibility and scalability make it a suitable choice for handling financial data.

- **JWT (JSON Web Tokens)**: JWT is used for user authentication and authorization in SplitIt. It provides secure and efficient access control to the application.

## Setup Instructions

### Frontend (Angular)

- Navigate to the frontend directory:
   ```bash
   cd splitIt-app
- Install dependencies:
   ```bash
   npm install
- Start the Angular development server:
   ```bash
   ng serve
Open your browser and go to http://localhost:4200 to access the SplitIt frontend.

### Backend (Node.js with Express)

- Navigate to the backend directory:
   ```bash
   cd server
- Install dependencies:
   ```bash
   npm install
- Add .env file and paste following content in it:
   ```bash
   ACCESS_TOKEN_SECRET='123'
   REFRESH_TOKEN_SECRET='123'
   ```
- Configure the MongoDB connection in server.js file in following code:
    ```bash
    mongoose.connect('mongodb://127.0.0.1:27017/SplitIt', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    });
    ```
- Start server:
   ```bash
   node server.js

Test the server's API by making requests to http://localhost:3000 using Postman or any other suitable endpoint testing platform.

# Deployment

Launched website at https://splititapp.netlify.app/

Shifted to Cyclic.sh for hosting Backend server and Netlify for Frontend.

# Future Steps and Improvements

SplitIt is an ongoing project, and there are several potential improvements and future steps:

- **Unequal Split**: Implement backend logic and frontend options to enable unequal distribution of expenses.

- ~~**Participants-based Split**: Implement backend logic and frontend options to select members involved in participants.~~ ✅

- **Notifications**: Add email or in-app notifications to keep users informed about their financial activities.

- **Expense Categories**: Allow users to categorize expenses for better tracking.

- ~~**Expense Modifications**: Allow users to modify expenses and resolve balances based on that.~~ ✅

- **Reports and Analytics**: Create visual reports and analytics for a better understanding of spending patterns.

- **Logs**: Introduce activity logs to monitor all changes within the group.

Please feel free to contribute to the project or provide feedback to help us make SplitIt even better!

Thank you for using SplitIt!

## Snap Shots

1. Register Page 

![Register](gitSnaps/Register.png "Register Page")

2. Register Validations 

![Register Validations](gitSnaps/Register_Validations.png "Register Validations")

3. Register Validations Ok

![Register Validations Ok](gitSnaps/Register_Validations_Ok.png "Register Validations Ok")

4. Login Page 

![Login](gitSnaps/Login.png "Login Page")

5. Login Validations 

![Login Validations](gitSnaps/Login_Validations.png "Login Validations")

6. Login Validations Ok

![Login Validations Ok](gitSnaps/Login_Validations_Ok.png "Login Validations Ok")

7. Home 

![Home](gitSnaps/Home.png "Home")

8. Create Group

![Create Group](gitSnaps/Create_Group.png "Create Group")

9. Group

![Group](gitSnaps/Group.png "Group")

10. Group

![Group](gitSnaps/Group_1.png "Group")

11. Member Validations

![Member Validations](gitSnaps/Member_Validations.png "Member Validations")

12. Member Added

![Member Added](gitSnaps/Member_Added.png "Member Added")

13. Expense

![Expense](gitSnaps/Expense.png "Expense")

14. Member Splits

![Member Splits](gitSnaps/Member_Splits.png "Member Splits")

15. Group Balance

![Group Balance](gitSnaps/Group_Balance.png "Group Balance")

16. Expense Multiple User

![Expense Multiple User](gitSnaps/Expense_Multiple_User.png "Expense Multiple User")

17. Group Balance Multiple User

![Group Balance Multiple User](gitSnaps/Group_Balance_Multiple_User.png "Group Balance Multiple User")

18. Settle Balance

![Settle Balance](gitSnaps/Settle_Balance.png "Settle Balance")

19. Settle Balance Confirmation

![Settle Balance Confirmation](gitSnaps/Settle_Balance_Confirmation.png "Settle Balance Confirmation")

20. Settled Balance

![Settled Balance](gitSnaps/Settled_Balance.png "Settled Balance")

21. Member Settled Balance

![Member Settled Balance](gitSnaps/Member_Settled_Balance.png "Member Settled Balance")

22. Home Group List

![Home Group List](gitSnaps/Home_Group_List.png "Home Group List")