import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import ReactDiffViewer from 'react-diff-viewer-continued';
import './ComparisonView.css';

const ComparisonView = ({ document, onSaveChanges }) => {
  const [showDiff, setShowDiff] = useState(true);
  const [splitView, setSplitView] = useState(true);
  const [editedExtracted, setEditedExtracted] = useState(document?.extractedContent || '');

  if (!document || !document.originalContent || !document.extractedContent) {
    return null;
  }

  const { originalContent, extractedContent } = document;

  const customStyles = {
    variables: {
      light: {
        diffViewerBackground: '#f8f9fa',
        diffViewerColor: '#212529',
        addedBackground: '#e6ffed',
        addedColor: '#24292e',
        removedBackground: '#ffeef0',
        removedColor: '#24292e',
        wordAddedBackground: '#acf2bd',
        wordRemovedBackground: '#fdb8c0',
        addedGutterBackground: '#cdffd8',
        removedGutterBackground: '#ffdce0',
        gutterBackground: '#f8f9fa',
        gutterBackgroundDark: '#f1f1f1',
        highlightBackground: '#fffbdd',
        highlightGutterBackground: '#fff5b1',
      },
    },
    line: {
      padding: '10px 2px',
      '&:hover': {
        background: '#f1f8ff',
      },
    },
    content: {
      width: '100%',
    },
  };

  const handleSave = () => {
    if (onSaveChanges) {
      onSaveChanges(editedExtracted);
    }
  };

  return (
    <Card className="comparison-view">
      <Card.Header>
        <div className="comparison-header">
          <h5>Document Comparison</h5>
          <div className="comparison-controls">
            <Form.Check 
              type="switch"
              id="diff-switch"
              label="Show Differences"
              checked={showDiff}
              onChange={(e) => setShowDiff(e.target.checked)}
              className="me-3"
            />
            <Form.Check 
              type="switch"
              id="split-switch"
              label="Split View"
              checked={splitView}
              onChange={(e) => setSplitView(e.target.checked)}
              disabled={!showDiff}
            />
          </div>
        </div>
      </Card.Header>
      <Card.Body className="comparison-body">
        {showDiff ? (
          <ReactDiffViewer
            oldValue={originalContent}
            newValue={editedExtracted}
            splitView={splitView}
            disableWordDiff={false}
            showDiffOnly={false}
            hideLineNumbers={false}
            extraLinesSurroundingDiff={3}
            useDarkTheme={false}
            styles={customStyles}
            leftTitle="Original Document"
            rightTitle="Extracted Text"
          />
        ) : (
          <Row>
            <Col md={6} sm={12} className="comparison-col">
              <div className="comparison-label mb-2">Original Document</div>
              <pre className="comparison-pre">{originalContent}</pre>
            </Col>
            <Col md={6} sm={12} className="comparison-col">
              <div className="comparison-label mb-2">Extracted Text (Editable)</div>
              <Form.Control
                as="textarea"
                rows={Math.max(10, originalContent.split('\n').length)}
                value={editedExtracted}
                onChange={e => setEditedExtracted(e.target.value)}
                className="mb-3 comparison-textarea"
                style={{ fontFamily: 'monospace', fontSize: 14 }}
              />
              <Button variant="success" size="sm" onClick={handleSave}>
                Save
              </Button>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default ComparisonView;