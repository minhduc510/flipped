import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ReaderPage from "./pages/ReaderPage";
import ReviewPage from "./pages/ReviewPage";
import QuizPage from "./pages/QuizPage";
import ClozePage from "./pages/ClozePage";
import ListeningPage from "./pages/ListeningPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/read" replace />} />
        <Route path="/read" element={<ReaderPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/cloze" element={<ClozePage />} />
        <Route path="/listen" element={<ListeningPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/read" replace />} />
    </Routes>
  );
}
