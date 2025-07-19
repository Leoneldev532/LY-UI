"use client";
import { cva } from "class-variance-authority";
import React, { forwardRef } from "react";

import {
  ArrowUp,
  Check,
  ChevronDown,
  Lightbulb,
  Plus,
  SearchSlashIcon,
  FileText,
  Image,
  Code,
  Mic,
  Camera,
  Upload,
  LayoutGrid,
  Share2,
  UserPlus,
  GoalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const AiSearchBarVariants = cva(
  "relative lg:min-w-xl max-w-3xl relative w-full rounded-xl text-neutral-900 dark:text-gray-200 inline-block text-left",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-200/40 dark:border-neutral-200/20 border border-neutral-300/50 dark:bg-neutral-900 dark:text-gray-200 text-neutral-700",
        ghost:
          "bg-neutral-200/40 dark:border-neutral-200/20 dark:text-gray-200",
        outline:
          "border border-neutral-300/50 dark:border-neutral-200/40 dark:bg-neutral-900 dark:text-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type AI_SearchBarProps = {
  variant?: "default" | "ghost" | "outline";
  placeholder?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  className?: string;
};

const AiSearchBar = forwardRef<HTMLDivElement, AI_SearchBarProps>(({
  variant,
  placeholder = "What can I do for you?",
  onSubmit,
  onChange,
  className,
  ...props
}, ref) => {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isFilled = value.trim().length > 0;
  const [checkedTools, setCheckedTools] = React.useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("Submitted:", value);
      onSubmit?.(value);
      setValue("");
    }
  };

  const [isTyping, setIsTyping] = React.useState(false);
  const typingTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
    adjustHeight();
    setIsTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1000);
  };
  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckedTools = [...checkedTools];
    newCheckedTools[index] = checked;
    setCheckedTools(newCheckedTools);
    console.log(`Tool ${index} is now ${checked ? "checked" : "unchecked"}`);
  };

  const modelList = [
    {
      name: "GPT-4",
      icon: (
        <svg
          className="w-5 h-5 text-neutral-700 dark:text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      ),
    },
    {
      name: "GPT-3.5",
      icon: (
        <svg
          className="w-5 h-5 opacity-60 text-neutral-700 dark:text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      ),
    },
    {
      name: "Claude-3",
      icon: (
        <svg
          className="w-5 h-5 text-neutral-700 dark:text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.894 18.894c-1.789 1.789-4.205 2.773-6.894 2.773s-5.105-.984-6.894-2.773S2.333 14.689 2.333 12s.984-5.105 2.773-6.894S9.311 2.333 12 2.333s5.105.984 6.894 2.773 2.773 4.205 2.773 6.894-.984 5.105-2.773 6.894z" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="8" cy="16" r="2" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      ),
    },
    {
      name: "Llama-2",
      icon: (
        <svg
          className="w-5 h-5 text-neutral-700 dark:text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Mistral-7B",
      icon: (
        <svg
          className="w-5 h-5 text-neutral-700 dark:text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
  ];

  const moreOptions = [
    {
      label: "Upload File",
      icon: <Upload size={53} className="w-6 h-6" />,
      action: () => console.log("Upload file"),
    },
    {
      label: "Attach Image",
      icon: <Image className="w-6 h-6" />,
      action: () => console.log("Attach image"),
    },
    {
      label: "Take Photo",
      icon: <Camera className="w-6 h-6" />,
      action: () => console.log("Take photo"),
    },
    {
      label: "Voice Note",
      icon: <Mic className="w-6 h-6" />,
      action: () => console.log("Voice note"),
    },
    { separator: true },
    {
      label: "Code Snippet",
      icon: <Code className="w-6 h-6" />,
      action: () => console.log("Code snippet"),
    },
    {
      label: "Text Document",
      icon: <FileText className="w-6 h-6" />,
      action: () => console.log("Text document"),
    },
  ];

  const tools = [
    {
      tool: "Web Search",
      description: "Web search with sources.",
      icon: <SearchSlashIcon className="w-5 h-5" />,
      action: () => console.log("Start a real-time search"),
      source:
        "https://www.blogdumoderateur.com/le-chat-mistral-nouveautes-ia-concurrent-chatgpt/",
    },
    {
      tool: "Image Generation",
      description: "Create images from text.",
      icon: <Image className="w-5 h-5" />,
      action: () => console.log("Open image generation tool"),
      source:
        "https://www.blogdumoderateur.com/le-chat-mistral-nouveautes-ia-concurrent-chatgpt/",
    },
    {
      tool: "Code Interpreter",
      description: "Execute and analyze code.",
      icon: <Code className="w-5 h-5" />,
      action: () => console.log("Open code editor"),
      source: "https://mistral.ai/news/the-all-new-le-chat/",
    },
    {
      tool: "Document Analysis",
      description: "Analyze and summarize files.",
      icon: <FileText className="w-5 h-5" />,
      action: () => console.log("Import a file (PDF, PNG, JPG, CSV)"),
      source:
        "https://www.blogdumoderateur.com/le-chat-mistral-nouveautes-ia-concurrent-chatgpt/",
    },
    {
      tool: "Canvas Interface",
      description: "Co-create on a shared space.",
      icon: <LayoutGrid className="w-5 h-5" />,
      action: () => console.log("Open Canvas interface"),
      source:
        "https://patmcguinness.substack.com/p/mistrals-new-le-chat-and-the-canvas",
    },
    {
      tool: "Share Conversation",
      description: "Share the conversation.",
      icon: <Share2 className="w-5 h-5" />,
      action: () => console.log("Copy conversation URL"),
      source: "https://reglo.ai/comment-utiliser-le-chat-de-mistral-ai/",
    },
    {
      tool: "Agent Creation",
      description: "Create a custom AI agent.",
      icon: <UserPlus className="w-5 h-5" />,
      action: () => console.log("Open agent creation tool"),
      source:
        "https://medium.com/@abdulrahman.rihan/how-to-create-a-custom-chatbot-using-mistral-80c31cd3526c",
    },
    {
      tool: "File Upload",
      description: "Upload files to process.",
      icon: <Upload className="w-5 h-5" />,
      action: () => console.log("Open file picker"),
      source: "https://reglo.ai/comment-utiliser-le-chat-de-mistral-ai/",
    },
    {
      tool: "Google Integrations",
      description: "Connect Gmail and Calendar.",
      icon: <GoalIcon className="w-5 h-5" />,
      action: () => console.log("Enable Google connections"),
      source: "https://reglo.ai/comment-utiliser-le-chat-de-mistral-ai/",
    },
  ];

  const [selectedModel, setSelectedModel] = React.useState(0);

  return (
    <div
      ref={ref}
      className={cn(
        AiSearchBarVariants({ variant }),

        className
      )}
    >
      <div className="w-full relative flex flex-col justify-start items-center">
        <div className="relative w-full">
          <Textarea
            id="ai-input-15"
            value={value}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-xl px-4 py-3 border-none bg-transparent placeholder:text-neutral-700/70",
              "dark:placeholder:text-white/70 resize-none w-full min-h-[72px] max-h-[300px] focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />
          <div className="flex justify-between p-4 items-center w-full">
            <div className="w-auto flex justify-start items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 px-2">
                    <Plus height={24} width={24} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    "min-w-[12rem]",
                    "border-black/10 mt-6 rounded-xl dark:border-white/10",
                    "bg-neutral-100 dark:bg-neutral-900"
                  )}
                >
                  {moreOptions.map((option, index) => {
                    if (option.separator) {
                      return <DropdownMenuSeparator key={index} />;
                    }
                    return (
                      <DropdownMenuItem
                        key={index}
                        onSelect={option.action}
                        className="rounded-lg h-9 cursor-pointer hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 gap-2"
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="h-8 border-neutral-500">
                <Lightbulb /> <span className="md:inline hidden">Think</span>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-8 border-neutral-500">
                    <LayoutGrid />{" "}
                    <span className="md:inline hidden">Tools</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  sideOffset={10}
                  className={cn(
                    "w-[100%] lg:w-[600px] scrollbar-thin scrollbar-thumb-transparent scrollbar-track-white h-[400px] md:h-auto overflow-auto rounded-xl max-w-full ml-7 md:ml-[16%] mt-4 p-4",
                    "border-black/10 rounded-xl dark:border-white/10",
                    "bg-neutral-100 dark:bg-neutral-900"
                  )}
                  style={{ overflow: "auto" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-2 divide-red-500 gap-4">
                    <div className="flex flex-col justify-start items-start gap-2">
                      <h5 className="font-semibold text-neutral-500 dark:text-neutral-100/50">
                        Tools
                      </h5>
                      {tools
                        .slice(0, Math.ceil(tools.length / 2))
                        .map((tool, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer w-full hover:bg-neutral-200 dark:hover:bg-neutral-200/20"
                            onClick={() => {
                              if (index < 5) {
                                handleCheckboxChange(
                                  index,
                                  !checkedTools[index]
                                );
                              } else {
                                tool.action();
                              }
                            }}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {tool.icon}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-neutral-700 dark:text-white">
                                  {tool.tool}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {tool.description}
                                </span>
                              </div>
                            </div>
                            {index < 5 && (
                              <Checkbox
                                checked={checkedTools[index]}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(
                                    index,
                                    checked as boolean
                                  )
                                }
                                className="ml-1 border border-neutral-400 dark:border-neutral-600 h-6 w-6"
                              />
                            )}
                          </div>
                        ))}
                    </div>
                    <div className="flex flex-col justify-start items-start gap-2">
                      <h5 className="font-semibold text-neutral-500 dark:text-neutral-100/50">
                        Connections
                      </h5>
                      {tools
                        .slice(Math.ceil(tools.length / 2))
                        .map((tool, index) => {
                          const actualIndex =
                            index + Math.ceil(tools.length / 2);
                          return (
                            <div
                              key={actualIndex}
                              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-200/20 cursor-pointer w-full"
                              onClick={() => {
                                if (actualIndex < 5) {
                                  handleCheckboxChange(
                                    actualIndex,
                                    !checkedTools[actualIndex]
                                  );
                                } else {
                                  tool.action();
                                }
                              }}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                {tool.icon}
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-neutral-700 dark:text-white">
                                    {tool.tool}
                                  </span>
                                  <span className="text-xs text-neutral-700/70 dark:text-gray-400">
                                    {tool.description}
                                  </span>
                                </div>
                              </div>
                              {actualIndex < 5 && (
                                <Checkbox
                                  checked={checkedTools[actualIndex]}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      actualIndex,
                                      checked as boolean
                                    )
                                  }
                                  className="ml-1"
                                />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="none"
                    className="flex items-center gap-1 h-8 pl-3 pr-2 text-xs
                     rounded-md dark:text-white hover:bg-neutral-200 
                     dark:hover:bg-white/10 
                     focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-black"
                  >
                    <div className="flex items-center gap-1">
                      {modelList[selectedModel].icon}
                      <span>{modelList[selectedModel].name}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    "min-w-[10rem]",
                    "border-black/10 mt-6 dark:border-white/10",
                    "bg-neutral-100 dark:bg-neutral-900"
                  )}
                >
                  {modelList.map((model, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={() => setSelectedModel(index)}
                      className="flex hover:!bg-neutral-200 dark:hover:!bg-neutral-200/20 items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        {model.icon}
                        <span>{model.name}</span>
                      </div>
                      {selectedModel === index && (
                        <Check className="w-4 h-4 text-neutral-700 dark:text-white" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                disabled={!isFilled}
                className={cn(
                  "h-8 px-2 transition-opacity duration-3 00 ease",
                  isFilled ? "opacity-100" : "opacity-50"
                )}
                variant="default"
              >
                <ArrowUp />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AiSearchBar.displayName = 'AiSearchBar';
export default AiSearchBar;
