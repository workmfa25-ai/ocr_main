// Mock service for OCR processing
// Will be replaced with actual API calls in production

// Simulate OCR processing with mock data for development
const simulateOcrProcessing = (file) => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Mock extracted content based on file type
      let extractedContent = '';
      
      if (file.type.includes('image')) {
        extractedContent = `DOCUMENT CONTENT

Document Information

ID: DOC-2023-002
Title: Sample Image Document
Date: 05/15/2023
Reference: REF-2023-002
Category: Image
Status: Active

A. DESCRIPTION

[Additional document description would appear here]`;
      } else if (file.type === 'application/pdf') {
        extractedContent = `DOCUMENT CONTENT

Document Information

ID: DOC-2023-003
Title: Sample PDF Document
Date: 06/20/2023
Reference: REF-2023-003
Category: PDF
Status: Active

A. DESCRIPTION

[Additional document description would appear here]`;
      } else {
        extractedContent = `Sample extracted content for ${file.name}\nThis is a simulation of OCR processing.\nThe actual content would depend on the file contents.`;
      }
      
      resolve({
        success: true,
        extractedContent,
        confidence: 0.92,
        processingTimeMs: 1243
      });
    }, 2000);
  });
};

// Function to upload a file and process it with OCR
export const processDocument = async (file, documentType) => {
  try {
    // This would be an API call in a real application
    return await simulateOcrProcessing(file);
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};

// Function to get a list of processed documents
export const getDocumentsList = async () => {
  // This would be an API call in a real application
  // In a real implementation, this would be wrapped in try-catch
  return [
    {
      id: 1,
      fileName: 'sample1.pdf',
      documentType: 'application/pdf',
      createdAt: '2025-07-15T06:07:02.151026Z'
    },
    {
      id: 2,
      fileName: 'sample1.pdf',
      documentType: 'application/pdf',
      createdAt: '2025-07-15T06:11:18.521557Z'
    },
    {
      id: 3,
      fileName: 'sample1.png',
      documentType: 'image/png',
      createdAt: '2025-07-15T07:50:46.833785Z'
    },
    {
      id: 4,
      fileName: 'sample1.png',
      documentType: 'image/png',
      createdAt: '2025-07-15T07:51:37.414427Z'
    },
    {
      id: 5,
      fileName: 'sample1.png',
      documentType: 'image/png',
      createdAt: '2025-07-15T07:52:44.203495Z'
    }
  ];
};

// Function to get a specific document by ID
export const getDocumentById = async (documentId) => {
  try {
    // This would be an API call in a real application
    return {
      id: documentId,
      fileName: 'sample1.pdf',
      documentType: 'application/pdf',
      createdAt: '2025-07-28T07:58:20.261236Z',
      originalContent: 'DOCUMENT CONTENT\n\nDocument ID: DOC-2023-001\nTitle: Sample Document\nDate: 02/10/2023\nReference: REF-2023-001\nCategory: General\nStatus: Active',
      extractedContent: 'DOCUMENT CONTENT\n\nDocument Information\n\nID: DOC-2023-001\nTitle: Sample Document\nDate: 02/10/2023\nReference: REF-2023-001\nCategory: General\nStatus: Active',
      confidence: 0.89
    };
  } catch (error) {
    console.error(`Error fetching document with ID ${documentId}:`, error);
    throw error;
  }
};