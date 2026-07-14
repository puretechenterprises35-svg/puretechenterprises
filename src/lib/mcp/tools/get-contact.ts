import { defineTool } from "@lovable.dev/mcp-js";
import { site, whatsappLink, telLink } from "@/lib/site";

export default defineTool({
  name: "get_contact_info",
  title: "Get Puretech Enterprises contact info",
  description:
    "Return official public contact details for Puretech Enterprises: phone, WhatsApp, email, location, and prebuilt WhatsApp/tel links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: site.name,
      slogan: site.slogan,
      phone: site.phone,
      whatsapp: `+${site.whatsapp}`,
      whatsappLink: whatsappLink(),
      telLink,
      email: site.email,
      location: site.location,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
