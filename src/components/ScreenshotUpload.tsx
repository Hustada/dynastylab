import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTeamStore } from '../stores/teamStore';
import { orchestrator, type OrchestratorEvent, type ScreenType, type ScreenshotAnalysisResult } from '../services/ScreenshotOrchestrator';
import { DataReviewModal } from './DataReviewModal';
import { ImportSuccess } from './ImportSuccess';

interface ScreenshotType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  example?: string;
  category: 'season' | 'game' | 'roster' | 'recruiting' | 'coaching';
}

const SCREENSHOT_TYPES: ScreenshotType[] = [
  {
    id: 'season-standings',
    name: 'Season Standings',
    description: 'Conference standings showing W-L record and ranking',
    required: true,
    category: 'season'
  },
  {
    id: 'team-stats',
    name: 'Team Stats',
    description: 'Season statistics page showing offensive/defensive stats',
    required: true,
    category: 'season'
  },
  {
    id: 'recent-games',
    name: 'Recent Games',
    description: 'Schedule showing recent game results and scores',
    required: true,
    category: 'game'
  },
  {
    id: 'roster-overview',
    name: 'Roster Overview',
    description: 'Main roster screen with overall ratings',
    required: false,
    category: 'roster'
  },
  {
    id: 'depth-chart',
    name: 'Depth Chart',
    description: 'Team depth chart showing starters and backups',
    required: false,
    category: 'roster'
  },
  {
    id: 'recruiting-board',
    name: 'Recruiting Board',
    description: 'Current recruiting class and top targets',
    required: false,
    category: 'recruiting'
  },
  {
    id: 'coach-info',
    name: 'Coach Information',
    description: 'Coaching staff screen with records and contracts',
    required: false,
    category: 'coaching'
  },
  {
    id: 'trophy-case',
    name: 'Trophy Case',
    description: 'Awards and championships won',
    required: false,
    category: 'season'
  }
];

interface UploadedFile {
  file: File;
  preview: string;
  type?: ScreenType;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: any;
  processingEvents?: OrchestratorEvent[];
}

export function ScreenshotUpload() {
  const userTeam = useTeamStore(state => state.getUserTeam());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Array<{
    fileName: string;
    analysis: ScreenshotAnalysisResult;
  }>>([]);
  const [autoApprove, setAutoApprove] = useState(() => {
    return localStorage.getItem('dynastylab-auto-approve') === 'true';
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importedResults, setImportedResults] = useState<Array<{
    fileName: string;
    analysis: ScreenshotAnalysisResult;
  }>>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setShowGuide(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true
  });

  // Subscribe to orchestrator events
  useEffect(() => {
    const unsubscribe = orchestrator.subscribe((event: OrchestratorEvent) => {
      console.log('Orchestrator event:', event);
      // Update UI based on events if needed
    });
    
    return unsubscribe;
  }, []);

  const processScreenshots = async () => {
    console.log('🎬 Starting screenshot processing batch', {
      fileCount: uploadedFiles.length,
      autoApprove
    });
    
    setIsProcessing(true);
    const results: Array<{ fileName: string; analysis: ScreenshotAnalysisResult }> = [];
    
    // Process each screenshot
    for (let i = 0; i < uploadedFiles.length; i++) {
      if (uploadedFiles[i].status !== 'pending') continue;
      
      const file = uploadedFiles[i];
      const events: OrchestratorEvent[] = [];
      
      console.log(`📸 Processing screenshot ${i + 1}/${uploadedFiles.length}: ${file.file.name}`);
      
      setUploadedFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing', processingEvents: events } : f
      ));

      try {
        // Create a local URL for the image
        const imageUrl = file.preview;
        
        // Set up event listener for this specific screenshot
        const unsubscribe = orchestrator.subscribe((event) => {
          events.push(event);
          setUploadedFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, processingEvents: [...events] } : f
          ));
        });
        
        // Process with orchestrator (but don't route data yet)
        const result = await orchestrator.processScreenshot(imageUrl, !autoApprove); // Pass flag to skip routing
        
        // Clean up event listener
        unsubscribe();
        
        console.log(`✅ Screenshot processed: ${file.file.name}`, {
          screenType: result.screenType,
          confidence: `${(result.confidence * 100).toFixed(1)}%`,
          team: result.detectedTeam
        });
        
        // Collect results
        results.push({
          fileName: file.file.name,
          analysis: result
        });
        
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'completed',
            type: result.screenType,
            extractedData: result.extractedData,
            processingEvents: events
          } : f
        ));
      } catch (error) {
        console.error(`❌ Error processing screenshot ${file.file.name}:`, error);
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' } : f
        ));
      }
    }
    
    setIsProcessing(false);
    console.log(`🎉 Batch processing complete. Processed ${results.length} screenshots`);
    
    // Show review modal if not auto-approving
    if (results.length > 0 && !autoApprove) {
      console.log('📋 Showing review modal for user confirmation');
      setAnalysisResults(results);
      setShowReviewModal(true);
    } else if (results.length > 0) {
      // Auto-approve: route all data
      console.log('🚀 Auto-approving and importing data');
      await confirmDataImport(results);
    }
  };
  
  const confirmDataImport = async (results: Array<{ fileName: string; analysis: ScreenshotAnalysisResult }>) => {
    // Route all the data and collect generated content
    const updatedResults = await Promise.all(results.map(async (result) => {
      const generatedContent = await orchestrator.routeExtractedData(
        result.analysis.screenType, 
        result.analysis.extractedData
      );
      
      // Update the analysis with generated content info
      return {
        ...result,
        analysis: {
          ...result.analysis,
          generatedContent
        }
      };
    }));
    
    // Clear uploaded files after successful import
    setUploadedFiles([]);
    setShowReviewModal(false);
    
    // Show success modal with updated results
    setImportedResults(updatedResults);
    setShowSuccessModal(true);
    
    console.log('Data imported successfully!', {
      totalImported: updatedResults.length,
      contentGenerated: updatedResults.flatMap(r => r.analysis.generatedContent || [])
    });
  };
  
  const handleReject = () => {
    // Clear results and let user try again
    setAnalysisResults([]);
    setShowReviewModal(false);
    setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'pending' as const })));
  };
  
  const handleAutoApproveChange = (value: boolean) => {
    setAutoApprove(value);
    localStorage.setItem('dynastylab-auto-approve', value.toString());
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
    }
  };

  const getCompletionStats = () => {
    const completed = uploadedFiles.filter(f => f.status === 'completed');
    const required = SCREENSHOT_TYPES.filter(t => t.required);
    const optional = SCREENSHOT_TYPES.filter(t => !t.required);
    
    return {
      requiredCount: required.length,
      optionalCount: optional.length,
      completedCount: completed.length
    };
  };

  const stats = getCompletionStats();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Dynasty Data</h1>
        <p className="text-gray-600">
          Upload screenshots from CFB 25 to automatically import your dynasty data
        </p>
      </div>

      {showGuide && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📸</span>
            Screenshot Guide
          </h2>
          <p className="mb-4 text-gray-700">
            For the best AI-generated content, capture these screens from your dynasty:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-red-600 mb-2">🎯 Required Screenshots</h3>
              <ul className="space-y-2">
                {SCREENSHOT_TYPES.filter(t => t.required).map(type => (
                  <li key={type.id} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <div>
                      <span className="font-medium">{type.name}</span>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">➕ Optional (Enhances Content)</h3>
              <ul className="space-y-2">
                {SCREENSHOT_TYPES.filter(t => !t.required).map(type => (
                  <li key={type.id} className="flex items-start">
                    <span className="text-blue-500 mr-2">○</span>
                    <div>
                      <span className="font-medium">{type.name}</span>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm">
              <strong>💡 Pro Tip:</strong> Take screenshots in order and upload them all at once. 
              The AI will automatically identify each screen type and extract the relevant data.
            </p>
          </div>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📤</div>
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop screenshots here' : 'Drag & drop screenshots here'}
          </p>
          <p className="text-sm text-gray-500">or click to select files</p>
          <p className="text-xs text-gray-400">Supports PNG, JPG, JPEG, GIF, WebP</p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Uploaded Screenshots ({uploadedFiles.length})
            </h3>
            <div className="text-sm text-gray-600">
              {stats.completedCount} processed • {stats.requiredCount} required • {stats.optionalCount} optional
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={file.preview}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {file.status === 'processing' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white">Processing...</div>
                    </div>
                  )}
                </div>
                
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                  {getStatusIcon(file.status)}
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                
                {file.type && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
                    {file.type === 'unknown' ? 'Unknown Screen' : file.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </div>
                )}
                
                {file.processingEvents && file.processingEvents.length > 0 && (
                  <div className="absolute inset-x-2 bottom-10 bg-white bg-opacity-90 rounded p-2 text-xs">
                    <div className="font-semibold mb-1">Processing Steps:</div>
                    {file.processingEvents.slice(-3).map((event, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className={`${event.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                          {event.type === 'error' ? '❌' : '✓'}
                        </span>
                        <span className="truncate">{event.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            {isProcessing && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <div>
                    <p className="font-medium text-blue-900">Processing screenshots...</p>
                    <p className="text-sm text-blue-700">
                      Analyzing {uploadedFiles.filter(f => f.status === 'processing').length || 1} of {uploadedFiles.length} screenshots
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setUploadedFiles([])}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Clear All
              </button>
              <button
                onClick={processScreenshots}
                className="btn-primary relative"
                disabled={isProcessing || uploadedFiles.every(f => f.status !== 'pending')}
              >
                {isProcessing ? (
                  <>
                    <span className="opacity-0">Process Screenshots</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="animate-pulse">Processing...</span>
                    </span>
                  </>
                ) : (
                  'Process Screenshots'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showGuide && uploadedFiles.length === 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowGuide(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            Show Screenshot Guide
          </button>
        </div>
      )}
      
      <DataReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={() => confirmDataImport(analysisResults)}
        onReject={handleReject}
        results={analysisResults}
        autoApprove={autoApprove}
        onAutoApproveChange={handleAutoApproveChange}
      />
      
      <ImportSuccess
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setImportedResults([]);
        }}
        results={importedResults}
      />
    </div>
  );
}