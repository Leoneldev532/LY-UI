import React from "react";
import { useChatbotLogic } from "./hooks/useChatbotLogic";
import EditableQuestion from "../AI/editableQuestion";
import AiSearchBar from "../AI/ai-searchbar";
import { renderContentSequentially } from "./components/renderContentSequentially";


const ChatbotIA = () => {
  const {
    history,
    loadingIdx,
    isThinkingMode,
    listToolsId,
    showThinking,
    showAgentAnimation,
    handleSubmit,
    handleStop,
    setListToolsId,
    setIsThinkingMode,
  } = useChatbotLogic();

  console.log(
    "History statuses:",
    history.map((qa) => ({
      question: qa.question.substring(0, 20) + "...",
      status: qa.status,
    }))
  );

  return (
    <div className="px-4 max-w-3xl space-y-4 mt-4 w-full">
      {history.map((qa, idx) => {
        return (
          <div key={idx} className="">
            <EditableQuestion question={qa.question} />
            {qa.status === "stopped" ? (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mt-2">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Request interrupted by user
                </span>
              </div>
            ) : qa.status === "error" ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-2">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-800 dark:text-red-200 font-medium">
                  An error occurred during generation
                </span>
              </div>
            ) : qa.status === "generated" &&
              Array.isArray(qa.answer) &&
              qa.answer.length > 0 &&
              qa.showAnswer ? (
              <div className="mt-2">
                {renderContentSequentially(qa.answer, { useSafeMode: true })}
              </div>
            ) : qa.status === "generated" && qa.showAnswer ? (
              <div className="text-gray-500 w-full flex justify-center items-center italic mt-2">
                No answer available
              </div>
            ) : qa.status === "generating" || qa.status === "pending" ? (
              <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {qa.status === "generating" ? "Generating..." : "Waiting..."}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}

      <AiSearchBar
        className="mb-3 "
        onToolsChange={setListToolsId}
        onThinkModeChange={setIsThinkingMode}
        submitLoaderComponent={
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></span>
        }
        submitLoading={
          loadingIdx !== null || showThinking || showAgentAnimation
        }
        onSubmit={handleSubmit}
        onStop={handleStop}
        variant="default"
        placeholder={"Ask your question to the AI!"}
      />
    </div>
  );
};

export default ChatbotIA;