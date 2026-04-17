import User from "../models/User.js";

/* =================================
   ADMIN: CREATE CONSUMER (OTP ONLY)
=================================*/
export const createConsumer = async (req, res) => {
  try {
    const { 
      name, 
      mobile,
      locationId, 
      meterId, 
      serialNumber,
      blockId
    } = req.body;

    // ✅ Validation
    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile are required",
      });
    }

    // ✅ Check duplicate mobile
    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    // ✅ Create user (NO PASSWORD)
    const consumer = await User.create({
      name,
      mobile,
      locationId,
      meterId,
      serialNumber,
      blockId,
      role: "consumer",
    });

    res.status(201).json({
      success: true,
      message: "Consumer created successfully",
      data: consumer,
    });

  } catch (error) {
    console.error("Create consumer error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllConsumers = async (req, res) => {
  try {
    const consumers = await User.find({ role: "consumer", isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consumers.length,
      data: consumers,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateConsumer = async (req, res) => {
  try {
    delete req.body.role; // prevent role change
    delete req.body.otp;
    delete req.body.otpExpiry;

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "consumer" },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Consumer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Consumer updated successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConsumerById = async (req, res) => {
  try {
    const consumer = await User.findOne({
      _id: req.params.id,
      role: "consumer",
      isActive: true,
    });

    if (!consumer) {
      return res.status(404).json({
        success: false,
        message: "Consumer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: consumer,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteConsumer = async (req, res) => {
  try {
    const consumer = await User.findOneAndDelete({
      _id: req.params.id,
      role: "consumer",
    });

    if (!consumer) {
      return res.status(404).json({
        success: false,
        message: "Consumer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Consumer deleted permanently",
    });

  } catch (error) {
    console.error("Delete consumer error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


