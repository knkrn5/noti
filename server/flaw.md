### S3 File Upload Implementation

The following files handle S3/Backblaze file uploads using credentials received from the backend:

- [s3Upload.js](https://github.com/ishanspain/AppsInvo-printcart24-admin-web-panel/blob/main/utils/s3Upload.js)  
  Contains the shared upload function that configures the storage client and uploads files using the decrypted credentials.

- [AddEditInventory.jsx](https://github.com/ishanspain/AppsInvo-printcart24-admin-web-panel/blob/main/app/%28pages%29/inventory-management/component/AddEditInventory.jsx)  
  Fetches and decrypts the storage credentials, then uses `s3Upload.js` to upload inventory images.

- [AddEditBanner.jsx](https://github.com/ishanspain/AppsInvo-printcart24-admin-web-panel/blob/main/app/%28pages%29/banner-management/component/AddEditBanner.jsx)  
  Fetches and decrypts the storage credentials, then uses `s3Upload.js` to upload banner images.
