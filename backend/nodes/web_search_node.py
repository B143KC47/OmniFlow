from typing import Any, Dict
import requests
from bs4 import BeautifulSoup
from ..core.base_node import BaseNode

class WebSearchNode(BaseNode):
    def __init__(self, node_id: str):
        super().__init__(node_id, "WebSearchNode")
        self.inputs = {
            "query": None,
            "num_results": 5
        }
        self.outputs = {
            "results": None,
            "error": None
        }
        
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行网络搜索并返回结果"""
        query = input_data.get("query", "")
        num_results = input_data.get("num_results", 5)
        
        if not query:
            return {"error": "Search query cannot be empty", "results": []}
            
        try:
            # 这里使用一个简单的搜索API，实际应用中可能需要更复杂的实现
            # 或使用第三方服务如Google或Bing API
            search_url = f"https://www.google.com/search?q={query}&num={num_results}"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            
            response = requests.get(search_url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            results = []
            for g in soup.find_all('div', class_='g'):
                anchors = g.find_all('a')
                if anchors:
                    link = anchors[0]['href']
                    title = g.find('h3').text if g.find('h3') else "No title"
                    snippet = g.find('span', class_='st').text if g.find('span', class_='st') else "No snippet"
                    results.append({
                        "title": title,
                        "link": link,
                        "snippet": snippet
                    })
                    if len(results) >= num_results:
                        break
            
            return {
                "results": results,
                "error": None
            }
        except Exception as e:
            return {
                "results": [],
                "error": f"Error performing web search: {str(e)}"
            }