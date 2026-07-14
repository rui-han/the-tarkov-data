-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userAuth0Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userAuth0Id_fkey" FOREIGN KEY ("userAuth0Id") REFERENCES "User"("auth0Id") ON DELETE SET NULL ON UPDATE CASCADE;
