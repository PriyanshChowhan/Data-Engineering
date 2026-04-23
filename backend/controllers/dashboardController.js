const Property = require("../models/Property");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProperties,
      statusBreakdown,
      avgAppreciation,
      topCities,
      propertyTypeDistribution
    ] = await Promise.all([
      Property.countDocuments(),
      Property.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Property.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: "$investment_details.appreciation_percent" }
          }
        }
      ]),
    ]);

    const statusMap = statusBreakdown.reduce((accumulator, item) => {
      accumulator[item._id] = item.count;
      return accumulator;
    }, {});

    res.json({
      success: true,
      total_properties: totalProperties,
      available: statusMap.available || 0,
      under_maintenance: statusMap.under_maintenance || 0,
      sold: statusMap.sold || 0,
      avg_appreciation: Number((avgAppreciation[0]?.average || 0).toFixed(2)),
      top_cities: topCities,
      property_type_distribution: propertyTypeDistribution
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      appreciationByCity,
      pricePerSqftByCity,
      topAppreciationProperties
    ] = await Promise.all([
      Property.aggregate([
        {
          $group: {
            _id: "$location.city",
            avg_appreciation: { $avg: "$investment_details.appreciation_percent" }
          }
        },
        { $sort: { avg_appreciation: -1 } },
        {
          $project: {
            _id: 0,
            city: "$_id",
            avg_appreciation: { $round: ["$avg_appreciation", 2] }
          }
        }
      ]),
      Property.aggregate([
        {
          $group: {
            _id: "$location.city",
            avg_price_per_sqft: { $avg: { $divide: ["$price", "$area_sqft"] } }
          }
        },
        { $sort: { avg_price_per_sqft: -1 } },
        {
          $project: {
            _id: 0,
            city: "$_id",
            avg_price_per_sqft: { $round: ["$avg_price_per_sqft", 2] }
          }
        }
      ]),
      Property.find({})
        .sort({ "investment_details.appreciation_percent": -1 })
        .limit(10)
        .select("property_id title location.city type price investment_details.appreciation_percent")
        .lean()
    ]);

    res.json({
      success: true,
      appreciation_by_city: appreciationByCity,
      price_per_sqft_by_city: pricePerSqftByCity,
      top_appreciation_properties: topAppreciationProperties
    });
  } catch (error) {
    next(error);
  }
};
