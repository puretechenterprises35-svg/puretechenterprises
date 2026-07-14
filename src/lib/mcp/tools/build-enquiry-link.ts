import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { whatsappServiceLink } from "@/lib/site";

export default defineTool({
  name: "build_whatsapp_enquiry_link",
  title: "Build WhatsApp enquiry link",
  description:
    "Create a WhatsApp deep link that opens a chat with Puretech Enterprises pre-filled with an enquiry about the given service.",
  inputSchema: {
    service: z
      .string()
      .describe("Service the user is enquiring about, e.g. 'Company Registration'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: ({ service }) => {
    const url = whatsappServiceLink(service);
    return {
      content: [{ type: "text", text: url }],
      structuredContent: { url, service },
    };
  },
});
