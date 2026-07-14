import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { services } from "@/lib/site";

export default defineTool({
  name: "get_service",
  title: "Get service details",
  description:
    "Get details for a single Puretech Enterprises service category by its slug (e.g. 'business-registration', 'tax-zra', 'ict-services').",
  inputSchema: {
    slug: z.string().describe("Service category slug."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const match = services.find((s) => s.slug === slug);
    if (!match) {
      return {
        content: [{ type: "text", text: `No service found for slug "${slug}".` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(match, null, 2) }],
      structuredContent: { service: match },
    };
  },
});
