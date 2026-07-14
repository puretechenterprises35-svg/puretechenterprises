import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { services } from "@/lib/site";

export default defineTool({
  name: "list_services",
  title: "List Puretech Enterprises services",
  description:
    "Return the full catalog of business services offered by Puretech Enterprises, grouped by category (business registration, tax, NAPSA/NHIMA, tenders, financial consultancy, printing & branding, stationery, ICT).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(services, null, 2) }],
    structuredContent: { services },
  }),
});
