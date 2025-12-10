import { useState } from 'react'
import { formatNumber } from '../utils/calculations'
import './OthersModal.css'

function OthersModal({ categories, monthlyData, onClose, onUpdateAmount, type }) {
  const [editingCategory, setEditingCategory] = useState(null)
  const [editValue, setEditValue] = useState('')

  const getCategoryData = (categoryId) => {
    return monthlyData.find(item => item.categoryId === categoryId) || { amount: 0 }
  }

  const handleAmountClick = (categoryId, currentValue) => {
    setEditingCategory(categoryId)
    setEditValue(currentValue.toString())
  }

  const handleAmountSave = (categoryId) => {
    const amount = parseInt(editValue) || 0
    onUpdateAmount(categoryId, amount)
    setEditingCategory(null)
    setEditValue('')
  }

  const handleAmountCancel = () => {
    setEditingCategory(null)
    setEditValue('')
  }

  const title = type === 'income' ? 'その他の収入' : 'その他の支出'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {categories.map((category) => {
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
                      if (e.key === 'Escape') handleAmountCancel()
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
          })}
        </div>
      </div>
    </div>
  )
}

export default OthersModal
