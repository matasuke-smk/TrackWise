import { useState } from 'react'
import { getMonthlyData, formatYearMonth } from '../utils/storage'
import { calculateSummary, formatNumber } from '../utils/calculations'
import './ReportModal.css'

function ReportModal({ categories, currentYearMonth, onClose }) {
  const [viewType, setViewType] = useState('year') // 'year' or 'months'

  const generateMonthlyReport = () => {
    const reports = []
    const [currentYear, currentMonth] = currentYearMonth.split('-').map(Number)

    // 過去12ヶ月のデータを生成
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`

      const monthlyData = getMonthlyData(yearMonth)
      const summary = calculateSummary(categories, monthlyData)

      reports.push({
        yearMonth,
        ...summary
      })
    }

    return reports
  }

  const generateYearlyReport = () => {
    const [currentYear] = currentYearMonth.split('-').map(Number)
    const reports = []

    // 現在の年と過去2年分（合計3年）
    for (let yearOffset = 2; yearOffset >= 0; yearOffset--) {
      const year = currentYear - yearOffset
      let yearIncome = 0
      let yearExpense = 0

      // その年の12ヶ月分を集計
      for (let month = 1; month <= 12; month++) {
        const yearMonth = `${year}-${String(month).padStart(2, '0')}`
        const monthlyData = getMonthlyData(yearMonth)
        const summary = calculateSummary(categories, monthlyData)

        yearIncome += summary.actualIncome
        yearExpense += summary.actualExpense
      }

      reports.push({
        year,
        income: yearIncome,
        expense: yearExpense,
        balance: yearIncome - yearExpense
      })
    }

    return reports
  }

  const monthlyReports = generateMonthlyReport()
  const yearlyReports = generateYearlyReport()

  // 月次の合計
  const monthlyTotal = monthlyReports.reduce((acc, report) => ({
    income: acc.income + report.actualIncome,
    expense: acc.expense + report.actualExpense,
    balance: acc.balance + report.actualBalance
  }), { income: 0, expense: 0, balance: 0 })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>収支一覧</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="report-tabs">
          <button
            className={`tab-button ${viewType === 'months' ? 'active' : ''}`}
            onClick={() => setViewType('months')}
          >
            月次一覧
          </button>
          <button
            className={`tab-button ${viewType === 'year' ? 'active' : ''}`}
            onClick={() => setViewType('year')}
          >
            年次一覧
          </button>
        </div>

        <div className="modal-body">
          {viewType === 'months' ? (
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>年月</th>
                    <th>収入</th>
                    <th>支出</th>
                    <th>残高</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReports.map((report) => (
                    <tr key={report.yearMonth} className={report.yearMonth === currentYearMonth ? 'current-month' : ''}>
                      <td>{formatYearMonth(report.yearMonth)}</td>
                      <td className="income">{formatNumber(report.actualIncome)}</td>
                      <td className="expense">{formatNumber(report.actualExpense)}</td>
                      <td className={report.actualBalance >= 0 ? 'positive' : 'negative'}>
                        {formatNumber(report.actualBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td>合計</td>
                    <td className="income">{formatNumber(monthlyTotal.income)}</td>
                    <td className="expense">{formatNumber(monthlyTotal.expense)}</td>
                    <td className={monthlyTotal.balance >= 0 ? 'positive' : 'negative'}>
                      {formatNumber(monthlyTotal.balance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>年</th>
                    <th>収入</th>
                    <th>支出</th>
                    <th>残高</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyReports.map((report) => (
                    <tr key={report.year}>
                      <td>{report.year}年</td>
                      <td className="income">{formatNumber(report.income)}</td>
                      <td className="expense">{formatNumber(report.expense)}</td>
                      <td className={report.balance >= 0 ? 'positive' : 'negative'}>
                        {formatNumber(report.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportModal
