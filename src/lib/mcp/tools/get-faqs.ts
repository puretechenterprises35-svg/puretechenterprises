import { defineTool } from "@lovable.dev/mcp-js";
import { faqs } from "@/lib/site";

export default defineTool({
  name: "get_faqs",
  title: "Get frequently asked questions",
  description:
    "Return the list of public FAQs answered on the Puretech Enterprises website.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(faqs, null, 2) }],
    structuredContent: { faqs },
  }),
});
