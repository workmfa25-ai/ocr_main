import React, { useState, useEffect } from 'react';
import { Card, Nav, Button } from 'react-bootstrap';
import { FiSave } from 'react-icons/fi';
import './DocumentViewer.css';

const DocumentViewer = ({ document, onSaveChanges }) => {
  const [activeTab, setActiveTab] = useState('original');
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize edited content when document changes
  useEffect(() => {
    if (document && document.extractedContent) {
      setEditedContent(document.extractedContent);
    }
  }, [document]);
  
  if (!document) {
    return null;
  }

  const { fileName, documentType, originalContent, extractedContent } = document;

  const handleSave = () => {
    if (onSaveChanges) {
      onSaveChanges(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(extractedContent || '');
    setIsEditing(false);
  };

  const handleExport = (type) => {
    let dataStr, fileName, mimeType;
    if (type === 'json') {
      dataStr = JSON.stringify(editedContent, null, 2);
      fileName = fileName ? fileName.replace(/\.[^/.]+$/, '') + '.json' : 'document.json';
      mimeType = 'application/json';
    } else if (type === 'csv') {
      // Simple CSV: split lines, comma join, not for nested data
      const lines = editedContent.split('\n');
      dataStr = lines.map(line => '"' + line.replace(/"/g, '""') + '"').join(',\n');
      fileName = fileName ? fileName.replace(/\.[^/.]+$/, '') + '.csv' : 'document.csv';
      mimeType = 'text/csv';
    } else if (type === 'excel') {
      // Excel: use CSV format but with .xls extension
      const lines = editedContent.split('\n');
      dataStr = lines.map(line => '"' + line.replace(/"/g, '""') + '"').join(',\n');
      fileName = fileName ? fileName.replace(/\.[^/.]+$/, '') + '.xls' : 'document.xls';
      mimeType = 'application/vnd.ms-excel';
    }
    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOriginalContent = () => {
    if (documentType && documentType.startsWith('image/')) {
      return (
        <div className="document-image-container">
          <img 
            src={originalContent} 
            alt="Original document" 
            className="document-image"
          />
        </div>
      );
    } else if (documentType === 'application/pdf') {
      return (
        <div className="document-pdf-container">
          <iframe 
            src={originalContent} 
            title="Original PDF document"
            className="document-pdf"
          />
        </div>
      );
    } else {
      return (
        <div className="document-text-container">
          <pre className="document-text">{originalContent}</pre>
        </div>
      );
    }
  };

  const renderExtractedContent = () => {
    return (
      <div className="document-text-container">
        <div className="extracted-content-header mb-3">
          <Button 
            variant={isEditing ? "outline-secondary" : "outline-primary"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="me-2"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Text'}
          </Button>
          {isEditing && (
            <Button 
              variant="success" 
              size="sm"
              onClick={handleSave}
            >
              <FiSave /> Save Changes
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="form-control document-textarea"
            rows="20"
            placeholder="Edit extracted content here..."
          />
        ) : (
          <pre className="document-text">{editedContent}</pre>
        )}
      </div>
    );
  };

  const renderJsonView = () => {
    try {
      const jsonData = JSON.parse(editedContent);
      return (
        <div className="document-json-container">
          <pre className="document-json">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      );
    } catch (error) {
      return (
        <div className="document-text-container">
          <p className="text-danger">Unable to parse as JSON</p>
          <pre className="document-text">{editedContent}</pre>
        </div>
      );
    }
  };

  return (
    <Card className="document-viewer">
      <Card.Header>
        <div className="document-header">
          <h5>{fileName}</h5>
          <div className="document-actions">
            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleExport('csv')}>
              Export as CSV
            </Button>
            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleExport('json')}>
              Export as JSON
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => handleExport('excel')}>
              Export to Excel
            </Button>
          </div>
        </div>
        <Nav variant="tabs" className="mt-2">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'original'}
              onClick={() => setActiveTab('original')}
            >
              Original Document
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'extracted'}
              onClick={() => setActiveTab('extracted')}
            >
              Extracted View
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'json'}
              onClick={() => setActiveTab('json')}
            >
              JSON View
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body className="document-body">
        {activeTab === 'original' && renderOriginalContent()}
        {activeTab === 'extracted' && renderExtractedContent()}
        {activeTab === 'json' && renderJsonView()}
      </Card.Body>
    </Card>
  );
};

export default DocumentViewer;