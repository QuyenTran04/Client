import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Companions", href: "/companions" },
  { label: "My Journey", href: "/my-journey" },
];

const NavItems = () => {
  return (
    <nav className="flex items-center gap-4">
      {navItems.map(({ label, href }) => (
        <NavLink
          to={href}
          key={label}
          className={({ isActive }) => (isActive ? "text-primary font-semibold" : "")}
          end
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavItems;
