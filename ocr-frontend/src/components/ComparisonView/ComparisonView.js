import React, { useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import ReactDiffViewer from 'react-diff-viewer-continued';
import './ComparisonView.css';

const ComparisonView = ({ document }) => {
  const [showDiff, setShowDiff] = useState(true);
  const [splitView, setSplitView] = useState(true);
  
  if (!document || !document.originalContent || !document.extractedContent) {
    return null;
  }

  const { originalContent, extractedContent } = document;

  // Custom styling for the diff viewer
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
            />
          </div>
        </div>
      </Card.Header>
      <Card.Body className="comparison-body">
        <ReactDiffViewer
          oldValue={originalContent}
          newValue={extractedContent}
          splitView={splitView}
          disableWordDiff={!showDiff}
          showDiffOnly={false}
          hideLineNumbers={false}
          extraLinesSurroundingDiff={3}
          useDarkTheme={false}
          styles={customStyles}
          leftTitle="Original Document"
          rightTitle="Extracted Text"
        />
      </Card.Body>
    </Card>
  );
};

export default ComparisonView;