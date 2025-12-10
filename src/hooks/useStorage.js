import { useState, useEffect, useCallback } from 'react'
import {
  getCategories,
  saveCategories,
  getMonthlyData,
  updateAmount,
  getCurrentYearMonth,
} from '../utils/storage'

export const useStorage = () => {
  const [categories, setCategories] = useState([])
  const [currentYearMonth, setCurrentYearMonth] = useState(getCurrentYearMonth())
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [currentYearMonth])

  const loadData = useCallback(() => {
    setLoading(true)
    try {
      const cats = getCategories()
      const data = getMonthlyData(currentYearMonth)
      setCategories(cats)
      setMonthlyData(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentYearMonth])

  const updateCategories = useCallback((newCategories) => {
    if (saveCategories(newCategories)) {
      setCategories(newCategories)
      return true
    }
    return false
  }, [])

  const setAmount = useCallback((categoryId, amount) => {
    if (updateAmount(currentYearMonth, categoryId, amount)) {
      loadData()
      return true
    }
    return false
  }, [currentYearMonth, loadData])

  const changeMonth = useCallback((yearMonth) => {
    setCurrentYearMonth(yearMonth)
  }, [])

  const nextMonth = useCallback(() => {
    const [year, month] = currentYearMonth.split('-').map(Number)
    const date = new Date(year, month, 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    setCurrentYearMonth(`${newYear}-${newMonth}`)
  }, [currentYearMonth])

  const prevMonth = useCallback(() => {
    const [year, month] = currentYearMonth.split('-').map(Number)
    const date = new Date(year, month - 2, 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    setCurrentYearMonth(`${newYear}-${newMonth}`)
  }, [currentYearMonth])

  return {
    categories,
    monthlyData,
    currentYearMonth,
    loading,
    updateCategories,
    setAmount,
    changeMonth,
    nextMonth,
    prevMonth,
    refresh: loadData,
  }
}
