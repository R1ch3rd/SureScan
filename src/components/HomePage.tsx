import React from 'react';
import { Brain, MessageSquare, Activity, ArrowRight } from 'lucide-react';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const features = [
    {
      id: 'diagnosis',
      icon: Brain,
      title: 'Tumor detection and classification',
      body: 'Upload a brain MRI: a fine-tuned YOLOv11 localizes suspect regions and an EfficientNet-B3 classifier assigns one of 44 tumor classes with confidence scores.',
      cta: 'Scan an MRI',
    },
    {
      id: 'survival',
      icon: Activity,
      title: 'Survival prediction',
      body: 'An XGBoost model estimates survival time from patient and tumor characteristics such as type, grade, location, and treatment outcome.',
      cta: 'Run a prediction',
    },
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'Report Q&A',
      body: 'Upload a medical report PDF and ask questions about it. Retrieval-augmented answers grounded in the document, powered by Gemini.',
      cta: 'Ask about a report',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:pl-[104px]">
      {/* Hero */}
      <div className="mb-14 text-center">
        <h1 className="font-display font-semibold text-4xl sm:text-5xl text-ink mb-4">
          SureScan
        </h1>
        <p className="text-lg text-ink-muted max-w-2xl mx-auto">
          Brain tumor detection, classification, and diagnosis assistance.
          Three models, one workflow, built as a research demo.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="bg-surface p-7 rounded-xl border border-surface-border hover:border-accent transition-colors flex flex-col"
            >
              <div className="w-11 h-11 bg-accent-dim rounded-lg flex items-center justify-center mb-5">
                <Icon size={22} className="text-accent-deep" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-5 flex-1">{f.body}</p>
              <button
                onClick={() => setActiveTab(f.id)}
                className="flex items-center text-sm font-medium text-accent-deep hover:text-accent transition-colors"
              >
                {f.cta} <ArrowRight size={15} className="ml-1.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Honest footer note */}
      <div className="text-center bg-surface-warm border border-surface-border rounded-xl px-8 py-7">
        <p className="text-sm text-ink-muted max-w-2xl mx-auto">
          SureScan is a research and portfolio demonstration, not a medical
          device. Nothing here is medical advice; consult a qualified
          clinician for real diagnoses.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
