import { useState, useEffect } from 'react'
import { useStorage } from '../hooks/useStorage'
import { formatYearMonth } from '../utils/storage'
import './BudgetInput.css'

function BudgetInput({ onNavigate }) {
  const {
    categories,
    monthlyData,
    currentYearMonth,
    setAmount,
  } = useStorage()

  const [values, setValues] = useState({})

  useEffect(() => {
    const initialValues = {}
    categories.forEach(category => {
      const data = monthlyData.find(item => item.categoryId === category.id)
      initialValues[category.id] = data?.amount || 0
    })
    setValues(initialValues)
  }, [categories, monthlyData])

  const handleChange = (categoryId, value) => {
    setValues(prev => ({
      ...prev,
      [categoryId]: value === '' ? '' : parseInt(value) || 0
    }))
  }

  const handleSaveAll = () => {
    categories.forEach(category => {
      const amount = parseInt(values[category.id]) || 0
      setAmount(category.id, amount)
    })
    onNavigate('main')
  }

  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  const renderCategoryInput = (category) => (
    <div key={category.id} className="input-row">
      <label htmlFor={`input-${category.id}`}>{category.name}</label>
      <div className="input-wrapper">
        <input
          id={`input-${category.id}`}
          type="number"
          value={values[category.id] || ''}
          onChange={(e) => handleChange(category.id, e.target.value)}
          placeholder="0"
        />
        <span className="currency">円</span>
      </div>
    </div>
  )

  return (
    <div className="budget-input-screen">
      <header className="header">
        <button className="back-button" onClick={() => onNavigate('main')}>
          ← 戻る
        </button>
        <h1>{formatYearMonth(currentYearMonth)}の一括入力</h1>
        <div style={{ width: '60px' }}></div>
      </header>

      <div className="input-content">
        {incomeCategories.length > 0 && (
          <section className="input-section">
            <h2 className="section-title income">収入</h2>
            {incomeCategories.map(renderCategoryInput)}
          </section>
        )}

        {expenseCategories.length > 0 && (
          <section className="input-section">
            <h2 className="section-title expense">支出</h2>
            {expenseCategories.map(renderCategoryInput)}
          </section>
        )}
      </div>

      <div className="actions">
        <button className="save-button" onClick={handleSaveAll}>
          保存してメイン画面へ
        </button>
      </div>
    </div>
  )
}

export default BudgetInput
