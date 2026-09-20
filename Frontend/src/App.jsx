import React from "react";
import { Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import PrivateRoute from "./components/PrivateRoute";

import CreateForm from "./Pages/CreateForm";
import UserProfile from "./Pages/UserProfile";
import AiRecomendationForm from "./Pages/AiRecomendationForm";
import UpdateSubmittedForm from "./Pages/UpdateSubmittedForm";
import DeleteSubmittedForm from "./Pages/DeleteSubmittedForm";
import MyInquiries from "./Pages/MyInquiries";
import Dashboard from "./components/Dashboard";
import ManagerResponses from "./Pages/ManagerResponses";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import LogNavBar from "./components/LogingNavBar";
import AdminDashboard from "./Pages/AdminDashboard";
import ArticleView from "./components/ArticleView";
import HomeAfterLogin from "./Pages/HomeAfterLogin";
import UserManagement from "./components/UserManagement";

import HomeMaterial from "./Pages/HomeMaterial";
import CreateMaterial from "./Pages/CreateMaterial";
import ShowMaterial from "./Pages/ShowMaterial";
import EditMaterial from "./Pages/EditMaterial";
import BuyMaterial from "./Pages/BuyMaterial";
import SupplierAnalytics from "./Pages/SupplierAnalytics";

import MyInquiriez from "./Pages/MyInquiriez";
import ManagerDashboard from "./Pages/ManagerDashboard";
import ManagerAlertForm from "./Pages/ManagerAlertForm";
import UpdateAlerts from "./Pages/UpdateAlerts";

import PlantDiseaseIdentifier from "./Pages/apitest";
import SmartTreatments from "./Pages/SmartTreatments";
import DiseaseMap from "./Pages/DiseaseMap";
import HealthHub from "./Pages/HealthHub"; // 👈 Added HealthHub Import
import AiAssistant from "./AiAssistant";

const App = () => {
  return (
    <SnackbarProvider>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/loghome" element={<HomeAfterLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/articles" element={<ArticleView />} />
        <Route path="/lognavbar" element={<LogNavBar />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="createinquiry" element={<CreateForm />} />
          <Route
            path="updateinquiry/:id"
            element={<UpdateSubmittedForm />}
          />
          <Route
            path="deleteinquiry/:id"
            element={<DeleteSubmittedForm />}
          />
          <Route path="aitreatment" element={<AiRecomendationForm />} />
          <Route path="myinquiries" element={<MyInquiries />} />
          <Route path="userprofile" element={<UserProfile />} />
          <Route path="managerresponses" element={<ManagerResponses />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/my-inquiriez" element={<MyInquiriez />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/alert" element={<ManagerAlertForm />} />

        <Route
          path="/manager/alerts/manage"
          element={
            <PrivateRoute allowedRoles={["manager"]}>
              <UpdateAlerts />
            </PrivateRoute>
          }
        />

        {/* Material / AgriStore Routes */}
        <Route path="/agri-store" element={<HomeMaterial />} />
        <Route path="/materials" element={<HomeMaterial />} />
        <Route path="/materials/create" element={<CreateMaterial />} />
        <Route path="/materials/details/:id" element={<ShowMaterial />} />
        <Route path="/materials/edit/:id" element={<EditMaterial />} />
        <Route path="/materials/buy" element={<BuyMaterial />} />
        <Route path="/materials/analytics" element={<SupplierAnalytics />} />

        {/* Health Hub Route */}
        <Route path="/health-hub" element={<HealthHub />} /> {/* 👈 Added Health Hub Route */}

        {/* AI / Plant Disease Routes */}
        <Route path="/plantapi" element={<PlantDiseaseIdentifier />} />
        <Route path="/detect-disease" element={<PlantDiseaseIdentifier />} />
        <Route path="/smart-treatments" element={<SmartTreatments />} />
        <Route path="/disease-map" element={<DiseaseMap />} />
      </Routes>

      {/* Global Floating AI Assistant Widget */}
      <AiAssistant />
    </SnackbarProvider>
  );
};

export default App;