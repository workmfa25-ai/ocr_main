import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Form, Alert, Spinner, Container, Row } from 'react-bootstrap';
import { FiUploadCloud, FiFile,FiCheckCircle, FiInfo } from 'react-icons/fi';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('PDF');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadStatus(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setUploadStatus(null);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the onUploadComplete callback with the file and document type
      onUploadComplete(file, documentType);
      
      setUploadStatus({ type: 'success', message: 'File uploaded successfully!' });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ type: 'danger', message: 'Failed to upload file. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Container fluid className="p-0">
      <div className="upload-container">
        <div className="upload-header">
          <h4><span className="military-badge">SECURE</span> DOCUMENT PROCESSING</h4>
          <p>Upload documents for secure processing and text extraction</p>
          <div className="security-indicator">
            <div className="security-pulse"></div>
            <span>SECURE TRANSMISSION ACTIVE</span>
          </div>
        </div>
        
        <div className="p-4">
          <Row>
            {/* <Col lg={4} md={12}>
              <div className="upload-info-panel">
                <div className="panel-header">
                  <div className="military-badge">DOCUMENT PROCESSING</div>
                </div>
                
                <div className="security-clearance-info">
                  <div className="clearance-row">
                    <span className="clearance-label">AUTHORIZATION:</span>
                    <span className="clearance-value">LEVEL 5</span>
                  </div>
                  <div className="clearance-row">
                    <span className="clearance-label">ENCRYPTION:</span>
                    <span className="clearance-value">0000</span>
                  </div>
                  <div className="clearance-row">
                    <span className="clearance-label">PROTOCOL:</span>
                    <span className="clearance-value">Aplha-7</span>
                  </div>
                </div>
                
                <h6 className="capabilities-header">SYSTEM CAPABILITIES</h6>
                <ul className="feature-list">
                  <li>
                    <FiShield className="feature-icon" /> Secure Document Processing
                  </li>
                  <li>
                    <FiFileText className="feature-icon" /> Advanced OCR Technology
                  </li>
                  <li>
                    <FiSearch className="feature-icon" /> Advanced Intelligence Extraction
                  </li>
                  <li>
                    <FiLayers className="feature-icon" /> Tactical Document Comparison
                  </li>
                  <li>
                    <FiLock className="feature-icon" /> End-to-End Encryption
                  </li>
                </ul>

                <div className="upload-tips">
                  <h6>SECURITY PROTOCOLS:</h6>
                  <ul>
                    <li>All uploads are encrypted</li>
                    <li>Documents are processed in a secure, isolated environment</li>
                    <li>Maximum file size: 100 MB</li>
                    <li>Automatic audit logging of all document access</li>
                  </ul>
                </div>
              </div>
            </Col> */}
            
            {/* <Col lg={8} md={12}> */}
              <Form.Group className="mb-4">
                <Form.Label>Document Type</Form.Label>
                <Form.Select 
                  className="modern-select"
                  value={documentType} 
                  onChange={(e) => setDocumentType(e.target.value)}
                >
              <option value="PDF">PDF</option>
              <option value="JPEG">JPEG</option>
              <option value="JPG">JPG</option>
              <option value="TXT">TXT</option>
              <option value="PNG">PNG</option>
                </Form.Select>
              </Form.Group>

              <div 
                {...getRootProps()} 
                className={`modern-dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
              >
                <input {...getInputProps()} />
                {!file ? (
                  <>
                    <div className="upload-icon">
                      <FiUploadCloud size={40} color="#2c5050" />
                    </div>
                    <div className="clearance-level">FILE UPLOAD</div>
                    <p>Drag & Drop your document here</p>
                    <p>or <span className="browse-text">browse</span> for secure storage</p>
                    <p className="supported-formats">Supported formats: PDF, JPG, PNG, TXT</p>
                    <div className="security-notice">All files are encrypted and processed in a secure environment</div>
                  </>
                ) : (
                  <div className="selected-file">
                    <div className="file-icon">
                      <FiFile size={24} />
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary"
                  className="military-button" 
                  onClick={handleUpload} 
                  disabled={!file || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      <span className="ms-2">PROCESSING UPLOAD...</span>
                    </>
                  ) : (
                    <>
                      <span className="button-text">INITIATE UPLOAD</span>
                      <span className="button-icon">&#9650;</span>
                    </>
                  )}
                </Button>
              </div>

              {uploadStatus && (
                <Alert className={`modern-alert alert-${uploadStatus.type} mt-3`}>
                  {uploadStatus.type === 'success' ? <FiCheckCircle className="me-2" /> : <FiInfo className="me-2" />}
                  {uploadStatus.message}
                </Alert>
              )}
            {/* </Col> */}
          </Row>
        </div>
      </div>
    </Container>
  );
};

export default FileUpload;