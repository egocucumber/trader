import os
from typing import TypedDict, List, Dict, Any
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from .tools import get_market_data

load_dotenv()

class TraderState(TypedDict):
    ticker: str
    price_data: Dict[str, Any] 
    news_summary: str
    final_decision: str        
    reasoning: str             

if not os.environ.get("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY not found")

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)
search_tool = DuckDuckGoSearchRun()

def market_data_node(state: TraderState):
    """Получает цифры"""
    print(f"Fetching market data for {state['ticker']}...")
    data = get_market_data(state['ticker'])
    return {"price_data": data}

def news_node(state: TraderState):
    """Ищет новости"""
    print(f"Searching news for {state['ticker']}...")
    query = f"{state['ticker']} crypto price news market sentiment"
    try:
        news = search_tool.invoke(query)
    except:
        news = "No recent news found."
    return {"news_summary": news}

def analyst_node(state: TraderState):
    """Принимает решение"""
    print("Analyzing...")
    
    price_info = state['price_data'].get('summary', 'No data')
    rsi = state['price_data'].get('rsi', 50)
    news = state['news_summary']
    
    prompt = f"""
    Ты профессиональный крипто-трейдер. Проанализируй данные и дай сигнал.
    
    TICKER: {state['ticker']}
    TECHNICALS: {price_info}
    NEWS: {news}
    
    Задача:
    1. Определи Сигнал: BUY, SELL или HOLD.
    2. Дай обоснование (Reasoning), ссылаясь и на RSI, и на новости.
    3. Оцени "Fear & Greed" (Страх/Жадность) от 0 до 100 на основе данных.
    
    Формат ответа JSON string:
    {{
        "signal": "BUY",
        "score": 75,
        "reasoning": "RSI показывает перепроданность, а новости говорят о..."
    }}
    """
    
    messages = [SystemMessage(content="Ты JSON-машина. Отвечай только валидным JSON."), HumanMessage(content=prompt)]
    response = llm.invoke(messages).content
    
    clean_resp = response.replace("```json", "").replace("```", "").strip()
    
    return {
        "final_decision": clean_resp,
        "reasoning": "Processed"
    }

def create_trader_graph():
    workflow = StateGraph(TraderState)
    
    workflow.add_node("market_data", market_data_node)
    workflow.add_node("news", news_node)
    workflow.add_node("analyst", analyst_node)
    
    workflow.set_entry_point("market_data")
    workflow.add_edge("market_data", "news") 
    workflow.add_edge("news", "analyst")
    workflow.add_edge("analyst", END)
    
    return workflow.compile()