import { ActionCard } from "../../../components/ActionCard";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import "./ProspectLeadsScreen.css";

export interface ProspectLeadsScreenProps {
  onBack: () => void;
  onOpenClients: () => void;
  onOpenGuards: () => void;
}

export function ProspectLeadsScreen({
  onBack,
  onOpenClients,
  onOpenGuards,
}: ProspectLeadsScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content prospect-leads-screen">
        <PageHeader
          title="Prospect leads"
          subtitle="Choose a pipeline — client sales leads or guard hiring candidates."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <section
          className="prospect-leads-screen__options"
          aria-label="Prospect pipelines"
        >
          <ActionCard
            title="Prospect clients"
            description="Track and manage prospective client leads through your sales pipeline."
            icon="🤝"
            onClick={onOpenClients}
          />
          <ActionCard
            title="Prospect guards"
            description="Track and manage prospective guard candidates through your hiring pipeline."
            icon="🛡️"
            onClick={onOpenGuards}
          />
        </section>
      </div>
    </AppScreenLayout>
  );
}
