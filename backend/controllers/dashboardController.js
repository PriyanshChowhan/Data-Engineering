const Property = require("../models/Property");
const Rental = require("../models/Rental");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProperties,
      statusBreakdown,
      activeRentals,
      monthlyIncome,
      avgAppreciation,
      topCities,
      openMaintenanceRequests,
      avgRent,
      propertyTypeDistribution,
      monthlyRentalIncome
    ] = await Promise.all([
      Property.countDocuments(),
      Property.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Rental.countDocuments({ status: "active" }),
      Rental.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: "$rent_amount" } } }
      ]),
      Property.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: "$investment_details.appreciation_percent" }
          }
        }
      ]),
      Property.aggregate([
        { $group: { _id: "$location.city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, city: "$_id", count: 1 } }
      ]),
      Rental.aggregate([
        { $unwind: "$maintenance_requests" },
        { $match: { "maintenance_requests.status": "open" } },
        { $count: "count" }
      ]),
      Rental.aggregate([
        { $group: { _id: null, average: { $avg: "$rent_amount" } } }
      ]),
      Property.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $project: { _id: 0, type: "$_id", count: 1 } },
        { $sort: { count: -1 } }
      ]),
      Rental.aggregate([
        { $unwind: "$payment_history" },
        {
          $match: {
            "payment_history.status": { $in: ["paid", "late"] }
          }
        },
        {
          $group: {
            _id: "$payment_history.month",
            total_income: { $sum: "$payment_history.amount_paid" }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 12 },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id",
            total_income: 1
          }
        }
      ])
    ]);

    const statusMap = statusBreakdown.reduce((accumulator, item) => {
      accumulator[item._id] = item.count;
      return accumulator;
    }, {});

    res.json({
      success: true,
      total_properties: totalProperties,
      active_rentals: activeRentals,
      rented: statusMap.rented || 0,
      available: statusMap.available || 0,
      under_maintenance: statusMap.under_maintenance || 0,
      sold: statusMap.sold || 0,
      total_monthly_income: monthlyIncome[0]?.total || 0,
      avg_appreciation: Number((avgAppreciation[0]?.average || 0).toFixed(2)),
      top_cities: topCities,
      open_maintenance_requests: openMaintenanceRequests[0]?.count || 0,
      avg_rent: Number((avgRent[0]?.average || 0).toFixed(2)),
      property_type_distribution: propertyTypeDistribution,
      monthly_rental_income: monthlyRentalIncome
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      appreciationByCity,
      rentalYieldByType,
      pricePerSqftByCity,
      maintenanceStatusBreakdown,
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
      Rental.aggregate([
        {
          $lookup: {
            from: "properties",
            localField: "property_id",
            foreignField: "property_id",
            as: "property"
          }
        },
        { $unwind: "$property" },
        {
          $group: {
            _id: "$property.type",
            avg_rent: { $avg: "$rent_amount" },
            avg_price: { $avg: "$property.price" }
          }
        },
        {
          $project: {
            _id: 0,
            type: "$_id",
            avg_rent: { $round: ["$avg_rent", 2] },
            avg_price: { $round: ["$avg_price", 2] },
            yield_percent: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [{ $multiply: ["$avg_rent", 12] }, "$avg_price"]
                    },
                    100
                  ]
                },
                2
              ]
            }
          }
        },
        { $sort: { yield_percent: -1 } }
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
      Rental.aggregate([
        { $unwind: "$maintenance_requests" },
        {
          $group: {
            _id: "$maintenance_requests.status",
            total_cost: { $sum: "$maintenance_requests.cost" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            total_cost: 1,
            count: 1
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
      rental_yield_by_type: rentalYieldByType,
      price_per_sqft_by_city: pricePerSqftByCity,
      maintenance_status_breakdown: maintenanceStatusBreakdown,
      top_appreciation_properties: topAppreciationProperties
    });
  } catch (error) {
    next(error);
  }
};
