'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [formData, setFormData] = useState({
    egg_price: '',
    hamburger_price: '',
    bacon_price: '',
    whole_milk_price: '',
    butter_price: '',
    bread_price: ''
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Validate all fields are filled
      if (!formData.egg_price || !formData.hamburger_price || !formData.bacon_price ||
          !formData.whole_milk_price || !formData.butter_price || !formData.bread_price) {
        throw new Error('All fields are required. Please fill in all prices.')
      }

      // Validate all fields are valid numbers
      const prices = [
        { name: 'Eggs', value: formData.egg_price },
        { name: 'Hamburger', value: formData.hamburger_price },
        { name: 'Bacon', value: formData.bacon_price },
        { name: 'Whole Milk', value: formData.whole_milk_price },
        { name: 'Butter', value: formData.butter_price },
        { name: 'Bread', value: formData.bread_price }
      ]

      for (const price of prices) {
        const numValue = parseFloat(price.value)
        if (isNaN(numValue)) {
          throw new Error(`${price.name} must be a valid number.`)
        }
        if (numValue < 0) {
          throw new Error(`${price.name} cannot be negative.`)
        }
      }

      const { data, error } = await supabase
        .from('commodities-inflation-tb')
        .insert([
          {
            egg_price: parseFloat(formData.egg_price),
            hamburger_price: parseFloat(formData.hamburger_price),
            bacon_price: parseFloat(formData.bacon_price),
            whole_milk_price: parseFloat(formData.whole_milk_price),
            butter_price: parseFloat(formData.butter_price),
            bread_price: parseFloat(formData.bread_price),
          }
        ])

      if (error) {
        throw error
      }

      setMessage('Data saved successfully!')
      setFormData({
        egg_price: '',
        hamburger_price: '',
        bacon_price: '',
        whole_milk_price: '',
        butter_price: '',
        bread_price: ''
      })
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-12 md:p-16">
          <div className="text-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">
              Price Changes Over Time
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-full max-w-md">
                <label htmlFor="egg_price" className="block text-sm font-bold text-cyan-400 mb-1">
                  Eggs
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="egg_price"
                    id="egg_price"
                    value={formData.egg_price}
                    onChange={handleChange}
                    className="w-full pl-6 pr-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-slate-500 text-center text-white text-base font-semibold placeholder-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="w-full max-w-md">
                <label htmlFor="hamburger_price" className="block text-sm font-bold text-cyan-400 mb-1">
                  Hamburger
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="hamburger_price"
                    id="hamburger_price"
                    value={formData.hamburger_price}
                    onChange={handleChange}
                    className="w-full pl-6 pr-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-slate-500 text-center text-white text-base font-semibold placeholder-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="w-full max-w-md">
                <label htmlFor="bacon_price" className="block text-sm font-bold text-cyan-400 mb-1">
                  Bacon
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="bacon_price"
                    id="bacon_price"
                    value={formData.bacon_price}
                    onChange={handleChange}
                    className="w-full pl-6 pr-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-slate-500 text-center text-white text-base font-semibold placeholder-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="w-full max-w-md">
                <label htmlFor="whole_milk_price" className="block text-sm font-bold text-cyan-400 mb-1">
                  Whole Milk
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="whole_milk_price"
                    id="whole_milk_price"
                    value={formData.whole_milk_price}
                    onChange={handleChange}
                    className="w-full pl-6 pr-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-slate-500 text-center text-white text-base font-semibold placeholder-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="w-full max-w-md">
                <label htmlFor="butter_price" className="block text-sm font-bold text-cyan-400 mb-1">
                  Butter
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="butter_price"
                    id="butter_price"
                    value={formData.butter_price}
                    onChange={handleChange}
                    className="w-full pl-6 pr-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-slate-500 text-center text-white text-base font-semibold placeholder-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="w-full max-w-md">
                <label htmlFor="bread_price" className="block text-sm font-bold text-cyan-400 mb-1">
                  Bread
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="bread_price"
                    id="bread_price"
                    value={formData.bread_price}
                    onChange={handleChange}
                    className="w-full pl-6 pr-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-slate-500 text-center text-white text-base font-semibold placeholder-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="max-w-md w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all shadow-lg"
              >
                {isLoading ? 'Saving...' : 'Save Prices'}
              </button>
            </div>

            {message && (
              <div className="flex justify-center">
                <div
                  className={`max-w-md w-full p-3 rounded-lg text-sm font-semibold ${
                    message.includes('Error')
                      ? 'bg-red-900/50 text-red-200 border-2 border-red-500'
                      : 'bg-green-900/50 text-green-200 border-2 border-green-500'
                  }`}
                >
                  {message}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
