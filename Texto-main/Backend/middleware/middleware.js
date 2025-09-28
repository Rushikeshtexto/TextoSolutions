import jwt from "jsonwebtoken";

const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";


export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  //console.log("Auth header:", req.headers.authorization);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 🔥 now you can access req.user.id everywhere
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};