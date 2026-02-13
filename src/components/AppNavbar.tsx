import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Navbar dark color="dark" expand="md" className="px-3">
      <NavbarBrand tag={Link} to="/">
        AnnotateAI
      </NavbarBrand>
      <NavbarToggler onClick={() => setIsOpen(!isOpen)} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <NavLink
              tag={Link}
              to="/"
              active={location.pathname === "/"}
            >
              Annotate
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              tag={Link}
              to="/leaderboard"
              active={location.pathname === "/leaderboard"}
            >
              Leaderboard
            </NavLink>
          </NavItem>
        </Nav>
        {user && (
          <span className="navbar-text font-monospace small">
            {user.username}
          </span>
        )}
      </Collapse>
    </Navbar>
  );
};

export default AppNavbar;
