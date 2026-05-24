import mongoose from "mongoose";

const workHistorySchema = new mongoose.Schema({
  partner_since: {
    type: Date,
    required: true
  },
  total_working_days: {
    type: Number,
    required: true
  },
  total_deliveries: {
    type: Number,
    required: true
  },
  total_hours_online: {
    type: Number,
    required: true
  }
});

const earningsSchema = new mongoose.Schema({
  total_earned: {
    type: Number,
    required: true
  },
  average_monthly_income: {
    type: Number,
    required: true
  },
  highest_month_income: {
    type: Number,
    required: true
  }
});

const payoutDetailsSchema = new mongoose.Schema({
  account_holder: {
    type: String,
    required: true
  },
  bank_name: {
    type: String,
    required: true
  },
  account_number: {
    type: String,
    required: true
  },
  ifsc: {
    type: String,
    required: true
  },
  upi_id: {
    type: String
  }
});

const driverSchema = new mongoose.Schema(
  {
    driver_id: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    city: {
      type: String,
      required: true
    },

    vehicle_type: {
      type: String,
      required: true
    },

    rating: {
      type: Number,
      min: 0,
      max: 5
    },

    work_history: workHistorySchema,

    earnings: earningsSchema,

    payout_details: payoutDetailsSchema
    ,
    plan: {
  type: String,
  enum: ["basic", "standard", "premium"],
  default: "basic"
}
  },
  {
    timestamps: true
  }
);

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;