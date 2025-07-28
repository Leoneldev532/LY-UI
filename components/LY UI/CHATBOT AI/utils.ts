import { z } from "zod";

export type LiaContentItem = {
  type: string;
  content: any;
  metadata?: any;
};

export const LiaContentItemSchema = z.object({
  type: z.string().min(1, "Type cannot be empty"),
  content: z.any(),
  metadata: z.any().optional(),
});

export const LiaContentArraySchema = z
  .array(LiaContentItemSchema)
  .min(1, "The answer must contain at least one element");

export type QA = {
  question: string;
  answer: LiaContentItem[];
  showAnswer: boolean;
  isImage?: boolean;
  isAgent?: boolean;
  isThinking?: boolean;
  startTime?: string;
  endTime?: string;
  isStopped?: boolean;
  status: "pending" | "generating" | "completed" | "stopped" | "error" | "generated";
};

export type ToolsConfig = {
  isImage: boolean;
  isAgent: boolean;
  isThinking: boolean;
};


export type RenderContentItem = {
  type: string;
  content: any;
  metadata?: any;
}

export type ItemWrapperProps = {
  item: RenderContentItem;
  index: number;
  onComplete: (index: number) => void;
  isVisible: boolean;
  onItemCompleted?: (index: number) => void;
}

export type SafeSequentialRendererProps = {
  items: RenderContentItem[];
  onAllComplete?: () => void;
  showProgress?: boolean;
  maxWaitTime?: number;
  className?: string;
  retryCount?: number;
}

export type RenderContentOptions = {
  onComplete?: () => void;
  showProgress?: boolean;
  maxWaitTime?: number;
  useSafeMode?: boolean;
  delay?: number;
  retryCount?: number;
}