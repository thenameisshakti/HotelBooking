import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faTaxi,
  faUser,
  faCalendar,
  faBriefcase,
  faHotel,
  faMessage,
  faStar,
  faGift,
  faWallet,
  faHandHoldingDollar,
} from "@fortawesome/free-solid-svg-icons";

const DashboardSidebar = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="w-64 bg-white rounded-xl shadow-sm p-4 space-y-1">
      <SidebarItem icon={faCalendar} label="My trips" />
      <SidebarItem
        icon={faBriefcase}
        label="All bookings"
        active={activeSection === "bookings"}
        onClick={() => setActiveSection("bookings")}
      />

      <SidebarItem icon={faHotel} label="Hotels" />

      <SidebarItem icon={faPlane} label="Flights" />
      <SidebarItem icon={faTaxi} label="Taxi" />
      <SidebarItem icon={faMessage} label="Property messages" />
      <SidebarItem
        icon={faStar}
        label="Reviews"
        active={activeSection === "reviews"}
        onClick={() => setActiveSection("reviews")}
      />
      <SidebarItem icon={faGift} label="Gift vouchers" />
      <SidebarItem icon={faWallet} label="Sarai Wallet" />
      <SidebarItem
        icon={faUser}
        label="Profile"
        active={activeSection === "profile"}
        onClick={() => setActiveSection("profile")}
      />
      <SidebarItem
        icon={faHandHoldingDollar}
        label="Refund"
        active={activeSection === "refund"}
        onClick={() => setActiveSection("refund")}
      />
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium
        ${
          active
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-100"
        }
      `}
    >
      <FontAwesomeIcon
        icon={icon}
        className={active ? "text-blue-600" : "text-gray-500"}
      />
      {label}
    </div>
  );
};

export default DashboardSidebar;
