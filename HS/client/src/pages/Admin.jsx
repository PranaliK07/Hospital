import React from "react";
import TopNavbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Container, Table, Button } from "react-bootstrap";

const Admins = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <TopNavbar />
        <Container fluid className="p-4">
          <h2 className="mb-4">Admins</h2>
          <Button className="mb-3">Add Admin</Button>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Render admins dynamically */}
            </tbody>
          </Table>
        </Container>
      </div>
    </div>
  );
};

export default Admins;