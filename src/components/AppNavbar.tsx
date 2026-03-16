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
import Profile from "./Profile";

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Navbar color="primary" dark expand="lg">
      <NavbarBrand tag={Link} to="/">
        Bits 'n Bytes Imager
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
        {/* {user && (
          <span className="navbar-text font-monospace small">
            {user.username}
          </span>
        )} */}
        <Profile/>
      </Collapse>
    </Navbar>
  );
};

export default AppNavbar;
