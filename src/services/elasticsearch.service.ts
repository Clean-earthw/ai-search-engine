// services/elasticsearch.service.ts
import { Client } from '@elastic/elasticsearch';
import { SearchResult, AggregationBucket } from '@/types/search';

export class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE!,
      auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY!
      }
    });
  }

  async hybridSearch(
    query: string, 
    options: {
      sources?: string[];
      numResults?: number;
    } = {}
  ): Promise<{
    results: SearchResult[];
    total: number;
    aggregations: {
      sources: AggregationBucket[];
    };
  }> {
    const {
      sources = [],
      numResults = 10
    } = options;

    const esQuery: any = {
      size: numResults,
      query: {
        bool: {
          should: [
            // Lexical search
            {
              multi_match: {
                query,
                fields: [
                  'title^3',
                  'content^2', 
                  'description',
                  'tags^2'
                ],
                fuzziness: 'AUTO'
              }
            },
            // Vector search
            {
              neural: {
                embedding: {
                  query_text: query,
                  model_id: '.multilingual-e5-small',
                  k: numResults
                }
              }
            }
          ]
        }
      },
      highlight: {
        fields: {
          content: {
            fragment_size: 150,
            number_of_fragments: 3
          },
          title: {}
        }
      },
      aggs: {
        sources: {
          terms: {
            field: 'source.keyword',
            size: 20
          }
        }
      }
    };

    // Add source filtering
    if (sources.length > 0) {
      esQuery.query.bool.filter = {
        terms: {
          'source.keyword': sources
        }
      };
    }

    try {
      const response = await this.client.search({
        index: 'search-documents',
        body: esQuery
      });

      return this.transformSearchResponse(response);
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      throw error;
    }
  }

  private transformSearchResponse(response: any): {
    results: SearchResult[];
    total: number;
    aggregations: {
      sources: AggregationBucket[];
    };
  } {
    const hits = response.hits?.hits || [];
    
    const results: SearchResult[] = hits.map((hit: any) => ({
      id: hit._id,
      title: hit._source?.title || 'Untitled',
      url: hit._source?.url || '#',
      content: hit._source?.content || '',
      highlight: hit.highlight?.content?.[0] || hit._source?.content?.substring(0, 200) || 'No content available',
      score: hit._score || 0,
      source: hit._source?.source || 'unknown',
      metadata: {
        last_updated: hit._source?.last_updated,
        author: hit._source?.author,
        content_type: hit._source?.content_type
      }
    }));

    const aggregations = {
      sources: response.aggregations?.sources?.buckets || []
    };

    return {
      results,
      total: response.hits?.total?.value || 0,
      aggregations
    };
  }
}