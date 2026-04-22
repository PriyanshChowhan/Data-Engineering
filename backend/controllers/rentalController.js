const mongoose = require("mongoose");
const Rental = require("../models/Rental");

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1
});

exports.getRentals = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 12, 1);
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.property_id) {
      filter.property_id = req.query.property_id;
    }

    const [total, rentals] = await Promise.all([
      Rental.countDocuments(filter),
      Rental.find(filter)
        .populate("property")
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    ]);

    res.json({
      success: true,
      data: rentals,
      pagination: buildPagination(page, limit, total)
    });
  } catch (error) {
    next(error);
  }
};

exports.getRentalById = async (req, res, next) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { rental_id: req.params.id };

    const rental = await Rental.findOne(filter).populate("property").lean();

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found"
      });
    }

    return res.json({
      success: true,
      data: rental
    });
  } catch (error) {
    return next(error);
  }
};

exports.createRental = async (req, res, next) => {
  try {
    const rental = await Rental.create(req.body);

    res.status(201).json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

exports.addPayment = async (req, res, next) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { rental_id: req.params.id };
    const rental = await Rental.findOneAndUpdate(
      filter,
      {
        $push: {
          payment_history: req.body
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found"
      });
    }

    return res.json({
      success: true,
      data: rental
    });
  } catch (error) {
    return next(error);
  }
};

exports.addMaintenanceRequest = async (req, res, next) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { rental_id: req.params.id };
    const rental = await Rental.findOneAndUpdate(
      filter,
      {
        $push: {
          maintenance_requests: req.body
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found"
      });
    }

    return res.json({
      success: true,
      data: rental
    });
  } catch (error) {
    return next(error);
  }
};
