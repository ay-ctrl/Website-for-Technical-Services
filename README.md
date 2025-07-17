# 📘 Dual-Interface Web Platform For Technical Web Services

**ayda.site** is a modern, customizable dual-interface web platform designed to connect businesses with their customers. With user-friendly navigation for customers and advanced control features for administrators, it aims to elevate your digital presence with ease.

---

## 📂 Table of Contents

1. [User Interface](#user-interface)
2. [Admin Interface](#admin-interface)
3. [Customization Options](#customizing-the-website)
4. [Platform Advantages](#advantages)
5. [Contact Section](#contact-section)
6. [Support & Updates](#support--updates)

---

## 🧑‍💻 User Interface

### 1. Homepage
- Visually appealing design highlighting your business, services, and campaigns.
- Quick access to essential info for users.

### 2. Create Requests
- Request form for products/services: name, contact info, request details.
- Unique **Request Number** provided for tracking.

### 3. Track Request
- Allows users to check status using their Request Number.

### 4. Accessories & Additional Products
- Product listings with images, pricing, and technical specs.

### 5. About Us
- Overview of your company history, mission & vision.
- Includes a link to your **Google Reviews** page.

### 6. FAQs
- Answers to common questions (e.g., “How to create a request?”).

### 7. Login
- User login portal with access to admin panel if authorized.

---

## 🔐 Admin Interface

### 1. Admin Homepage
- View users, manage campaigns, access dashboard.

### 2. Requests
- View, edit, or delete user requests.

### 3. Accessories & Products
- Add/remove and manage product listings.

### 4. About Us
- Edit images and content of the About Us section.

### 5. Admin User Sub-Menu
- **Change Password**: Update login credentials.
- **Logout**: Exit admin session securely.

---

## 🎨 Customizing the Website

This site can be fully tailored to your brand:

- **Logo & Colors**: Update site branding to reflect your identity.
- **Text & Images**: Replace demo content with your business info.
- **Custom Sections**: Add or modify sections as needed.

---

## 🚀 Advantages

- **Quick Setup**: Ready-to-launch structure.
- **Highly Flexible**: Fully customizable design and content.
- **Mobile-Friendly**: Optimized for fast and smooth mobile usage.
- **24/7 Live Support**: Ensure continuous interaction with your customers.

---

## 📞 Contact Section

Located in the footer of the site:

- **Phone & Email**: For direct communication.
- **Working Hours**: Clearly listed; requests outside hours answered next business day.
- **Social Media Icons**: Direct links to platforms like Instagram and Twitter.

---
## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ay-ctrl/Website-for-Technical-Services
cd Website-for-Technical-Services
````

### 2. Install Dependencies
````bash
npm install
````

### 3. Create a .env File

Fill .env file with your Google API project credentials and MongoDB connection URI.

### 3.1 How to Get Google OAuth2 Credentials

Go to Google Cloud Console

Create a new project or select an existing one

Navigate to API & Services > Credentials

Click "Create Credentials" > OAuth 2.0 Client ID

Set the Authorized Redirect URI to: http://localhost:5000

After creation, copy the CLIENT_ID and CLIENT_SECRET into your .env file.

Download the credentials.json and place it in your root project directory.

### 4. Get Your Google Drive Token

To access the Google Drive API, you must generate an access token.

Step 1: Run authDrive.js
````bash
node authDrive.js
````
This will open a Google login page in your browser.

Step 2: Copy the code from the URL
After logging in, you will be redirected to a URL like this:

http://localhost:3000/?code=XYZ123abc
Copy the value after code=.

Step 3: Paste the Code in Terminal
When prompted in the terminal with: "Enter the code from that page here:"
Paste the copied code and press Enter.

If successful, a file named token.json will be automatically created in your project root. This file stores the token required to access the Google Drive API.

▶️ Start the Application
````bash
npm start
````

❗ Notes

If your token expires or is deleted, re-run authDrive.js to generate a new one.

Do not commit .env, credentials.json, or token.json to version control.

These files are excluded via .gitignore for security.


## 🛠️ Support & Updates

For support, feature requests, or suggestions:

- ✉️ **Email**: [ayseatik887@gmail.com](mailto:ayseatik887@gmail.com)  

---

© 2025 ayda.site | Built to empower your business online.
