# **AI Support Agent 🤖🛠️**  
**Automated Customer Support & FAQ System Powered by AI**  

This AI agent scrapes your website, understands its content using embeddings, and provides **instant, accurate responses** to customer queries—just like a human support expert.  

---

## **✨ Features**  
✅ **24/7 Automated Support** – Answers customer questions instantly  
✅ **Semantic Understanding** – Finds relevant answers even with vague queries  
✅ **Easy Setup** – Just add your website URLs and let the AI learn  
✅ **Self-Improving** – Continuously updates with new website content  
✅ **Low Latency** – Fast responses using ChromaDB vector search  

---

## **⚙️ Tech Stack**  
| Component          | Technology |  
|--------------------|------------|  
| **Web Scraping**   | Cheerio + Axios |  
| **Embeddings**     | OpenAI (`text-embedding-3-small`) or Any LLM |  
| **Vector DB**      | ChromaDB (local/self-hosted) or Any vector DB |  
| **Query Handling** | Semantic Search + Similarity Matching |  

---

## **🚀 Quick Start**  

### **1. Prerequisites**  
- Node.js (v18+)  
- Docker (for ChromaDB)  
- OpenAI API key  

### **2. Installation**  
```bash
git clone
cd ai-support-agent
npm install
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### **3. Start ChromaDB**  
```bash
docker-compose up -d --build
```

### **4. Configure Target Website**  
Edit `index.js` to add your support/FAQ pages:  
```javascript
const urls = [
 // add your web urls here
];
```

### **5. Run AI Agent**  
```bash
node index.js
```

---

## **🛠️ Customization**  

### **Improving Responses**  
- **Add more URLs** – Include documentation, blogs, or tutorials for better coverage  
- **Adjust chunk size** – Modify `textChunks()` in `index.js` for optimal text splitting  
- **Fine-tune queries** – Change `nResults` in `chat()` to retrieve more answers  

### **Deployment Options**  
- **Slack/Discord Bot** – Connect via webhooks  
- **Live Chat Widget** – Embed in your website  
- **API Endpoint** – Deploy as a REST service  

---

## **📊 How It Works**  
1. **Scrapes** website content (FAQs, docs, support pages)  
2. **Converts** text into AI embeddings (vector representations)  
3. **Stores** embeddings in ChromaDB for fast search  
4. **Matches** user queries with relevant content using semantic similarity  
5. **Returns** the most accurate answer in natural language  

---

## **🚨 Troubleshooting**  

| Issue | Solution |  
|-------|----------|  
| ChromaDB not running | Run `docker ps` to check container status |  
| Empty responses | Ensure website content is scraped properly |  
| Low accuracy | Add more URLs or adjust chunk size |  

---

**Let AI handle your customer support!** 🚀  

---
