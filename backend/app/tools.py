import yfinance as yf
import pandas as pd
from typing import Dict, Any

def get_market_data(ticker: str) -> Dict[str, Any]:
    """
    Получает исторические данные и считает RSI.
    """
    try:

        stock = yf.Ticker(ticker)
        df = stock.history(period="1mo", interval="1d")
        
        if df.empty:
            return {"error": "No data found"}

        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        current_price = df['Close'].iloc[-1]
        current_rsi = df['RSI'].iloc[-1]
        
  
        chart_data = []
        for date, row in df.iterrows():
            chart_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"],
                "volume": row["Volume"]
            })

        return {
            "current_price": round(current_price, 2),
            "rsi": round(current_rsi, 2),
            "chart_data": chart_data,
            "summary": f"Current Price: ${current_price:.2f}. RSI (14-day): {current_rsi:.2f}. Trend: {'Bullish' if current_rsi > 50 else 'Bearish'}."
        }
    except Exception as e:
        return {"error": str(e)}