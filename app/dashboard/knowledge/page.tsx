import { getDocuments } from "@/lib/actions/knowledge"
import KnowledgePageClient from "@/components/knowledge/knowledge-page-client"

export const metadata = {
  title: "Knowledge Base | PrepSafe",
  description: "Emergency preparedness articles, guides, and tips.",
}

export default async function KnowledgePage() {
  const documents = await getDocuments()

  return <KnowledgePageClient documents={documents} />
}
