try:
    from fastapi import FastAPI, Request
    from pydantic import BaseModel
    from fastapi.middleware.cors import CORSMiddleware
    from langchain_community.llms import Ollama

    DEPENDENCIES_AVAILABLE = True

except ImportError as e:
    print(f"Missing dependencies: {e}")
    print("Please install required packages using: pip install fastapi uvicorn pydantic langchain-community")
    DEPENDENCIES_AVAILABLE = False

if DEPENDENCIES_AVAILABLE:
    app = FastAPI()

    # Allow frontend to connect
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Input model
    class QuestionInput(BaseModel):
        question: str

    # Load Ollama LLM (Mistral)
    try:
        llm = Ollama(model="mistral")
    except Exception as e:
        print(f"Warning: Could not load Ollama model: {e}")
        print("Please make sure Ollama is installed and running")
        llm = None

    # POST /ask endpoint
    @app.post("/ask/")
    async def ask_question(data: QuestionInput):
        question = data.question
        try:
            if llm is None:
                # Return a mock answer for testing
                return {"question": question, "answer": f"Mock answer for: {question}"}

            # Directly use LLM to answer the question
            answer = llm.invoke(question)

            return {"question": question, "answer": answer}

        except Exception as e:
            return {"error": str(e)}

    @app.get("/")
    async def root():
        return {"message": "LLM API is running! Use POST /ask/ to ask questions."}

else:
    # Minimal fallback app
    app = FastAPI()

    @app.get("/")
    async def root():
        return {
            "error": "Dependencies not installed. Please run: pip install fastapi uvicorn pydantic langchain-community"
        }
