
<img width="1698" height="926" alt="RAG_Architecture" 
src="https://github.com/user-attachments/assets/125392f3-cd15-4f19-920f-7ed6b2faada3" />


```bash
source venv/Scripts/activate
```

```bash
uvicorn main:app --reload
```

**issues**
**3. The framework changes too fast.**
Breaking changes. API churn. Docs always outdated. I was spending more time 
debugging the framework than building the product.

**fix** \
pip uninstall pinecone-plugin-inference \
pip uninstall -y langgraph-prebuilt==1.0.8

## Create Pinecone index
**configuaration setting**  \
Vector type Dense   \
Dimension  3072 \
metric cosine
* Gemini embeddings → 768 / 3072 dims
* MiniLM → 384 dims

* UPDATE users SET role = 'admin' WHERE id = 1;
* DELETE FROM users WHERE id = 2;

**username**
* test@example.com (admin)
* aryan@gmail.com (user)

**password**
* test1234
* testaryan

**Queries**
What are aryan's skills     \
latest temperature of Mumbai    \
US Iran latest war updates May 2026

