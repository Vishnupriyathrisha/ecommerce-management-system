const Address = require("../models/Address");

// Add Address
const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      addressType = "HOME",
      isDefault = false,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message: "All address fields are required",
      });
    }

    // If this is the first address, make it default automatically
    const addressCount = await Address.countDocuments({
      user: req.user._id,
    });

    let defaultStatus = isDefault;

    if (addressCount === 0) {
      defaultStatus = true;
    }

    // If new address is default, remove default from existing addresses
    if (defaultStatus) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      addressType,
      isDefault: defaultStatus,
    });

    res.status(201).json({
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add address",
      error: error.message,
    });
  }
};

// Get My Addresses
const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
};

// Update Address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      addressType,
      isDefault,
    } = req.body;

    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (addressLine !== undefined) address.addressLine = addressLine;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (addressType !== undefined) address.addressType = addressType;

    // If updated address is set as default
    if (isDefault === true) {
      await Address.updateMany(
        {
          user: req.user._id,
          _id: { $ne: id },
        },
        { $set: { isDefault: false } }
      );

      address.isDefault = true;
    }

    await address.save();

    res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update address",
      error: error.message,
    });
  }
};

// Delete Address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({
      _id: id,
      user: req.user._id,
    });

    // If default address was deleted,
    // make the latest remaining address default
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

// Set Default Address
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    // Remove default from all other addresses
    await Address.updateMany(
      {
        user: req.user._id,
        _id: { $ne: id },
      },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    res.status(200).json({
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to set default address",
      error: error.message,
    });
  }
};

module.exports = {
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};