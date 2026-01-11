from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from .graph import create_trader_graph
import json
import uvicorn

app = FastAPI(title="AI Crypto Trader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TickerRequest(BaseModel):
    ticker: str  

@app.post("/analyze")
async def analyze_ticker(request: TickerRequest):
    graph = create_trader_graph()
    
    initial_state = {
        "ticker": request.ticker,
        "price_data": {},
        "news_summary": "",
        "final_decision": "",
        "reasoning": ""
    }
    
    result = graph.invoke(initial_state)
    
    try:
        ai_analysis = json.loads(result['final_decision'])
    except:
        ai_analysis = {
            "signal": "UNKNOWN", 
            "score": 50, 
            "reasoning": result['final_decision']
        }
        
    return {
        "ticker": request.ticker,
        "market_data": result['price_data'], 
        "analysis": ai_analysis             
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)