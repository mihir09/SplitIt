# SplitIt - Finance Management Application

SplitIt is a finance management application that simplifies the process of adding bills and splitting expenses among group members. Expense management including features for adding, updating, deleting expenses, and settling balances. With advanced functionalities for splitting Equally, Unequally, by Shares and by Percentages. SplitIt emerges as an ideal tool for efficient management of shared finances within a group.

## Latest Feature: Invitation to join group

### Overview

In this latest update, SplitIt introduces a new feature for sending invitations to existing users, providing them with the option to either accept or decline the invitation.

### How it Works

1. **Invitation System**: Users can send invitations to existing users to join their group.

2. **Accept or Decline Invitations**: Receiving users have the option to either accept or decline the invitation.

### Implementation in Action

1. Invitation Sent

![Invitation Sent](gitSnaps/Inivitation_Sent.png "Invitation Sent")

2. Invitation Received

![Invitation Received](gitSnaps/Inivitation_Received.png "Invitation Received")

## Features

- **User Authentication**: SplitIt provides user registration and login functionalities to ensure secure access to your finance management account.

- **Bill Management**: Users can easily add, edit, and delete bills. Each bill can be associated with a description, amount, and the members involved in the expense.

- **Expense Splitting**: SplitIt calculates how much each member owes or is owed based on the bills and the members involved. It simplifies the process of dividing expenses evenly with a participant-based splitting mechanism for spliting exclusively among involved members, guaranteeing a tailored and accurate financial management experience without impacting others. Introducing an advanced option for expense splitting – "Unequal Splitting." This feature allows users to customize the contribution of each participant individually, providing a more personalized and flexible approach to expense sharing. Users can specify the exact amount each member should contribute to the expense, enhancing the granularity and customization of financial arrangements within the group. Additionally, features like "Shares Split" and "Percentage Split" provide alternatives to determine contribution shares and percentages instead of exact amounts, further diversifying the options for users in managing shared expenses.

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

For checking out without signup user either of following details to login:

Email: testuser1@gmail.com
Password: testuser1

or

Email: testuser2@gmail.com
Password: testuser2

# Deployment

Launched website at https://splititapp.netlify.app/

Shifted to Cyclic.sh for hosting Backend server and Netlify for Frontend.

# Future Steps and Improvements

SplitIt is an ongoing project, and there are several potential improvements and future steps:

- ~~**Unequal Split**: Implement backend logic and frontend options to enable unequal distribution of expenses.~~ ✅

- ~~**Participants-based Split**: Implement backend logic and frontend options to select members involved in participants.~~ ✅

- ~~**Shares and Percentages Split**: Implement backend logic and frontend options to enable unequal distribution of expenses by mentioning shares or percentages of involved participants.~~ ✅

- **Notifications**: Add email or in-app notifications to keep users informed about their financial activities.

- ~~**Expense Categories**: Allow users to categorize expenses for better tracking.~~ ✅

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