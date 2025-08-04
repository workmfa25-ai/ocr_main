import React, { useState } from 'react';
import { Card, Nav, Button } from 'react-bootstrap';
import { FiDownload, FiEdit } from 'react-icons/fi';
import './DocumentViewer.css';

const DocumentViewer = ({ document }) => {
  const [activeTab, setActiveTab] = useState('original');
  
  if (!document) {
    return null;
  }

  const { fileName, documentType, originalContent, extractedContent } = document;
  
  // Determine if the document is an image or PDF
  const isImage = documentType && typeof documentType === 'string' && documentType.startsWith('image/');
  const isPdf = documentType === 'application/pdf';

  const renderOriginalContent = () => {
    if (isImage) {
      return (
        <div className="document-image-container">
          <img 
            src={originalContent} 
            alt="Original document" 
            className="document-image"
          />
        </div>
      );
    } else if (isPdf) {
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
        <pre className="document-text">{extractedContent}</pre>
      </div>
    );
  };

  const renderJsonView = () => {
    try {
      // Try to parse the extracted content as JSON
      const jsonData = JSON.parse(extractedContent);
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
          <pre className="document-text">{extractedContent}</pre>
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
            <Button variant="outline-primary" size="sm" className="me-2">
              <FiDownload /> Export to Excel
            </Button>
            <Button variant="outline-secondary" size="sm">
              <FiEdit /> Save Changes
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