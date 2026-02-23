import { useState, useEffect } from 'react'
import './App.css'
import * as api from './api'

const DEFAULT_6_MONTH_GOALS = [
  '60 KG',
  '5 Project',
  '50 LPA',
  '1 Funding',
  '50K follower LinkedIn',
]

const MONTH_ITEMS_BY_MONTH = {
  feb: [
    'Daily Dsa ( Striver )',
    '1 Hackathon',
    '1 Agent + Marketing',
    '5 Approach pointer',
    'Optimize Naukri and Linkdin ( Personal)',
    'Portfolio',
    'One shot video (M, ML, Pa/Mp)',
  ],
  mar: ['One shot video (M, ML, Pa/Mp)', '', '', '', '', ''],
  apr: ['', '', '', '', '', ''],
  may: ['', '', '', '', '', ''],
  jun: ['', '', '', '', '', ''],
  jul: ['', '', '', '', '', ''],
}

const MONTH_BOXES = [
  { id: 'feb', title: 'February', icon: '◇' },
  { id: 'mar', title: 'March', icon: '◆' },
  { id: 'apr', title: 'April', icon: '○' },
  { id: 'may', title: 'May', icon: '△' },
  { id: 'jun', title: 'June', icon: '▣' },
  { id: 'jul', title: 'July', icon: '◇' },
]

const YEAR = 2026
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function applyApiData(data, setters) {
  if (data.sixMonthGoals?.length) {
    const goals = [...data.sixMonthGoals]
    while (goals.length < 5) goals.push('')
    setters.setSixMonthGoals(goals.slice(0, 5))
  }
  if (data.sixMonthChecks) setters.setSixMonthChecks(data.sixMonthChecks)
  if (data.monthlyChecks) setters.setMonthlyChecks(data.monthlyChecks)
  if (data.dateChecks) setters.setDateChecks(data.dateChecks)
}

function App() {
  const [sixMonthGoals, setSixMonthGoals] = useState(DEFAULT_6_MONTH_GOALS)
  const [sixMonthChecks, setSixMonthChecks] = useState({})
  const [monthlyChecks, setMonthlyChecks] = useState({})
  const [dateChecks, setDateChecks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const setters = {
    setSixMonthGoals,
    setSixMonthChecks,
    setMonthlyChecks,
    setDateChecks,
  }

  useEffect(() => {
    api
      .getData()
      .then((data) => applyApiData(data, setters))
      .catch((err) => setError(err.message || 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const updateSixMonthGoal = async (index, text) => {
    try {
      setError(null)
      const data = await api.updateGoalText(index, text)
      applyApiData(data, setters)
    } catch (err) {
      setError(err.message || 'Failed to update goal')
    }
  }

  const toggleSixMonthCheck = async (index) => {
    const next = !sixMonthChecks[index]
    try {
      setError(null)
      const data = await api.updateGoalCheck(index, next)
      applyApiData(data, setters)
    } catch (err) {
      setError(err.message || 'Failed to update checkbox')
    }
  }

  const toggleMonthly = async (monthId, itemIndex) => {
    const next = !(monthlyChecks[monthId]?.[itemIndex])
    try {
      setError(null)
      const data = await api.updateMonthlyCheck(monthId, itemIndex, next)
      applyApiData(data, setters)
    } catch (err) {
      setError(err.message || 'Failed to update monthly checkbox')
    }
  }

  const toggleDateCheck = async (monthId, day) => {
    const next = !(dateChecks[monthId]?.[day])
    try {
      setError(null)
      const data = await api.updateDailyCheck(monthId, day, next)
      applyApiData(data, setters)
    } catch (err) {
      setError(err.message || 'Failed to update daily checkbox')
    }
  }

  const getCalendarDays = (monthId) => {
    const idx = MONTH_BOXES.findIndex((m) => m.id === monthId)
    const month = idx + 1
    const firstDay = new Date(YEAR, month, 1)
    const lastDay = new Date(YEAR, month + 1, 0)
    const startPad = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const cells = []
    for (let i = 0; i < startPad; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }

  if (loading) {
    return (
      <div className="tracker">
        <header className="tracker-header">
          <h1>Personal Tracker</h1>
          <p className="tracker-subtitle">Loading…</p>
        </header>
      </div>
    )
  }

  return (
    <div className="tracker">
      <header className="tracker-header">
        <h1>Personal Tracker</h1>
        <p className="tracker-subtitle">6 month plan · February – July</p>
        {error && <p className="tracker-error">{error}</p>}
      </header>

      <section className="section section--6month">
        <h2 className="section-title">6 Month Plan</h2>
        <div className="tracker-window tracker-window--big">
          {sixMonthGoals.map((goal, i) => (
            <div key={i} className={`plan-box plan-box--${i}`}>
              <label className="plan-box-label">
                <input
                  type="checkbox"
                  checked={!!sixMonthChecks[i]}
                  onChange={() => toggleSixMonthCheck(i)}
                />
                <span className="checkmark checkmark--big" />
                <span
                  className="plan-box-content"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateSixMonthGoal(i, e.currentTarget.textContent)}
                >
                  {goal}
                </span>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--monthly">
        <h2 className="section-title">Monthly Plans</h2>
        <div className="tracker-window tracker-window--months">
          {MONTH_BOXES.map((box) => (
            <div key={box.id} className={`tracker-box tracker-box--${box.id}`}>
              <div className="tracker-box-header">
                <span className="tracker-box-icon">{box.icon}</span>
                <h3>{box.title}</h3>
              </div>
              <ul className="tracker-list">
                {(MONTH_ITEMS_BY_MONTH[box.id] ?? [])
                  .map((item, i) => ({ item, i }))
                  .filter(({ item }) => item !== '')
                  .map(({ item, i }) => (
                    <li key={i} className="tracker-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={!!(monthlyChecks[box.id]?.[i])}
                          onChange={() => toggleMonthly(box.id, i)}
                        />
                        <span className="checkmark" />
                        <span className="tracker-item-text">{item}</span>
                      </label>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--calendar">
        <h2 className="section-title">Daily Tracker</h2>
        <div className="calendar-row">
          {MONTH_BOXES.map((m) => (
            <div key={m.id} className="calendar-mini">
              <h4 className="calendar-mini-title">{m.title}</h4>
              <div className="calendar-mini-header">
                {DAY_NAMES.map((d, i) => (
                  <span key={i} className="calendar-mini-day-name">{d}</span>
                ))}
              </div>
              <div className="calendar-mini-grid">
                {getCalendarDays(m.id).map((day, i) => (
                  <div key={i} className={`calendar-mini-cell ${day ? '' : 'calendar-mini-cell--empty'}`}>
                    {day ? (
                      <label className="calendar-mini-label">
                        <input
                          type="checkbox"
                          checked={!!(dateChecks[m.id]?.[day])}
                          onChange={() => toggleDateCheck(m.id, day)}
                        />
                        <span className="checkmark checkmark--calendar-mini" />
                        <span className="calendar-mini-num">{day}</span>
                      </label>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
