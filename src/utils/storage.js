const STORAGE_KEYS = {
  CATEGORIES: 'trackwise_categories',
  MONTHLY_DATA: 'trackwise_monthly_data',
}

const DEFAULT_CATEGORIES = [
  { id: '1', name: '給与', type: 'income', displayGroup: 'main', defaultAmount: 0 },
  { id: '2', name: 'ボーナス', type: 'income', displayGroup: 'others', defaultAmount: 0 },
  { id: '3', name: '副業', type: 'income', displayGroup: 'others', defaultAmount: 0 },
  { id: '4', name: '家賃', type: 'expense', displayGroup: 'main', defaultAmount: 0 },
  { id: '5', name: '食費', type: 'expense', displayGroup: 'main', defaultAmount: 0 },
  { id: '6', name: '光熱費', type: 'expense', displayGroup: 'main', defaultAmount: 0 },
  { id: '7', name: '通信費', type: 'expense', displayGroup: 'main', defaultAmount: 0 },
  { id: '8', name: '交通費', type: 'expense', displayGroup: 'others', defaultAmount: 0 },
  { id: '9', name: '娯楽費', type: 'expense', displayGroup: 'others', defaultAmount: 0 },
  { id: '10', name: '貯蓄', type: 'expense', displayGroup: 'main', defaultAmount: 0 },
]

export const getCategories = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    if (stored) {
      const categories = JSON.parse(stored)
      const migrated = categories.map(cat => ({
        ...cat,
        defaultAmount: cat.defaultAmount ?? 0
      }))
      if (JSON.stringify(categories) !== JSON.stringify(migrated)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(migrated))
      }
      return migrated
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES))
    return DEFAULT_CATEGORIES
  } catch (error) {
    console.error('Failed to get categories:', error)
    return DEFAULT_CATEGORIES
  }
}

export const saveCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    return true
  } catch (error) {
    console.error('Failed to save categories:', error)
    return false
  }
}

export const addCategory = (category) => {
  const categories = getCategories()
  const newCategory = {
    ...category,
    id: Date.now().toString(),
  }

  // 同じtypeとdisplayGroupのカテゴリの最後に挿入
  const sameTypeAndGroup = categories.filter(cat =>
    cat.type === newCategory.type && cat.displayGroup === newCategory.displayGroup
  )

  if (sameTypeAndGroup.length === 0) {
    // 同じtypeとgroupがない場合は最後に追加
    categories.push(newCategory)
  } else {
    // 最後のアイテムの次の位置を見つける
    const lastItem = sameTypeAndGroup[sameTypeAndGroup.length - 1]
    const lastIndex = categories.findIndex(cat => cat.id === lastItem.id)
    categories.splice(lastIndex + 1, 0, newCategory)
  }

  saveCategories(categories)
  return newCategory
}

export const updateCategory = (categoryId, updates) => {
  const categories = getCategories()
  const index = categories.findIndex(cat => cat.id === categoryId)
  if (index !== -1) {
    const oldCategory = categories[index]
    const updatedCategory = { ...oldCategory, ...updates }

    // displayGroupが変更された場合は位置を変更
    if (updates.displayGroup && oldCategory.displayGroup !== updates.displayGroup) {
      // 元の位置から削除
      categories.splice(index, 1)

      // 新しいグループの最後に挿入
      const sameTypeAndGroup = categories.filter(cat =>
        cat.type === updatedCategory.type && cat.displayGroup === updatedCategory.displayGroup
      )

      if (sameTypeAndGroup.length === 0) {
        // 同じtypeとgroupがない場合は最後に追加
        categories.push(updatedCategory)
      } else {
        // 最後のアイテムの次の位置を見つける
        const lastItem = sameTypeAndGroup[sameTypeAndGroup.length - 1]
        const lastIndex = categories.findIndex(cat => cat.id === lastItem.id)
        categories.splice(lastIndex + 1, 0, updatedCategory)
      }
    } else {
      // displayGroupが変更されていない場合はその場で更新
      categories[index] = updatedCategory
    }

    saveCategories(categories)
    return true
  }
  return false
}

export const deleteCategory = (categoryId) => {
  const categories = getCategories()
  const filtered = categories.filter(cat => cat.id !== categoryId)
  saveCategories(filtered)
  return true
}

export const getMonthlyData = (yearMonth) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MONTHLY_DATA)
    const allData = stored ? JSON.parse(stored) : {}

    if (!allData[yearMonth]) {
      const categories = getCategories()
      allData[yearMonth] = categories.map(cat => ({
        categoryId: cat.id,
        amount: cat.defaultAmount || 0,
      }))
      localStorage.setItem(STORAGE_KEYS.MONTHLY_DATA, JSON.stringify(allData))
    } else {
      const categories = getCategories()
      const monthData = allData[yearMonth]

      const migrated = monthData.map(item => {
        if (item.amount === undefined && item.actual !== undefined) {
          return {
            categoryId: item.categoryId,
            amount: item.actual
          }
        }
        return item
      })

      categories.forEach(cat => {
        if (!migrated.find(item => item.categoryId === cat.id)) {
          migrated.push({
            categoryId: cat.id,
            amount: cat.defaultAmount || 0
          })
        }
      })

      if (JSON.stringify(monthData) !== JSON.stringify(migrated)) {
        allData[yearMonth] = migrated
        localStorage.setItem(STORAGE_KEYS.MONTHLY_DATA, JSON.stringify(allData))
      }

      return migrated
    }

    return allData[yearMonth]
  } catch (error) {
    console.error('Failed to get monthly data:', error)
    return []
  }
}

export const saveMonthlyData = (yearMonth, data) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MONTHLY_DATA)
    const allData = stored ? JSON.parse(stored) : {}
    allData[yearMonth] = data
    localStorage.setItem(STORAGE_KEYS.MONTHLY_DATA, JSON.stringify(allData))
    return true
  } catch (error) {
    console.error('Failed to save monthly data:', error)
    return false
  }
}

export const updateAmount = (yearMonth, categoryId, amount) => {
  const monthlyData = getMonthlyData(yearMonth)
  const index = monthlyData.findIndex(item => item.categoryId === categoryId)

  if (index !== -1) {
    monthlyData[index].amount = amount
  } else {
    monthlyData.push({ categoryId, amount })
  }

  return saveMonthlyData(yearMonth, monthlyData)
}

export const getCurrentYearMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export const formatYearMonth = (yearMonth) => {
  const [year, month] = yearMonth.split('-')
  return `${year}年${parseInt(month)}月`
}
