const jwt = require("jsonwebtoken");
const secretkey = process.env.SECRET || "secret";

module.exports = (req, res, next) => {
  //token example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWM4MTZmNDE1ZmI5NWI0MGRiNjAwNGQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1OTAxNzE2NDA0NzQsImV4cCI6MTU5MDE3MTY0NDA3NH0.LHMZCGqU04eW91oJNiD9sCWLpGd9pv0Bx-A_D0R"
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodeToken = jwt.verify(token, secretkey);
    //if role is admin then accept the request
    if (decodeToken.role == "admin") return next();
    //if role is not admin throw error
    return res.status(401).json({ error: "Unauthorized" });
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};
