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
        
        if (documentKey) {
          setDebugInfo(prevInfo => prevInfo + ` | Using secure API with documentKey: ${documentKey}`);
          
          try {
            const apiResponse = await fetch(`/api/documents/${encodeURIComponent(documentKey)}`);
            
            if (!apiResponse.ok) {
              const errorData = await apiResponse.json();
              throw new Error(`API error: ${apiResponse.status} - ${errorData.error || 'Unknown error'}`);
            }
            
            const data = await apiResponse.json();
            
            if (data.url) {
              setDocumentUrl(data.url);
              setDebugInfo(prevInfo => prevInfo + ' | API access successful');
              setLoading(false);
              return;
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setDebugInfo(prevInfo => prevInfo + ` | API error: ${errorMessage}`);
            
            if (fallbackUrl) {
              setDebugInfo(prevInfo => prevInfo + ` | Trying fallback URL`);
            }
          }
        }
        
        if (fallbackUrl) {
          setDebugInfo(prevInfo => prevInfo + ` | Using fallbackUrl: ${fallbackUrl}`);
          setDocumentUrl(fallbackUrl);
          setLoading(false);
          return;
        }
        
        if (!documentKey && !fallbackUrl) {
          setError('No document available');
          setDebugInfo(prevInfo => prevInfo + ' | No document key or URL provided');
        }
      } catch (err) {
        console.error('Error in document viewer:', err);
        setError('Failed to access document.');
        setDebugInfo(prevInfo => prevInfo + ` | General error: ${err instanceof Error ? err.message : String(err)}`);
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