const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { id: "admin123", email: "admin@test.com" },
  "955866633f80e865cb42e90e2a3a71c06ae321e952c92414c3dcef3866008c7bc17590bd5916ca29613bd88319c7f2b71f38c39a5c098d7de97a46f99583b9fe"
);

console.log("Your token:", token);
