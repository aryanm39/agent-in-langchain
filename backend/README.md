```bash
source venv/Scripts/activate
```
```bash
uvicorn main:app --reload
```
```bash
http://localhost:8000/docs
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

What are aryan's skills
latest temperature of Mumbai
US Iran latest war updates May 2026

Gemini embeddings → 768 / 3072 dims
MiniLM → 384 dims
# =================================== codex ============================================
Token usage: total=73,036 input=64,441 (+ 476,800 cached) output=8,595 (reasoning 4,012)
To continue this session, run codex resume 019ddde9-252d-71c1-b874-da61cf1acff4

