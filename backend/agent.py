import os
from langchain import hub
from langchain_core.tools import Tool
from langchain.agents import AgentExecutor, create_react_agent
from tools import search_with_sources, get_weather_data, query_resumes
from dotenv import load_dotenv
load_dotenv()

# from langchain_google_genai import ChatGoogleGenerativeAI
# llm = ChatGoogleGenerativeAI(
#     model="gemini-flash-latest",
#     temperature=0,
#     google_api_key=os.getenv("GEMINI_API_KEY"),
# )

from langchain_groq import ChatGroq 
llm = ChatGroq(
    model_name="openai/gpt-oss-120b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

search_tool = Tool(
    name="google_search",
    func=search_with_sources,
    description="Search for real-time news from trusted sources only. Use for current events, news, and information not available in resumes.",
)

weather_tool = Tool(
    name="weather",
    func=get_weather_data,
    description="Get current weather for a city. Input should be a city name.",
)

rag_tool = Tool(
    name="resume_search",
    func=query_resumes,
    description="Search and retrieve information from uploaded resume PDFs. Use this for any questions about candidates, their skills, experience, education, or any resume-related queries.",
)

prompt = hub.pull("hwchase17/react")
tools = [search_tool, weather_tool, rag_tool]

agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=prompt,
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_tool_error=True,
    handle_parsing_errors=True,
    verbose=True,
    return_intermediate_steps=True,
)


def run_agent(user_input: str):
    response = agent_executor.invoke({"input": user_input})

    sources = []
    for action, observation in response.get("intermediate_steps", []):
        if action.tool == "google_search":
            if "SOURCES:" in observation:
                sources_section = observation.split("SOURCES:")[-1].strip()
                sources = [s.strip() for s in sources_section.splitlines() if s.strip()]

    return {
        "output": response["output"],
        "sources": sources,
    }
