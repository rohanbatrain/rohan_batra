/**
 * Swagger UI API Documentation Page
 * 
 * Displays interactive API documentation using Swagger UI
 * Access at: /api-docs
 */

'use client';

import { useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const swaggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
          <p className="text-muted-foreground">
            Interactive documentation for the Braindump API
          </p>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/docs/API_REFERENCE.md" className="text-primary hover:underline">
                  API Reference Guide
                </a>
              </li>
              <li>
                <a href="/docs/openapi.json" className="text-primary hover:underline">
                  OpenAPI JSON Spec
                </a>
              </li>
              <li>
                <a href="/docs/AUTHENTICATION.md" className="text-primary hover:underline">
                  Authentication Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div ref={swaggerRef} className="bg-white rounded-lg shadow-lg">
          <SwaggerUI 
            url="/docs/openapi.json"
            docExpansion="list"
            defaultModelsExpandDepth={1}
            displayRequestDuration={true}
            filter={true}
            showExtensions={true}
            tryItOutEnabled={true}
          />
        </div>
      </div>
    </div>
  );
}
