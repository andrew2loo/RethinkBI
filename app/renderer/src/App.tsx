import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { TopBar } from "../components/TopBar.js";
import { NavRail } from "../components/NavRail.js";
import { StatusBar } from "../components/StatusBar.js";
import { RightPane } from "../components/RightPane/RightPane.js";
import { Report } from "../routes/Report.js";
import { Data } from "../routes/Data.js";
import { Model } from "../routes/Model.js";
import { useUIStore } from "../state/ui.js";

function AppRoutes(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { nav, setNav } = useUIStore();

  // Sync route with nav state
  useEffect(() => {
    const path = location.pathname.slice(1) || "report";
    if (path !== nav) {
      setNav(path as "report" | "data" | "model");
    }
  }, [location.pathname, nav, setNav]);

  // Sync nav state with route
  useEffect(() => {
    if (location.pathname !== `/${nav}`) {
      navigate(`/${nav}`, { replace: true });
    }
  }, [nav, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/report" element={<Report />} />
      <Route path="/data" element={<Data />} />
      <Route path="/model" element={<Model />} />
      <Route path="/" element={<Navigate to="/report" replace />} />
    </Routes>
  );
}

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <NavRail />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AppRoutes />
          </div>
          <RightPane />
        </div>
        <StatusBar />
      </div>
    </BrowserRouter>
  );
}
