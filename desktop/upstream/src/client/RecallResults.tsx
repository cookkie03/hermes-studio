import React, { useState } from 'react';
import { Search, ExternalLink, Clock, User, Hash } from 'lucide-react';
import type { RecallResult } from '../shared/types';

export interface RecallResultsProps {
  results: RecallResult[];
  query?: string;
  onSearch?: (query: string) => void;
  onSelectResult?: (result: RecallResult) => void;
  loading?: boolean;
}

export function RecallResults({
  results,
  query = '',
  onSearch,
  onSelectResult,
  loading = false,
}: RecallResultsProps) {
  const [searchInput, setSearchInput] = useState(query);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchInput);
  };

  return (
    <div className="recall-results-container" aria-label="Session recall search">
      <form className="recall-search-bar" onSubmit={handleSearchSubmit}>
        <div className="search-input-wrapper">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search conversation history"
            placeholder="Search this conversation…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="text-button" disabled={loading}>
          {loading ? 'Searching…' : 'Recall'}
        </button>
      </form>

      <div className="recall-list" role="list" aria-label="Recalled conversation snippets">
        {results.length === 0 ? (
          <div className="recall-empty" role="status">
            {searchInput ? 'No verified session recall results found.' : 'Search verified messages in this conversation.'}
          </div>
        ) : (
          results.map((res) => (
            <div
              key={`${res.sessionId}-${res.messageId}`}
              className="recall-item"
              role="listitem"
              tabIndex={0}
              onClick={() => onSelectResult?.(res)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectResult?.(res);
                }
              }}
              aria-label={`Recall snippet from profile ${res.profile}`}
            >
              <div className="recall-item-header">
                <span className="recall-scope-tag" title="Preserved scope">
                  <User size={12} aria-hidden="true" /> @session:{res.profile}/{res.threadId}
                </span>
                <span className="recall-timestamp">
                  <Clock size={11} aria-hidden="true" /> {res.timestamp ? new Date(res.timestamp).toLocaleTimeString() : 'Time not reported'}
                </span>
              </div>
              <p className="recall-snippet">{res.snippet}</p>
              <div className="recall-item-footer">
                <span className="recall-anchor">
                  <Hash size={11} aria-hidden="true" /> Msg: {res.messageId}
                </span>
                {typeof res.score === 'number' && (
                  <span className="recall-score">Match: {Math.round(res.score * 100)}%</span>
                )}
                <span className="recall-open-action">
                  Open <ExternalLink size={12} aria-hidden="true" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
