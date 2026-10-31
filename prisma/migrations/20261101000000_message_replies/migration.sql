-- Replies sent from the admin, shown under each message as a thread. No foreign key on purpose:
-- a message moved to the trash and restored keeps its replies.

-- CreateTable
CREATE TABLE "MessageReply" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageReply_messageId_createdAt_idx" ON "MessageReply"("messageId", "createdAt");
