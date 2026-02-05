import React from "react";
import Navbar from "../../components/navbar/Navbar";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import Headers from "../../components/header/Header";
import DashboardTopCards from "../../components/dummydashboardcontent/dummy";
import DashboardSidebar from "../../components/dummydashboardcontent/DashboardSidebar";
import { useState } from "react";
import AllBooking from "../../components/dummydashboardcontent/AllBooking";
import Profile from "../../components/dummydashboardcontent/Profile";
import Refund from "../../components/dummydashboardcontent/Refund";
import MyReviews from "../../components/dummydashboardcontent/MyReviews";

function Dashboard() {
  const [activeSection, setActiveSection] = useState("bookings");

  return (
    <>
      <Navbar />
      <div className="relative bg-[#003580] pb-72">
        <Headers type="dashboard" />
      </div>
      <div className="relative  z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 flex flex-col gap-8">
        <DashboardTopCards />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 mt-22">
            <DashboardSidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
          <div className="col-span-12 md:col-span-9 mt-22">
            {activeSection === "bookings" && <AllBooking />}
            {activeSection === "reviews" && <MyReviews />}
            {activeSection === "profile" && <Profile />}
            {activeSection === "refund" && <Refund />}
          </div>
        </div>
      </div>
      <MailList />
      <Footer />
    </>
  );
}

export default Dashboard;
