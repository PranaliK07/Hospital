// src/components/Table.jsx
import React, { useState } from 'react';
import { Table, Button, Badge, Form, InputGroup, FormControl, Pagination } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const DataTable = ({ columns, data, onEdit, onDelete, title, renderActions }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtering
  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const resolveStatusVariant = (value) => {
    const status = String(value || '').toLowerCase();
    if (['paid', 'completed', 'discharged'].includes(status)) return 'success';
    if (['canceled', 'cancelled', 'overdue'].includes(status)) return 'danger';
    return 'warning';
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h5>{title}</h5>
        <InputGroup style={{ width: '300px' }}>
          <FormControl
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroup.Text><FaSearch /></InputGroup.Text>
        </InputGroup>
      </div>

      <div className="table-responsive">
        <Table striped hover>
          <thead>
            <tr>
              {columns.map((col, idx) => <th key={idx}>{col.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, cIdx) => {
                    const rawValue = row[col.field];
                    const displayValue = col.format ? col.format(rawValue, row) : rawValue;
                    const showBadge = col.badge !== false && col.field === 'status';
                    return (
                      <td key={cIdx}>
                        {showBadge ? (
                          <Badge bg={col.badgeVariant ? col.badgeVariant(rawValue, row) : resolveStatusVariant(rawValue)}>
                            {displayValue}
                          </Badge>
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                  <td>
                    {renderActions ? renderActions(row) : null}
                    {onEdit && (
                      <Button variant="link" className="me-2 text-primary" onClick={() => onEdit(row)}>
                        <FaEdit />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="link" className="text-danger" onClick={() => onDelete(row.id)}>
                        <FaTrash />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center">No data found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries</span>
        <Pagination>
          {[...Array(totalPages).keys()].map(num => (
            <Pagination.Item key={num + 1} active={num + 1 === currentPage} onClick={() => handlePageChange(num + 1)}>
              {num + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
};

export default DataTable;
