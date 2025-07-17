## Known Issues & Areas for Improvement

This project is functional and serves its core purposes, but several improvements are noted here to enhance security, user experience, and backend robustness. 

### 🔒 Security & Validation Issues

- **Lack of Input Length Validation**  
  Some input fields do not enforce minimum/maximum length constraints, which could lead to malformed data.

- **Request ID Format**  
  The current request ID is short (5 digits), predictable, and potentially non-unique. A UUID or timestamp-based format is recommended.

- **No Rate Limiting**  
  Users can send unlimited requests in a short time. Throttling mechanisms like rate limiting middleware should be introduced.

- **Missing Cache Control Headers**  
  Static and dynamic resources lack proper caching directives, which may lead to outdated or insecure content being reused.

- **Invalid File Input Handling**  
  The system does not always respond correctly when invalid file types are submitted — unexpected behavior or crashes may occur.

---

### 🗄️ Database & File Upload Issues

- **No File Size Limit**  
  There is currently no restriction on the maximum size of uploaded files, which may cause performance or storage issues.

- **Weak File Type Validation**  
  MIME type or file extension checks are either missing or too loose, which may lead to unsafe file uploads.

- **Unclear Upload Field Requirements**  
  When a user attempts to upload a file without providing a caption or only submits partial data, the system may fail silently without warning or error messages.

---

These issues do not prevent the application from running in a development setting but should be addressed before production deployment.
