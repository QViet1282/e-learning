/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/*
   ========================================================================== */
import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Tick
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { getUserMonthlyProgress } from '../../api/post/post.api'
import { useTranslation } from 'react-i18next'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend)

interface MonthlyProgress {
  completionDate: string
  completedLessons: number
  completedExams: number
}

const MonthlyProgressChart: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const fetchMonthlyProgress = async () => {
      try {
        const response = await getUserMonthlyProgress(selectedMonth, selectedYear)
        setMonthlyProgress(response.data.monthlyProgress)
      } catch (err) {
        console.error('Error fetching monthly progress:', err)
      }
    }

    fetchMonthlyProgress()
  }, [selectedMonth, selectedYear])

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const dates = Array.from({ length: daysInMonth }, (_, i) =>
       `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
  )

  const lessonsData = dates.map(
    (date) => monthlyProgress.find((entry) => entry.completionDate === date)?.completedLessons || 0
  )
  const examsData = dates.map(
    (date) => monthlyProgress.find((entry) => entry.completionDate === date)?.completedExams || 0
  )

  const chartData = {
    labels: dates,
    datasets: [
      {
        type: 'bar' as const,
        label: t('monthlyProgressChart.completedLessons'),
        data: lessonsData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        type: 'line' as const,
        label: t('monthlyProgressChart.completedExams'),
        data: examsData,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxTicksLimit: daysInMonth
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number, index: number, ticks: Tick[]) {
            const numericValue = typeof value === 'string' ? parseFloat(value) : value
            if (Number.isInteger(numericValue)) {
              return numericValue
            }
            return null
          }
        }
      }
    }
  }

  return (
       <div className="bg-white shadow p-6 rounded-lg">
         <h3 className="text-lg font-semibold mb-4">{t('monthlyProgressChart.monthlyProgress')}</h3>
         <div className="flex items-center mb-4">
           <select
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
             className="border rounded-lg p-2 mr-4"
           >
             {Array.from({ length: 12 }, (_, i) => (
               <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString(i18n.language, { month: 'long' })}
               </option>
             ))}
           </select>
           <select
             value={selectedYear}
             onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
             className="border rounded-lg p-2"
           >
             {Array.from({ length: 5 }, (_, i) => (
               <option key={i} value={new Date().getFullYear() - i}>
                 {new Date().getFullYear() - i}
               </option>
             ))}
           </select>
         </div>
         <div className="chart-container w-full" style={{ minHeight: '200px' }}>
           <Chart type="bar" data={chartData} options={chartOptions} />
         </div>
       </div>
  )
}

export default MonthlyProgressChart
