const mongoose = require("mongoose");
const Property = require("../models/Property");

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1
});

const parseList = (value) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const buildPropertyFilter = (query) => {
  const filter = {};
  const cityValues = parseList(query.city);
  const types = parseList(query.type);
  const statuses = parseList(query.status);
  const amenities = parseList(query.amenities);

  if (cityValues.length === 1) {
    filter["location.city"] = cityValues[0];
  } else if (cityValues.length > 1) {
    filter["location.city"] = { $in: cityValues };
  }

  if (types.length === 1) {
    filter.type = types[0];
  } else if (types.length > 1) {
    filter.type = { $in: types };
  }

  if (statuses.length === 1) {
    filter.status = statuses[0];
  } else if (statuses.length > 1) {
    filter.status = { $in: statuses };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};

    if (query.minPrice) {
      filter.price.$gte = Number(query.minPrice);
    }

    if (query.maxPrice) {
      filter.price.$lte = Number(query.maxPrice);
    }
  }

  if (query.minBedrooms) {
    filter.bedrooms = { $gte: Number(query.minBedrooms) };
  }

  if (amenities.length > 0) {
    filter.amenities = { $all: amenities };
  }

  return filter;
};

const buildPropertyQueryString = (filter, page, limit) => {
  const queryFilter = JSON.stringify(filter, null, 2);
  const skip = (page - 1) * limit;

  return `db.properties.find(${queryFilter})
  .sort({ "created_at": -1 })
  .skip(${skip})
  .limit(${limit})`;
};

exports.getProperties = async (req, res, next) => {
  try {
    const startTime = Date.now();
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 12, 1);
    const filter = buildPropertyFilter(req.query);

    const [total, properties] = await Promise.all([
      Property.countDocuments(filter),
      Property.find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    ]);

    res.json({
      success: true,
      data: properties,
      result_count: total,
      execution_time_ms: Date.now() - startTime,
      mongo_query_string: buildPropertyQueryString(filter, page, limit),
      pagination: buildPagination(page, limit, total)
    });
  } catch (error) {
    next(error);
  }
};

exports.searchProperties = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 12, 1);
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    const filter = {};

    if (req.query.q) {
      filter.$text = {
        $search: req.query.q,
        $caseSensitive: false,
        $diacriticSensitive: false
      };
    }

    if (req.query.city) {
      filter["location.city"] = req.query.city;
    }

    if (req.query.type) {
      const types = parseList(req.query.type);
      filter.type = types.length > 1 ? { $in: types } : types[0];
    }

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};

      if (minPrice !== null) {
        filter.price.$gte = minPrice;
      }

      if (maxPrice !== null) {
        filter.price.$lte = maxPrice;
      }
    }

    const projection = filter.$text
      ? { score: { $meta: "textScore" } }
      : undefined;

    const startTime = Date.now();
    const [total, results] = await Promise.all([
      Property.countDocuments(filter),
      Property.find(filter, projection)
        .sort(filter.$text ? { score: { $meta: "textScore" } } : { created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    ]);

    res.json({
      success: true,
      query: req.query.q || "",
      execution_time_ms: Date.now() - startTime,
      result_count: total,
      data: results,
      pagination: buildPagination(page, limit, total)
    });
  } catch (error) {
    next(error);
  }
};

exports.getPropertyById = async (req, res, next) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { property_id: req.params.id };

    const property = await Property.findOne(filter).lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    return res.json({
      success: true,
      data: property
    });
  } catch (error) {
    return next(error);
  }
};

exports.createProperty = async (req, res, next) => {
  try {
    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProperty = async (req, res, next) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { property_id: req.params.id };

    const property = await Property.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
      overwrite: true
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    return res.json({
      success: true,
      data: property
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteProperty = async (req, res, next) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { property_id: req.params.id };
    const property = await Property.findOneAndDelete(filter);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    return res.json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
};
