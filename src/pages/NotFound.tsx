import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Jim } from "@/components/Jim";

export default function NotFound() {
  return (
    <main className="notfound-page">
      <div className="notfound-card">
        <Jim size="medium" mood="thinking" interactive />
        <span className="section-label">404 · LOST SIGNAL</span>
        <h1>That page isn’t on Jim’s desk.</h1>
        <p>The link may have moved, or it belongs to a brief that doesn’t exist yet.</p>
        <Link to="/app" className="primary-button">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to workspace</span>
        </Link>
      </div>
    </main>
  );
}
