import { useState } from 'react'
import { useStorage } from '../hooks/useStorage'
import { addCategory, updateCategory, deleteCategory } from '../utils/storage'
import './CategorySettings.css'

function CategorySettings({ onNavigate }) {
  const { categories, updateCategories, refresh, currentYearMonth, monthlyData } = useStorage()
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showMonthSelectModal, setShowMonthSelectModal] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState([])
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverItem, setDragOverItem] = useState(null)
  const [newIncome, setNewIncome] = useState({
    name: '',
    displayGroup: 'main',
    defaultAmount: ''
  })
  const [newExpense, setNewExpense] = useState({
    name: '',
    displayGroup: 'main',
    defaultAmount: ''
  })

  const handleApplyDefaults = () => {
    setShowMonthSelectModal(true)
  }

  const handleConfirmApplyDefaults = () => {
    if (selectedMonths.length === 0) {
      alert('月を選択してください')
      return
    }

    const { saveMonthlyData } = require('../utils/storage')
    const newData = categories.map(cat => ({
      categoryId: cat.id,
      amount: cat.defaultAmount || 0
    }))

    selectedMonths.forEach(yearMonth => {
      saveMonthlyData(yearMonth, newData)
    })

    setShowMonthSelectModal(false)
    setSelectedMonths([])
    refresh()
  }

  const generateMonthList = () => {
    const months = []
    const [currentYear, currentMonth] = currentYearMonth.split('-').map(Number)

    for (let i = 0; i <= 12; i++) {
      const date = new Date(currentYear, currentMonth - 1 + i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`
      months.push(yearMonth)
    }

    return months
  }

  const toggleMonth = (yearMonth) => {
    if (selectedMonths.includes(yearMonth)) {
      setSelectedMonths(selectedMonths.filter(m => m !== yearMonth))
    } else {
      setSelectedMonths([...selectedMonths, yearMonth])
    }
  }

  const formatMonthLabel = (yearMonth) => {
    const [year, month] = yearMonth.split('-')
    return `${year}年${parseInt(month)}月`
  }

  const handleUpdateName = (categoryId, name) => {
    updateCategory(categoryId, { name })
    refresh()
  }

  const handleUpdateDefaultAmount = (categoryId, amount) => {
    updateCategory(categoryId, { defaultAmount: amount })
    refresh()
  }

  const handleDelete = (categoryId) => {
    if (window.confirm('このカテゴリを削除してもよろしいですか？')) {
      deleteCategory(categoryId)
      refresh()
    }
  }

  const handleAddIncome = () => {
    if (newIncome.name.trim()) {
      addCategory({ ...newIncome, type: 'income', defaultAmount: newIncome.defaultAmount === '' ? 0 : newIncome.defaultAmount })
      setNewIncome({
        name: '',
        displayGroup: 'main',
        defaultAmount: ''
      })
      setShowAddIncome(false)
      refresh()
    }
  }

  const handleAddExpense = () => {
    if (newExpense.name.trim()) {
      addCategory({ ...newExpense, type: 'expense', defaultAmount: newExpense.defaultAmount === '' ? 0 : newExpense.defaultAmount })
      setNewExpense({
        name: '',
        displayGroup: 'main',
        defaultAmount: ''
      })
      setShowAddExpense(false)
      refresh()
    }
  }

  const handleCancelAddIncome = () => {
    setNewIncome({
      name: '',
      displayGroup: 'main',
      defaultAmount: ''
    })
    setShowAddIncome(false)
  }

  const handleCancelAddExpense = () => {
    setNewExpense({
      name: '',
      displayGroup: 'main',
      defaultAmount: ''
    })
    setShowAddExpense(false)
  }

  const handleToggleDisplayGroup = (category) => {
    const newGroup = category.displayGroup === 'main' ? 'others' : 'main'
    updateCategory(category.id, { displayGroup: newGroup })
    refresh()
  }

  const renderCategory = (category) => {
    const isDragging = draggedItem?.id === category.id
    const isDragOver = dragOverItem?.id === category.id

    return (
      <div
        key={category.id}
        className={`category-item ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, category)}
        onDragOver={(e) => handleDragOver(e, category)}
        onDrop={(e) => handleDrop(e, category)}
        onDragEnd={handleDragEnd}
      >
        <div className="drag-handle" title="ドラッグして並び替え">
          ☰
        </div>
        <div className="category-info">
          <input
            type="text"
            className="category-name-input"
            value={category.name}
            onChange={(e) => handleUpdateName(category.id, e.target.value)}
            placeholder="カテゴリ名"
          />
          <div className="default-amount-wrapper">
            <input
              type="number"
              className="default-amount-input"
              value={category.defaultAmount === 0 ? '' : category.defaultAmount}
              onChange={(e) => handleUpdateDefaultAmount(category.id, e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
              placeholder="金額"
            />
            <span className="currency">円</span>
          </div>
          <button
            className="group-toggle-btn"
            onClick={() => handleToggleDisplayGroup(category)}
          >
            {category.displayGroup === 'main' ? 'メイン' : 'その他'}
          </button>
        </div>
        <div className="category-actions">
          <button className="delete-btn" onClick={() => handleDelete(category.id)}>削除</button>
        </div>
      </div>
    )
  }

  const sortCategoriesByGroup = (cats) => {
    const main = cats.filter(cat => cat.displayGroup === 'main')
    const others = cats.filter(cat => cat.displayGroup === 'others')
    return [...main, ...others]
  }

  const incomeCategories = sortCategoriesByGroup(categories.filter(cat => cat.type === 'income'))
  const expenseCategories = sortCategoriesByGroup(categories.filter(cat => cat.type === 'expense'))

  const handleDragStart = (e, category) => {
    setDraggedItem(category)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, category) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedItem && category.id !== draggedItem.id &&
        category.type === draggedItem.type &&
        category.displayGroup === draggedItem.displayGroup) {
      setDragOverItem(category)
    }
  }

  const handleDrop = (e, targetCategory) => {
    e.preventDefault()

    if (!draggedItem || draggedItem.id === targetCategory.id ||
        draggedItem.type !== targetCategory.type ||
        draggedItem.displayGroup !== targetCategory.displayGroup) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const newCategories = [...categories]
    const draggedIndex = newCategories.findIndex(cat => cat.id === draggedItem.id)
    const targetIndex = newCategories.findIndex(cat => cat.id === targetCategory.id)

    const [removed] = newCategories.splice(draggedIndex, 1)
    newCategories.splice(targetIndex, 0, removed)

    updateCategories(newCategories)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  return (
    <div className="category-settings-screen">
      <header className="header">
        <button className="back-button" onClick={() => onNavigate('main')}>
          ← 戻る
        </button>
        <h1>カテゴリ管理</h1>
        <button className="apply-defaults-btn" onClick={handleApplyDefaults}>
          デフォルト値を反映
        </button>
      </header>

      <div className="settings-content">
        <div className="category-section">
          <h2 className="section-title income">収入</h2>
          <div className="categories-list">
            {incomeCategories.map(renderCategory)}
            {showAddIncome && (
              <div className="category-item add-item">
                <div className="drag-handle-placeholder">
                  <button className="cancel-btn" onClick={handleCancelAddIncome}>×</button>
                </div>
                <div className="category-info">
                  <input
                    type="text"
                    className="category-name-input"
                    value={newIncome.name}
                    onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                    placeholder="カテゴリ名"
                    autoFocus
                  />
                  <div className="default-amount-wrapper">
                    <input
                      type="number"
                      className="default-amount-input"
                      value={newIncome.defaultAmount}
                      onChange={(e) => setNewIncome({ ...newIncome, defaultAmount: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                      placeholder="金額"
                    />
                    <span className="currency">円</span>
                  </div>
                  <button
                    className="group-toggle-btn"
                    onClick={() => setNewIncome({ ...newIncome, displayGroup: newIncome.displayGroup === 'main' ? 'others' : 'main' })}
                  >
                    {newIncome.displayGroup === 'main' ? 'メイン' : 'その他'}
                  </button>
                </div>
                <div className="category-actions">
                  <button className="add-btn" onClick={handleAddIncome}>追加</button>
                </div>
              </div>
            )}
          </div>
          {!showAddIncome && (
            <button className="show-add-btn" onClick={() => setShowAddIncome(true)}>
              + 追加
            </button>
          )}
        </div>

        <div className="category-section">
          <h2 className="section-title expense">支出</h2>
          <div className="categories-list">
            {expenseCategories.map(renderCategory)}
            {showAddExpense && (
              <div className="category-item add-item">
                <div className="drag-handle-placeholder">
                  <button className="cancel-btn" onClick={handleCancelAddExpense}>×</button>
                </div>
                <div className="category-info">
                  <input
                    type="text"
                    className="category-name-input"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    placeholder="カテゴリ名"
                    autoFocus
                  />
                  <div className="default-amount-wrapper">
                    <input
                      type="number"
                      className="default-amount-input"
                      value={newExpense.defaultAmount}
                      onChange={(e) => setNewExpense({ ...newExpense, defaultAmount: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                      placeholder="金額"
                    />
                    <span className="currency">円</span>
                  </div>
                  <button
                    className="group-toggle-btn"
                    onClick={() => setNewExpense({ ...newExpense, displayGroup: newExpense.displayGroup === 'main' ? 'others' : 'main' })}
                  >
                    {newExpense.displayGroup === 'main' ? 'メイン' : 'その他'}
                  </button>
                </div>
                <div className="category-actions">
                  <button className="add-btn" onClick={handleAddExpense}>追加</button>
                </div>
              </div>
            )}
          </div>
          {!showAddExpense && (
            <button className="show-add-btn" onClick={() => setShowAddExpense(true)}>
              + 追加
            </button>
          )}
        </div>
      </div>

      {showMonthSelectModal && (
        <div className="modal-overlay" onClick={() => setShowMonthSelectModal(false)}>
          <div className="modal-content month-select-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>デフォルト値を反映する月を選択</h2>
              <button className="close-button" onClick={() => setShowMonthSelectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="month-grid">
                {generateMonthList().map(yearMonth => (
                  <button
                    key={yearMonth}
                    className={`month-option ${selectedMonths.includes(yearMonth) ? 'selected' : ''}`}
                    onClick={() => toggleMonth(yearMonth)}
                  >
                    {formatMonthLabel(yearMonth)}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-modal-btn" onClick={() => {
                setShowMonthSelectModal(false)
                setSelectedMonths([])
              }}>
                キャンセル
              </button>
              <button className="confirm-btn" onClick={handleConfirmApplyDefaults}>
                反映する ({selectedMonths.length}月選択中)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategorySettings
