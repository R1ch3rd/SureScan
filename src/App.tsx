// App.tsx
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import DiagnosisPage from "./components/DiagnosisPage";
import ChatbotPage from "./components/ChatbotPage";
import SurvivalTime from "./components/SurvivalTime";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage setActiveTab={setActiveTab} />;
      case "diagnosis":
        return <DiagnosisPage />;
      case "survival":
        return <SurvivalTime />;
      case "chat":
        return <ChatbotPage />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-cream text-ink-body overflow-hidden">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-surface border border-surface-border text-ink shadow-sm"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSidebar={toggleSidebar}
      />

      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}

export default App;
