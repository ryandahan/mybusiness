'use client'

import { useEffect, useState } from 'react';
import { FileText, ExternalLink, AlertCircle } from 'lucide-react';

interface DocumentViewerProps {
  documentKey?: string;
  fallbackUrl?: string | null;
}

export default function DocumentViewer({ documentKey, fallbackUrl }: DocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDocumentUrl = async () => {
      try {
        setLoading(true);
        
        if (fallbackUrl) {
          try {
            const response = await fetch(fallbackUrl, { method: 'HEAD' });
            if (response.ok) {
              setDocumentUrl(fallbackUrl);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.log('Fallback URL not accessible, trying S3 direct access');
          }
        }
        
        if (documentKey) {
          const baseUrl = 'https://store-transition.s3.us-east-2.amazonaws.com/';
          const fullUrl = baseUrl + documentKey;
          
          try {
            const response = await fetch(fullUrl, { method: 'HEAD' });
            
            if (response.ok) {
              setDocumentUrl(fullUrl);
            } else {
              throw new Error(`Document access error: ${response.status}`);
            }
          } catch (err) {
            console.error('Error accessing document from S3:', err);
            setError('Unable to access the document. S3 access error.');
          }
        } else {
          setError('No document path available');
        }
      } catch (err) {
        console.error('Error in document viewer:', err);
        setError('Failed to access document.');
      } finally {
        setLoading(false);
      }
    };

    getDocumentUrl();
  }, [documentKey, fallbackUrl]);

  if (loading) {
    return (
      <div className="py-2 flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <span>Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 text-red-600 flex items-center">
        <AlertCircle size={16} className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (!documentUrl) {
    return (
      <div className="py-2 text-yellow-600">
        No document available
      </div>
    );
  }

  const isPdf = documentUrl.toLowerCase().endsWith('.pdf');

  return (
    <div>
      <a 
        href={documentUrl}
        target="_blank"
        rel="noopener noreferrer" 
        className="inline-flex items-center text-blue-600 hover:underline"
      >
        <FileText size={16} className="mr-2" />
        View Document
        <ExternalLink size={14} className="ml-1" />
      </a>
      
      {isPdf && (
        <div className="mt-2">
          <iframe 
            src={`${documentUrl}#toolbar=0`}
            className="w-full h-80 border rounded"
            title="Document Preview"
          />
        </div>
      )}
    </div>
  );
}