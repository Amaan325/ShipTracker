// controllers/apiStatsController.js
const ApiCall = require("../models/ApiCall");

/**
 * Record a new API call
 */
exports.recordApiCall = async (source) => {
  try {
    if (!["AISHUB", "VF"].includes(source)) return;
    await ApiCall.create({ source });
  } catch (err) {
    console.error("❌ Failed to record API call:", err.message);
  }
};

/**
 * GET /api/stats
 * Optional query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
exports.getApiStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = toDate;
      }
    }

    // --- Totals Aggregation ---
    const totalsAgg = await ApiCall.aggregate([
      { $match: filter },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);

    const totalAishub =
      totalsAgg.find((d) => d._id === "AISHUB")?.count || 0;
    const totalVf = totalsAgg.find((d) => d._id === "VF")?.count || 0;
    const total = totalAishub + totalVf;

    // --- Daily Aggregation for charts ---
    const dailyAgg = await ApiCall.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            source: "$source",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          data: {
            $push: { source: "$_id.source", count: "$count" },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format data for Recharts
    const dailyStats = dailyAgg.map((day) => {
      const entry = { date: day._id };
      day.data.forEach((item) => {
        entry[item.source] = item.count;
      });
      // Ensure both sources exist even if 0
      entry.AISHUB = entry.AISHUB || 0;
      entry.VF = entry.VF || 0;
      return entry;
    });

    res.status(200).json({
      success: true,
      totalCalls: total,
      totalAishubCalls: totalAishub,
      totalVfCalls: totalVf,
      dailyStats,
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
