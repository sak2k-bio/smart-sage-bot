import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Search,
  Copy,
  CheckCircle
} from 'lucide-react';
import { DocumentSource } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface DocumentSourcesProps {
  sources: DocumentSource[];
  isVisible?: boolean;
  onToggle?: () => void;
}

export const DocumentSources: React.FC<DocumentSourcesProps> = ({ 
  sources, 
  isVisible = false,
  onToggle 
}) => {
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const toggleSourceDetails = (index: number) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSources(newExpanded);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "Source content has been copied to your clipboard.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  if (!sources || sources.length === 0) {
    return null;
  }

  // Calculate relevance scores for sorting
  const sortedSources = [...sources].sort((a, b) => (b.distance || 0) - (a.distance || 0));

  return (
    <Card className="mb-4 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-teal-50/50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10 border-green-200/50 dark:border-green-700/50 shadow-soft animate-fade-in">
      <div className="p-4">
        {/* Header with toggle */}
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-green-100/30 dark:hover:bg-green-800/20 rounded-lg p-2 -m-2 transition-spring group"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-elegant">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                Knowledge Sources
              </h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {sources.length} {sources.length === 1 ? 'source' : 'sources'} retrieved
                </span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">
                  <Search className="w-3 h-3 mr-1" />
                  RAG
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Relevance indicator */}
            <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Relevance sorted</span>
            </div>
            
            {isVisible ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-green-600 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-green-600 transition-colors" />
            )}
          </div>
        </div>

        {/* Sources content */}
        {isVisible && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {sortedSources.map((source, index) => {
              const relevanceScore = Math.round((source.distance || 0) * 100);
              const isExpanded = expandedSources.has(index);
              
              return (
                <div 
                  key={index}
                  className="rounded-lg border border-green-200/50 dark:border-green-700/50 bg-white/50 dark:bg-gray-800/50 p-4 transition-spring hover:shadow-soft hover:border-green-300/50 dark:hover:border-green-600/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Source metadata */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {source.metadata?.source && (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                              {source.metadata.source}
                            </Badge>
                          )}
                          
                          {source.metadata?.category && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300">
                              {source.metadata.category}
                            </Badge>
                          )}
                          
                          {source.metadata?.type && (
                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                              {source.metadata.type}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Content preview */}
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {source.preview || source.content.substring(0, 200)}
                          {(source.content.length > 200 && !source.preview) && '...'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Relevance score and actions */}
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {relevanceScore}% match
                        </div>
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${relevanceScore}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(source.content, index)}
                          className="text-xs p-1 h-auto hover:bg-green-100/50 dark:hover:bg-green-800/30"
                          disabled={copiedIndex === index}
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSourceDetails(index)}
                          className="text-xs p-1 h-auto hover:bg-green-100/50 dark:hover:bg-green-800/30"
                        >
                          <ChevronDown 
                            className={`w-3 h-3 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-green-200/30 dark:border-green-700/30 animate-slide-up">
                      <div className="bg-green-50/30 dark:bg-green-900/20 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          Full Content
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {source.content}
                        </p>
                        
                        {/* Additional metadata */}
                        {source.metadata && Object.keys(source.metadata).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-green-200/30 dark:border-green-700/30">
                            <h5 className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">
                              Metadata
                            </h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(source.metadata).map(([key, value]) => (
                                <div key={key} className="flex">
                                  <span className="font-medium text-gray-600 dark:text-gray-400 mr-2 capitalize">
                                    {key}:
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300 truncate">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Summary footer */}
            <div className="mt-4 pt-3 border-t border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  Sources retrieved from knowledge base
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <FileText className="w-3 h-3" />
                    <span>{sources.length} documents</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
