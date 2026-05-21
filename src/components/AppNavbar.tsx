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

  // update env to add new users
  const adminUsers: Array<string> = import.meta.env.VITE_ADMIN_USERS ?? ["xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx"]

  return (
    <Navbar color="primary" dark expand="lg" className="justify-space-between">
      <Container className="">
        <NavbarBrand tag={Link} to="/">
          Houseflow
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
            {/* admin panel */}
            {adminUsers.includes(user?.uuid) && <>
              <NavItem>
                <NavLink
                  tag={Link}
                  to="/admin"
                  active={location.pathname === "/admin"}
                >
                  Admin
                </NavLink>
              </NavItem>
              <NavItem>
              <NavLink
                tag={Link}
                to="/upload"
                active={location.pathname === "/upload"}
              >
                Upload
              </NavLink>
            </NavItem>
            </>}
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
