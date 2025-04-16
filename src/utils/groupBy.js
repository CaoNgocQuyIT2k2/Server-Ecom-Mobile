const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

exports.groupByTimeUnit = (orders, unit) => {
  const grouped = {}
  const now = new Date()

  orders.forEach(order => {
    const date = new Date(order.createdAt)
    let key = ''

    switch (unit) {
      case 'week': {
        const monday = new Date(now)
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // Monday of current week
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)

        if (date >= monday && date <= sunday) {
          key = date.toISOString().split('T')[0] // 'YYYY-MM-DD'
        } else return
        break
      }

      case 'month': {
        if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
          const week = Math.ceil(date.getDate() / 7)
          key = `Week ${week}`
        } else return
        break
      }

      case 'year': {
        if (date.getFullYear() === now.getFullYear()) {
          key = months[date.getMonth()]
        } else return
        break
      }

      default:
        key = 'Unknown'
    }

    if (!grouped[key]) {
      grouped[key] = {
        totalOrders: 0,
        totalAmount: 0,
        totalDiscount: 0,
        totalRewardUsed: 0
      }
    }

    grouped[key].totalOrders += 1
    grouped[key].totalAmount += order.totalAmount
    grouped[key].totalDiscount += order.discountAmount || 0
    grouped[key].totalRewardUsed += order.usedRewardPoints || 0
  })

  return grouped
}
