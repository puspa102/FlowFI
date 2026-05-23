import prisma from '../config/prisma'
import { ensureDemoData } from './demoDataService'

export async function getInsights(userId: number) {
  await ensureDemoData(userId)

  const insights = await prisma.insight.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return insights.map((insight) => ({
    id: insight.id,
    title: insight.title,
    body: insight.body,
    ctaLabel: insight.ctaLabel,
    ctaHref: insight.ctaHref,
    createdAt: insight.createdAt,
  }))
}

export function suggestCategory(description: string): string {
  const desc = description.toLowerCase()
  if (desc.includes('uber') || desc.includes('lyft') || desc.includes('taxi') || desc.includes('grab') || desc.includes('transport') || desc.includes('flight') || desc.includes('airlines') || desc.includes('bus')) {
    return 'Transport & Travel'
  }
  if (desc.includes('food') || desc.includes('dine') || desc.includes('dining') || desc.includes('restaurant') || desc.includes('mcdonald') || desc.includes('whole foods') || desc.includes('starbucks') || desc.includes('grocery') || desc.includes('groceries') || desc.includes('pizza') || desc.includes('burger')) {
    return 'Food & Groceries'
  }
  if (desc.includes('netflix') || desc.includes('hulu') || desc.includes('spotify') || desc.includes('disney') || desc.includes('hbo') || desc.includes('gym') || desc.includes('fitness') || desc.includes('club') || desc.includes('movie') || desc.includes('theatre') || desc.includes('steam') || desc.includes('game') || desc.includes('playstation') || desc.includes('xbox')) {
    return 'Entertainment & Fun'
  }
  if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('utility') || desc.includes('utilities') || desc.includes('electricity') || desc.includes('water') || desc.includes('internet') || desc.includes('wifi') || desc.includes('gas')) {
    return 'Rent & Mortgage'
  }
  if (desc.includes('invest') || desc.includes('vanguard') || desc.includes('fidelity') || desc.includes('dividend') || desc.includes('stock') || desc.includes('crypto') || desc.includes('wealth') || desc.includes('trading')) {
    return 'Investments'
  }
  if (desc.includes('apple') || desc.includes('amazon') || desc.includes('shopping') || desc.includes('store') || desc.includes('shop') || desc.includes('target') || desc.includes('walmart') || desc.includes('nike') || desc.includes('clothing') || desc.includes('shoes')) {
    return 'Shopping & Lifestyle'
  }
  if (desc.includes('ai') || desc.includes('neural') || desc.includes('openai') || desc.includes('claude') || desc.includes('chatgpt') || desc.includes('midjourney')) {
    return 'AI Insights'
  }
  return 'Other'
}

export async function getAiPredictions(userId: number) {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // 1. Expense Predictions (Forecasting)
  const budgets = await prisma.budget.findMany({
    where: { userId, month: thisMonthStart },
    include: { category: true }
  })
  
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const elapsedDays = Math.max(1, now.getDate())
  
  const expensePredictions = budgets.map(b => {
    const currentSpent = Number(b.spentAmount)
    const limit = Number(b.limitAmount)
    const predictedSpent = Math.round((currentSpent / elapsedDays) * daysInMonth * 100) / 100
    const paceFactor = limit > 0 ? predictedSpent / limit : 0
    
    let alert = 'ON_TRACK'
    let message = `You are on pace to spend ${Math.round(paceFactor * 100)}% of your limit.`
    if (paceFactor > 1.1) {
      alert = 'OVERSPEND_ALERT'
      message = `CRITICAL: You are on pace to overspend by ${Math.round((paceFactor - 1) * 100)}% (Projected: $${predictedSpent.toLocaleString()} vs Limit: $${limit.toLocaleString()}).`
    } else if (paceFactor > 0.9) {
      alert = 'WARNING'
      message = `CAUTION: You are on pace to reach your limit (Projected: $${predictedSpent.toLocaleString()} vs Limit: $${limit.toLocaleString()}).`
    }
    
    return {
      categoryId: b.categoryId,
      categoryName: b.category.name,
      limit,
      currentSpent,
      predictedSpent,
      alert,
      message
    }
  })
  
  // 2. Spending Insights
  const allTxs = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' }
  })
  
  let weekendSpend = 0
  let weekendCount = 0
  let weekdaySpend = 0
  let weekdayCount = 0
  
  for (const tx of allTxs) {
    if (tx.type !== 'EXPENSE') continue
    const day = new Date(tx.occurredAt).getDay()
    const amt = Number(tx.amount)
    if (day === 0 || day === 6) { // Saturday/Sunday
      weekendSpend += amt
      weekendCount++
    } else {
      weekdaySpend += amt
      weekdayCount++
    }
  }
  
  const avgWeekend = weekendCount > 0 ? weekendSpend / weekendCount : 0
  const avgWeekday = weekdayCount > 0 ? weekdaySpend / weekdayCount : 0
  const weekendPaceDiff = avgWeekday > 0 ? Math.round(((avgWeekend - avgWeekday) / avgWeekday) * 100) : 0
  
  const spendingInsights = []
  if (weekendPaceDiff > 10) {
    spendingInsights.push({
      type: 'weekend_pattern',
      title: 'Weekend Spend Spike',
      body: `You spend ${weekendPaceDiff}% more on weekends compared to weekdays. Average weekend day spend is $${avgWeekend.toFixed(2)} vs $${avgWeekday.toFixed(2)} on weekdays.`,
      severity: 'medium'
    })
  } else {
    spendingInsights.push({
      type: 'weekend_pattern',
      title: 'Weekend Spend is Stable',
      body: `Your weekend spend is healthy, averaging $${avgWeekend.toFixed(2)} which matches your weekday pace ($${avgWeekday.toFixed(2)}).`,
      severity: 'low'
    })
  }
  
  // Subscription scans
  const subs = allTxs.filter(tx => 
    tx.type === 'EXPENSE' && 
    (tx.description.toLowerCase().includes('subscription') || 
     tx.description.toLowerCase().includes('netflix') || 
     tx.description.toLowerCase().includes('hulu') || 
     tx.description.toLowerCase().includes('spotify') ||
     tx.description.toLowerCase().includes('disney'))
  )
  const subSum = subs.reduce((sum, tx) => sum + Number(tx.amount), 0)
  
  if (subs.length > 0) {
    spendingInsights.push({
      type: 'subscription_growth',
      title: 'Active Subscription Count',
      body: `You have ${subs.length} recurring subscription payments totaling $${subSum.toFixed(2)} detected in your ledger.`,
      severity: subSum > 100 ? 'medium' : 'low'
    })
  }
  
  // 3. Anomaly Detection
  const anomalies = []
  const categoriesList = Array.from(new Set(allTxs.map(t => t.category)))
  
  for (const cat of categoriesList) {
    const catTxs = allTxs.filter(t => t.category === cat && t.type === 'EXPENSE')
    if (catTxs.length < 3) continue
    
    const avgCatAmount = catTxs.reduce((sum, t) => sum + Number(t.amount), 0) / catTxs.length
    
    for (const tx of catTxs) {
      const amt = Number(tx.amount)
      if (amt > avgCatAmount * 2.2 && amt > 100) {
        anomalies.push({
          id: tx.id,
          description: tx.description,
          category: tx.category,
          amount: amt,
          average: Math.round(avgCatAmount * 100) / 100,
          date: tx.occurredAt,
          message: `Anomaly flagged: Your payment of $${amt.toFixed(2)} at ${tx.description} is over 2x your average spend ($${avgCatAmount.toFixed(2)}) in ${tx.category.toLowerCase().replace('_', ' ')}.`
        })
      }
    }
  }
  
  // 4. Saving Recommendations
  const savingRecommendations = []
  if (subSum > 30) {
    savingRecommendations.push({
      title: 'Consolidate Streaming & Software Accounts',
      body: `We detected subscriptions totaling $${subSum.toFixed(2)}/mo. Cancelling Netflix or Hulu could save you $26.00/mo ($312/year).`,
      savings: 26.00
    })
  }
  if (weekendPaceDiff > 25) {
    savingRecommendations.push({
      title: 'Establish Weekend Dining Budgets',
      body: `Weekend expenses are ${weekendPaceDiff}% higher. Swapping one weekend dinner delivery for home cooking saves $80.00/mo.`,
      savings: 80.00
    })
  }
  if (savingRecommendations.length === 0) {
    savingRecommendations.push({
      title: 'Automate Sweep to Wealth Reserve',
      body: `You are well within your monthly budget limits. Set up a recurring sweep to auto-transfer leftover cash into high-yield Wealth Reserve!`,
      savings: 150.00
    })
  }
  
  return {
    expensePredictions,
    spendingInsights,
    anomalies,
    savingRecommendations
  }
}

export async function aiChat(userId: number, message: string) {
  const responses: { [key: string]: string } = {
    spending: `Certainly! Your overall spending is down 4% compared to last month. The largest reduction was in the "Dining" category, while "Subscriptions" saw a slight increase.

Your spending breakdown:
- Rent & Housing: $3,200 (60% of expenses)
- Dining & Groceries: $1,450 (27% of expenses)  
- Investment Contributions: $5,000 (94% of monthly income)

I recommend maintaining this spending pattern for Q4.`,
    
    budget: `Your current budget allocation is well-balanced. Here are my recommendations:

Current Status:
- Food & Groceries: 92% used ($740/$800)
- Rent & Mortgage: 100% used ($2,400/$2,400)
- Entertainment: 40% used ($120/$300)

Suggestion: Consider increasing your savings target to $50,000 by Q4. You're on track to exceed this by shifting just $200 from dining.`,
    
    portfolio: `Your portfolio is performing well with a 2.4% gain this quarter. Here's the breakdown:

Asset Allocation:
- Stocks: 45% (performing +3.2%)
- Bonds: 30% (stable)
- Crypto: 15% (+8.5% YTD)
- Cash: 10% (preserved)

Recommendation: Consider rebalancing your crypto holdings for better diversification. Your risk-adjusted return is excellent.`,
    
    tax: `Based on your income and investments, you could benefit from tax-loss harvesting. Here's what I found:

Tax Optimization Opportunities:
- Unrealized losses: $4,200 available for harvesting
- Tax-deferred growth opportunity: $12,500
- Estimated tax savings: $1,260

I can prepare a detailed strategy. Would you like me to generate a tax optimization plan?`,
    
    goals: `You are on track for your long-term goals! Here's your progress:

Financial Goals Status:
- Emergency Fund: 88% complete ($17,600/$20,000)
- New Tesla Model 3: 65% complete ($29,250/$45,000)
- Retirement Fund: 92% complete

Current trajectory will achieve all goals by target dates. Great job maintaining discipline!`,

    investment: `Let me analyze your investment strategy:

Current Performance:
- YTD Return: +7.8%
- Risk Score: 4/10 (Conservative-Moderate)
- Correlation: -0.15 (well-diversified)

Market outlook suggests slight upside potential in Q3. Consider adding $5,000 to your diversified index fund.`,

    income: `Your income analysis shows:

Monthly Income: $12,500
Income Sources:
- Primary Salary: $10,000 (80%)
- Investment Dividends: $2,000 (16%)
- Other: $500 (4%)

YoY Growth: +8.2%
Forecast: $13,500/month by year-end

Your income stability is excellent.`,

    debt: `Great news - your debt profile is healthy:

Total Debt: $0 (debt-free!)
Credit Score Impact: Excellent (750+)
Credit Utilization: Minimal

Recommendation: Maintain your current trajectory. You're in an excellent position for future investments or major purchases.`,
  }

  const lowerMessage = message.toLowerCase()
  let response = null

  for (const [key, value] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      response = value
      break
    }
  }

  if (!response) {
    response = `I've analyzed your financial data. Based on your recent transactions and portfolio performance, here's what I found:

Key Findings:
- Your wealth index has shown positive momentum (↑ 2.4% this week)
- Spending patterns are healthy and sustainable
- Portfolio diversification score: 8.5/10

What would you like me to dive deeper into? You can ask about:
- Your spending patterns
- Budget optimization
- Investment strategy
- Tax opportunities
- Financial goals`
  }

  return {
    id: Date.now().toString(),
    type: 'assistant',
    content: response,
    timestamp: new Date(),
  }
}

