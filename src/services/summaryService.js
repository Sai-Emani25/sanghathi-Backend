import geminiService from "./geminiApi.js";

const conversationSummaryPrompt = (thread) => {
  if (thread.messages.length < 1) {
    return "Not enough messages to generate a summary.";
  }

  const prompt = `You are tasked with generating a summary of a conversation and evaluating the mentor performance in providing counseling to a student. Your evaluation will be used to provide feedback to higher-level management on the mentor's counseling performance. In your summary, please include a brief overview of the student's problem, the mentor's approach to counseling, the effectiveness of the mentor's counseling, and whether or not the student's problem was resolved. Your summary should be clear and concise, with a maximum word count of 50 and don't generate a long paragraph only generate short summary. Use specific examples and details from the conversation to support your evaluation of the mentor performance. Here is a conversation thread object: Topic: ${
    thread.topic
  } Participants: ${thread.participants
    .map((p) => `${p.name} (Role: ${p.roleName})`)
    .join(", ")} Title: ${thread.title} ${thread.messages
    .map(
      (msg) =>
        `${
          msg.senderId === thread.participants[0]._id
            ? thread.participants[0].name
            : thread.participants[1].name
        }: ${msg.body}`
    )
    .join(
      "\n"
    )}Evaluate the mentor performance in providing counseling to the student based on the above conversation. Be sure to provide specific examples and details to support your conclusions. generate summary on maximum 50 words.`;

  return prompt;
};

// eslint-disable-next-line import/prefer-default-export
export async function generateSummary(thread) {
  const prompt = conversationSummaryPrompt(thread);
  if (prompt === "Not enough messages to generate a summary.") {
    return prompt;
  }

  try {
    // Generate unique thread ID for this summary request
    const summaryThreadId = `summary_${thread._id}_${Date.now()}`;
    
    // Get response from Gemini service
    const response = await geminiService.generateResponse(prompt, summaryThreadId);
    
    // Clean up the conversation history for this summary thread
    geminiService.clearConversation(summaryThreadId);
    
    // Ensure the response is properly formatted and complete
    if (!response || response.length < 10) {
      return "Unable to generate a complete summary. Please try again.";
    }
    
    return response;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary. Please try again.";
  }
}
