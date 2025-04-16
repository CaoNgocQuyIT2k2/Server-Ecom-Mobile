// utils/time.js
exports.getTimeRange = (range) => {
    const now = new Date();
    let start, end;
  
    switch (range) {
      case "week":
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
      default:
        return {}; // không lọc theo thời gian
    }
  
    end = now;
    return { $gte: start, $lte: end };
  };
  