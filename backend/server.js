import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/db/index.js";
import driverRoute from './src/route/driverRoute.js'
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
     origin: "*"
}));
app.use(express.json());
app.use('/driver' , driverRoute)

app.get("/", (req, res) => {
  res.json({
    message: "Delivery Protection API running"
  });
});


const startServer = async () => {

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

};

startServer();