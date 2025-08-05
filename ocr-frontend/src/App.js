import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Navbar, Nav } from 'react-bootstrap';
import { FiEye, FiUpload, FiList, FiFileText, FiMessageSquare } from 'react-icons/fi';
import FileUpload from './components/FileUpload/FileUpload';
import DocumentViewer from './components/DocumentViewer/DocumentViewer';
import ComparisonView from './components/ComparisonView/ComparisonView';
import ChatBot from './components/ChatBot/ChatBot';
import { processDocument, getDocumentsList, getDocumentById } from './services/ocrService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('upload');
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch documents list on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const documentsList = await getDocumentsList();
        setDocuments(documentsList);
      } catch (err) {
        setError('Failed to fetch documents list');
        console.error(err);
      }
    };

    fetchDocuments();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file, documentType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Process the document with OCR
      const result = await processDocument(file, documentType);
      
      // Create a URL for the uploaded file to display it
      const fileUrl = URL.createObjectURL(file);
      
      // Create a new document object with the processed data
      const newDocument = {
        id: Date.now().toString(),
        fileName: file.name,
        documentType: documentType,
        createdAt: new Date().toISOString(),
        originalContent: fileUrl,
        extractedContent: result.extractedContent,
        confidence: result.confidence
      };
      
      // Add the new document to the list
      setDocuments([newDocument, ...documents]);
      
      // Select the new document
      setSelectedDocument(newDocument);
      
      // Switch to the viewer
      setActiveView('viewer');
    } catch (err) {
      setError('Failed to process document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle document selection
  const handleDocumentSelect = async (documentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const document = await getDocumentById(documentId);
      setSelectedDocument(document);
      setActiveView('viewer');
    } catch (err) {
      setError('Failed to fetch document details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle save changes from DocumentViewer
  const handleSaveChanges = (updatedContent) => {
    if (selectedDocument) {
      const updatedDocument = {
        ...selectedDocument,
        extractedContent: updatedContent
      };
      setSelectedDocument(updatedDocument);
      
      // Update the document in the documents list
      setDocuments(documents.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      ));
    }
  };

  // Render the active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'upload':
        return <FileUpload onUploadComplete={handleFileUpload} />;
      case 'viewer':
        if (!selectedDocument) {
          return <div className="text-center">No document selected</div>;
        }
        
        return (
          <div className="viewer-container">
            <DocumentViewer 
              document={selectedDocument} 
              onSaveChanges={handleSaveChanges}
            />
            <ComparisonView document={selectedDocument} />
          </div>
        );
      case 'list':
        return (
          <div className="file-list-container">
            <h5>OCR Documents</h5>
            <Table striped hover responsive className="file-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Document Name</th>
                  <th>Document Type</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.fileName}</td>
                    <td>{doc.documentType}</td>
                    <td>{new Date(doc.createdAt).toLocaleString()}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="action-btn"
                        onClick={() => handleDocumentSelect(doc.id)}
                      >
                        <FiEye />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
      default:
        // Redirect to upload view if an invalid view is selected
        setActiveView('upload');
        return null;
    }
  };

  return (
    <div className="app">
      <Navbar variant="dark" expand="lg" className="mb-4" style={{ background: '#111184' }}>
        <Container>
          <Navbar.Brand href="#">
            <FiFileText className="me-2" />
            Optical Character Recognition
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link 
                active={activeView === 'upload'}
                onClick={() => setActiveView('upload')}
                className={activeView === 'upload' ? 'active-military-nav' : ''}
              >
                <FiUpload className="me-1" /> Upload
              </Nav.Link>
              <Nav.Link 
                active={activeView === 'list'}
                onClick={() => setActiveView('list')}
                className={activeView === 'list' ? 'active-military-nav' : ''}
              >
                <FiList className="me-1" /> Documents
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4 mb-5">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Processing document...</p>
          </div>
        ) : (
          renderActiveView()
        )}
      </Container>

      <footer className="footer">
        <Container>
          <span className="text-white">© 2025 OCR. All rights reserved.</span>
        </Container>
      </footer>
      
      {/* Floating Chat Bot Button */}
      <button
        className="chatbot-btn"
        onClick={() => setIsChatOpen(true)}
        aria-label="Open chat bot"
      >
        <FiMessageSquare size={28} />
      </button>
      
      {/* Chat Bot Modal */}
      <ChatBot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
}

export default App;
