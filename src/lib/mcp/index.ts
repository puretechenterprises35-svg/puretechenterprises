import { defineMcp } from "@lovable.dev/mcp-js";
import listServices from "./tools/list-services";
import getService from "./tools/get-service";
import getContact from "./tools/get-contact";
import getFaqs from "./tools/get-faqs";
import buildEnquiryLink from "./tools/build-enquiry-link";

export default defineMcp({
  name: "puretech-enterprises-mcp",
  title: "Puretech Enterprises",
  version: "0.1.0",
  instructions:
    "Public MCP server for Puretech Enterprises (Kapiri Mposhi, Zambia). Use these tools to look up the company's services, contact details, FAQs, and to build WhatsApp enquiry links for prospective clients.",
  tools: [listServices, getService, getContact, getFaqs, buildEnquiryLink],
});
