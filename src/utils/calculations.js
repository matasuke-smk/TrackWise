export const calculateSummary = (categories, monthlyData) => {
  let actualIncome = 0
  let actualExpense = 0

  categories.forEach(category => {
    const data = monthlyData.find(item => item.categoryId === category.id)
    if (!data) return

    if (category.type === 'income') {
      actualIncome += data.amount || 0
    } else {
      actualExpense += data.amount || 0
    }
  })

  return {
    actualIncome,
    actualExpense,
    actualBalance: actualIncome - actualExpense,
  }
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('ja-JP').format(num)
}
