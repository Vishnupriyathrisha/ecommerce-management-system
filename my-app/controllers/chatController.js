const ChatMessage = require(
  "../models/ChatMessage"
);

const getChatHistory = async (
  req,
  res
) => {
  try {
    const { roomId } = req.params;

    const chat =
      await ChatMessage.findOne({
        roomId,
      })
        .select(
          "roomId messages"
        );

    if (!chat) {
      return res.status(200).json({
        message:
          "No chat history found",
        data: [],
      });
    }

    const sortedMessages =
      chat.messages.sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );

    return res.status(200).json({
      message:
        "Chat history fetched successfully",
      roomId:
        chat.roomId,
      data:
        sortedMessages,
    });

  } catch (error) {
    return res.status(500).json({
      message:
        error.message,
    });
  }
};

module.exports = {
  getChatHistory,
};