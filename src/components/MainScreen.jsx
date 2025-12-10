import { useState } from 'react'
import { useStorage } from '../hooks/useStorage'
import { calculateSummary, formatCurrency, formatNumber } from '../utils/calculations'
import { formatYearMonth, getMonthlyData } from '../utils/storage'
import OthersModal from './OthersModal'
import ReportModal from './ReportModal'
import './MainScreen.css'

function MainScreen({ onNavigate }) {
  const {
    categories,
    monthlyData,
    currentYearMonth,
    setAmount,
    nextMonth,
    prevMonth,
  } = useStorage()

  const [showOthersModal, setShowOthersModal] = useState(null) // 'income' or 'expense' or null
  const [showReportModal, setShowReportModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const summary = calculateSummary(categories, monthlyData)

  const mainCategories = categories.filter(cat => cat.displayGroup === 'main')
  const othersCategories = categories.filter(cat => cat.displayGroup === 'others')

  const getCategoryData = (categoryId) => {
    return monthlyData.find(item => item.categoryId === categoryId) || { amount: 0 }
  }

  const othersIncome = othersCategories
    .filter(cat => cat.type === 'income')
    .reduce((sum, cat) => {
      const data = getCategoryData(cat.id)
      return sum + (data.amount || 0)
    }, 0)

  const othersExpense = othersCategories
    .filter(cat => cat.type === 'expense')
    .reduce((sum, cat) => {
      const data = getCategoryData(cat.id)
      return sum + (data.amount || 0)
    }, 0)

  const handleAmountClick = (categoryId, currentValue) => {
    setEditingCategory(categoryId)
    setEditValue(currentValue.toString())
  }

  const handleAmountSave = (categoryId) => {
    const amount = parseInt(editValue) || 0
    setAmount(categoryId, amount)
    setEditingCategory(null)
    setEditValue('')
  }

  const handleActualCancel = () => {
    setEditingCategory(null)
    setEditValue('')
  }

  // スワイプの最小距離
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextMonth()
    }
    if (isRightSwipe) {
      prevMonth()
    }
  }

  const renderCategoryRow = (category) => {
    const data = getCategoryData(category.id)
    const isEditing = editingCategory === category.id

    return (
      <div key={category.id} className="category-row">
        <div className="category-name">{category.name}</div>
        {isEditing ? (
          <input
            type="number"
            className="amount-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleAmountSave(category.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAmountSave(category.id)
              if (e.key === 'Escape') handleActualCancel()
            }}
            autoFocus
          />
        ) : (
          <div
            className="amount-value"
            onClick={() => handleAmountClick(category.id, data.amount)}
          >
            {formatNumber(data.amount)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="main-screen">
      <header className="header">
        <button className="report-button" onClick={() => setShowReportModal(true)}>
          📊 一覧
        </button>
        <button className="settings-button" onClick={() => onNavigate('settings')}>
          ⚙️ 設定
        </button>
      </header>

      <div
        className="summary-section"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="month-selector">
          <button onClick={prevMonth}>◀</button>
          <span>{formatYearMonth(currentYearMonth)}</span>
          <button onClick={nextMonth}>▶</button>
        </div>
        <div className="summary-card">
          <div className="summary-row balance">
            <span className="label">{summary.actualBalance >= 0 ? '残高' : '不足'}</span>
            <span className={`value ${summary.actualBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatNumber(summary.actualBalance)}
            </span>
          </div>
        </div>
      </div>

      <div className="categories-section">
        <div className="categories-grid">
          <div className="category-column">
            <div className="column-header income">
              <span className="header-label">収入</span>
              <span className="header-value">{formatNumber(summary.actualIncome)}</span>
            </div>
            <div className="categories-list">
              {mainCategories.filter(cat => cat.type === 'income').map(renderCategoryRow)}
            </div>
            {othersCategories.filter(cat => cat.type === 'income').length > 0 && (
              <button
                className="others-button income"
                onClick={() => setShowOthersModal('income')}
              >
                <span className="others-label">その他</span>
                <span className="others-value">{formatNumber(othersIncome)}</span>
              </button>
            )}
          </div>
          <div className="category-column">
            <div className="column-header expense">
              <span className="header-label">支出</span>
              <span className="header-value">{formatNumber(summary.actualExpense)}</span>
            </div>
            <div className="categories-list">
              {mainCategories.filter(cat => cat.type === 'expense').map(renderCategoryRow)}
            </div>
            {othersCategories.filter(cat => cat.type === 'expense').length > 0 && (
              <button
                className="others-button expense"
                onClick={() => setShowOthersModal('expense')}
              >
                <span className="others-label">その他</span>
                <span className="others-value">{formatNumber(othersExpense)}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showOthersModal && (
        <OthersModal
          categories={othersCategories.filter(cat => cat.type === showOthersModal)}
          monthlyData={monthlyData}
          onClose={() => setShowOthersModal(null)}
          onUpdateAmount={setAmount}
          type={showOthersModal}
        />
      )}

      {showReportModal && (
        <ReportModal
          categories={categories}
          currentYearMonth={currentYearMonth}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}

export default MainScreen
