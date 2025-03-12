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
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const getDocumentUrl = async () => {
      try {
        setLoading(true);
        setDebugInfo(`Starting document load process`);
        
        // First try direct URL if available
        if (fallbackUrl) {
          setDebugInfo(debugInfo + ` | Found fallbackUrl: ${fallbackUrl}`);
          try {
            const response = await fetch(fallbackUrl, { method: 'HEAD' });
            if (response.ok) {
              setDocumentUrl(fallbackUrl);
              setDebugInfo(debugInfo + ' | Fallback URL successful');
              setLoading(false);
              return;
            } else {
              setDebugInfo(debugInfo + ` | Fallback URL returned ${response.status}`);
            }
          } catch (err) {
            setDebugInfo(debugInfo + ` | Error accessing fallbackUrl: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
        
        // If we have a document key, try to construct direct S3 URL
        if (documentKey) {
          setDebugInfo(debugInfo + ` | Using documentKey: ${documentKey}`);
          
          // Try a few different S3 URL patterns (some may work depending on your setup)
          const baseUrls = [
            'https://store-transition.s3.us-east-2.amazonaws.com/',
            'https://store-transition.s3.amazonaws.com/'
          ];
          
          for (const baseUrl of baseUrls) {
            const fullUrl = baseUrl + encodeURIComponent(documentKey);
            setDebugInfo(debugInfo + ` | Trying S3 URL: ${fullUrl}`);
            
            try {
              const response = await fetch(fullUrl, { method: 'HEAD' });
              if (response.ok) {
                setDocumentUrl(fullUrl);
                setDebugInfo(debugInfo + ' | S3 access successful');
                setLoading(false);
                return;
              } else {
                setDebugInfo(debugInfo + ` | S3 access error: ${response.status}`);
              }
            } catch (err) {
              setDebugInfo(debugInfo + ` | Error fetching from S3: ${err instanceof Error ? err.message : String(err)}`);
            }
          }
          
          // If we get here, we couldn't access the document with the provided key
          setError('Document not accessible');
        } else if (!fallbackUrl) {
          // If we have neither a key nor URL
          setError('No document available');
          setDebugInfo(debugInfo + ' | No document key or URL provided');
        }
      } catch (err) {
        console.error('Error in document viewer:', err);
        setError('Failed to access document.');
        setDebugInfo(debugInfo + ` | General error: ${err instanceof Error ? err.message : String(err)}`);
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
      <div>
        <div className="py-2 text-red-600 flex items-center">
          <AlertCircle size={16} className="mr-2" />
          <span>{error}</span>
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono whitespace-pre-wrap">
          {debugInfo}
        </div>
      </div>
    );
  }

  if (!documentUrl) {
    return (
      <div>
        <div className="py-2 text-yellow-600">
          No document available
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono whitespace-pre-wrap">
          {debugInfo}
        </div>
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