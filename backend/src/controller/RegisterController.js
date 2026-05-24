import Driver from "../models/driver.model.js";
import { DriverData } from "../utils/Zomato_data.js";
export const Register = async (req, res) => {
  try {

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }
    const driver = DriverData.find(d => d.phone === phone);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found in partner data"
      });
    }

    const existingDriver = await Driver.findOne({ phone });

    if (existingDriver) {
      return res.json({
        success: true,
        message: "Driver already registered",
        data: existingDriver
      });
    }

    const newDriver = new Driver(driver);

    await newDriver.save();

    res.status(201).json({
      success: true,
      message: "Driver registered successfully",
      data: newDriver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const PLANS = {
  basic: {
    cost: 34,
    coverage: ["rain"],
    maxPayout: 600
  },
  standard: {
    cost: 58,
    coverage: ["rain", "aqi", "curfew"],
    maxPayout: 1200
  },
  premium: {
    cost: 89,
    coverage: ["all"],
    maxPayout: 2000
  }
};
export const getPlans = async (req, res) => {
  try {
    const { userId, plan } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({
        success: false,
        message: "Enter valid userId and plan"
      });
    }

    const selectedPlan = PLANS[plan.toLowerCase()];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected"
      });
    }
    const driver = await Driver.findById(userId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    driver.plan = plan.toLowerCase();
    await driver.save();

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: {
        userId,
        plan: driver.plan,
        details: selectedPlan
      }
    });

  } catch (error) {
    console.error("Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};