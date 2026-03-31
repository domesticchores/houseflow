import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Container,
} from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Profile from "./Profile";

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Navbar color="primary" dark expand="lg" className="justify-space-between">
      <Container className="">
        <NavbarBrand tag={Link} to="/">
          Bits 'n Bytes Imager
        </NavbarBrand>
        <NavbarToggler onClick={() => setIsOpen(!isOpen)} />
        <Collapse isOpen={isOpen} navbar className="justify-content-between">
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
          <Nav className="mw-auto" navbar>
            <Profile/>
          </Nav>
          
        </Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
