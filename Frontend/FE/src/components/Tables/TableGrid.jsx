import React, { useState, useEffect } from 'react';
import { getTables, createTable } from '../../api/tableApi';
import TableCard from './TableCard';

function TableGrid() {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await getTables();
      setTables(res.data.sort((a,b) => a.id - b.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTable = async () => {
    if (!newTableName.trim()) return;
    try {
      await createTable({ name: newTableName, status: 'AVAILABLE' });
      setNewTableName('');
      fetchTables();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input 
          className="form-control" 
          style={{ maxWidth: '200px' }}
          placeholder="Tên bàn mới" 
          value={newTableName}
          onChange={e => setNewTableName(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleAddTable}>Thêm Bàn</button>
      </div>
      <div className="grid grid-cols-4">
        {tables.map(table => (
          <TableCard key={table.id} table={table} onRefresh={fetchTables} />
        ))}
      </div>
    </div>
  );
}

export default TableGrid;