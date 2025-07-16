# DealCalc - Affiliate Marketing Deal Calculator

A professional-grade calculator for affiliate marketing deals that models the relationship between CPA rates, conversion rate goals (CRG), and profit margins with real-time bidirectional calculations.

## 🎯 Features

### Core Functionality
- **Bidirectional Input**: Adjust any value (Broker CPA, CRG, Affiliate CPA, CRG, or Margin) and watch others recalculate automatically
- **Real-time Calculations**: Instant updates with transparent formula display
- **Professional UI**: Modern, clean interface with state-of-the-art design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Financial Model
The calculator uses the following core relationship:
```
Effective Value = CPA × Conversion Rate Goal
Margin = (Broker Effective Value - Affiliate Effective Value) / Broker Effective Value × 100
```

### Example Scenarios
1. **Same CRG**: Broker pays $1200 @ 10% CRG, you pay affiliate $960 @ 10% CRG → 20% margin
2. **Different CRG**: Broker pays $1200 @ 10% CRG, you pay affiliate $1200 @ 8% CRG → 20% margin

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone or download the project
cd dealcalc

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run preview
```

## 🛠 Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **JavaScript/ES6+** - Modern JavaScript features

## 📊 How It Works

### Input Fields
1. **Broker Terms**
   - CPA: Cost per acquisition the broker pays you
   - CRG: Conversion rate goal required by the broker

2. **Affiliate Terms**
   - CPA: Cost per acquisition you pay the affiliate
   - CRG: Conversion rate goal you require from the affiliate

3. **Target Margin**
   - Your desired profit margin percentage

### Calculation Logic
The calculator automatically maintains relationships between all values:

- When you change **Broker CPA**: Affiliate CPA adjusts to maintain margin
- When you change **Broker CRG**: Affiliate CPA adjusts to maintain margin  
- When you change **Affiliate CPA**: Broker CPA adjusts to maintain margin
- When you change **Affiliate CRG**: Affiliate CPA adjusts to maintain margin
- When you change **Margin**: Affiliate CPA adjusts to the new margin

### Visual Feedback
- **Live calculations** with step-by-step formula display
- **Color-coded inputs** that highlight the last changed field
- **Real-time results** showing effective values and profit calculations
- **Example scenarios** to understand different deal structures

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Fade-in and slide-up effects
- **Visual Hierarchy**: Clear separation of input sections
- **Responsive Layout**: Adapts to all screen sizes
- **Accessibility**: Proper labels and semantic HTML
- **Intuitive Icons**: Visual cues for different input types

## 🔧 Architecture

### Component Structure
```
src/
├── App.jsx                    # Main application component
├── components/
│   └── DealCalculator.jsx     # Core calculator component
├── utils/
│   └── calculations.js        # Calculation logic and utilities
├── index.css                  # Global styles and Tailwind
└── main.jsx                   # Application entry point
```

### Key Functions
- `calculateEffectiveValue()` - Core effective value calculation
- `calculateMargin()` - Margin percentage calculation
- `recalculateFrom*()` - Bidirectional recalculation functions
- `formatCurrency()` & `formatPercentage()` - Display formatting

## 🧮 Financial Formulas

### Effective Value
```
Effective Value = CPA × (CRG / 100)
```

### Margin Calculation
```
Margin = ((Broker Effective - Affiliate Effective) / Broker Effective) × 100
```

### Bidirectional Relationships
When maintaining a target margin:
```
Affiliate Effective = Broker Effective × (1 - Margin / 100)
```

## 🎯 Use Cases

1. **Deal Planning**: Model different CPA/CRG combinations
2. **Margin Analysis**: Understand profit implications of deal terms
3. **Negotiation Tool**: Quickly calculate alternative deal structures
4. **Performance Tracking**: Compare actual vs planned margins

## 🔮 Future Enhancements

- **Deal Templates**: Save and load common deal structures
- **Historical Tracking**: Track deal performance over time
- **Export Features**: PDF reports and CSV exports
- **Advanced Analytics**: ROI calculations and forecasting
- **Team Features**: Share deals and collaborate

## 📝 License

This project is available for personal and commercial use.

---

Built with ❤️ for affiliate marketing professionals. 