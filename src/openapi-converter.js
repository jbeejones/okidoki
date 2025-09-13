import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import logger from './logger.js';

// OpenAPI to Markdown conversion functionality
export class OpenAPIConverter {
    constructor(options = {}) {
        this.options = {
            title: 'API Reference',
            description: 'API documentation generated from OpenAPI specification',
            includeExample: true,
            includeHeaders: true,
            skipInfo: false,
            ...options
        };
    }

    async convertToMarkdown(openapiSpec) {
        // This is a simplified implementation - we'd use swagger-markdown or similar library
        const spec = this.parseSpec(openapiSpec);
        
        let markdown = this.generateFrontmatter(spec);
        
        if (!this.options.skipInfo && spec.info) {
            markdown += this.generateInfoSection(spec.info);
        }
        
        if (spec.servers) {
            markdown += this.generateServersSection(spec.servers);
        }
        
        if (spec.paths) {
            markdown += this.generatePathsSection(spec.paths, spec.components);
        }
        
        if (spec.components?.schemas) {
            markdown += this.generateSchemasSection(spec.components.schemas);
        }
        
        return markdown;
    }

    parseSpec(specInput) {
        if (typeof specInput === 'string') {
            // Try to parse as YAML first, then JSON
            try {
                return yaml.load(specInput);
            } catch (yamlError) {
                try {
                    return JSON.parse(specInput);
                } catch (jsonError) {
                    throw new Error('Invalid OpenAPI specification: not valid YAML or JSON');
                }
            }
        }
        return specInput;
    }

    generateFrontmatter(spec) {
        const title = this.options.title || spec.info?.title || 'API Reference';
        const description = this.options.description || spec.info?.description || '';
        
        return `---
title: ${title}
description: ${description}
---

`;
    }

    generateInfoSection(info) {
        let markdown = `# ${info.title}\n\n`;
        
        if (info.description) {
            markdown += `${info.description}\n\n`;
        }
        
        if (info.version) {
            markdown += `**Version:** ${info.version}\n\n`;
        }
        
        if (info.contact) {
            markdown += `## Contact\n\n`;
            if (info.contact.name) markdown += `**Name:** ${info.contact.name}\n\n`;
            if (info.contact.email) markdown += `**Email:** ${info.contact.email}\n\n`;
            if (info.contact.url) markdown += `**URL:** ${info.contact.url}\n\n`;
        }
        
        return markdown;
    }

    generateServersSection(servers) {
        let markdown = `## Base URLs\n\n`;
        
        servers.forEach(server => {
            markdown += `- **${server.url}**`;
            if (server.description) {
                markdown += ` - ${server.description}`;
            }
            markdown += '\n';
        });
        
        markdown += '\n';
        return markdown;
    }

    generateHttpMethodBadge(method) {
        const methodUpper = method.toUpperCase();
        
        // Map HTTP methods to colors (shields.io color scheme)
        const colorMap = {
            'get': 'brightgreen',    // Green for safe read operations
            'post': 'blue',          // Blue for create operations
            'put': 'orange',         // Orange for update operations
            'patch': 'yellow',       // Yellow for partial updates
            'delete': 'red',         // Red for destructive operations
            'head': 'lightgrey',     // Gray for metadata requests
            'options': 'inactive'    // Gray for discovery requests
        };
        
        const color = colorMap[method.toLowerCase()] || 'blue';
        
        // Generate shields.io badge URL with proper dimensions
        const badgeUrl = `https://img.shields.io/badge/${methodUpper}-${method.toLowerCase()}-${color}?style=flat-square`;
        
        // Return image markdown with dimensions using the syntax we just fixed
        return `![${methodUpper}](${badgeUrl} =80x20)`;
    }

    generatePathsSection(paths, components) {
        let markdown = `## Endpoints\n\n`;
        
        Object.entries(paths).forEach(([path, pathItem]) => {
            Object.entries(pathItem).forEach(([method, operation]) => {
                if (typeof operation !== 'object' || !operation.operationId) return;
                
                const badge = this.generateHttpMethodBadge(method);
                markdown += `### ${badge} ${path}\n\n`;
                
                if (operation.summary) {
                    markdown += `**Summary:** ${operation.summary}\n\n`;
                }
                
                if (operation.description) {
                    markdown += `${operation.description}\n\n`;
                }
                
                // Collect all parameters (path-level + operation-level)
                let allParameters = [];
                
                // Add path-level parameters first
                if (pathItem.parameters) {
                    allParameters = allParameters.concat(pathItem.parameters);
                }
                
                // Add operation-level parameters
                if (operation.parameters) {
                    allParameters = allParameters.concat(operation.parameters);
                }
                
                if (allParameters.length > 0) {
                    markdown += this.generateParametersSection(allParameters, components);
                }
                
                if (operation.requestBody) {
                    markdown += this.generateRequestBodySection(operation.requestBody);
                }
                
                if (operation.responses) {
                    markdown += this.generateResponsesSection(operation.responses);
                }
                
                markdown += '---\n\n';
            });
        });
        
        return markdown;
    }

    generateParametersSection(parameters, components = null) {
        if (!parameters || parameters.length === 0) {
            return '';
        }

        let markdown = `#### Parameters\n\n`;
        markdown += `| Name | In | Type | Required | Description |\n`;
        markdown += `|------|----|----|----------|-------------|\n`;
        
        parameters.forEach(paramRef => {
            let param = paramRef;
            
            // Handle parameter references (e.g., "#/components/parameters/SomeParam")
            if (paramRef.$ref && components) {
                const refPath = paramRef.$ref.replace('#/components/parameters/', '');
                param = components.parameters?.[refPath] || paramRef;
            }
            
            // Skip parameters that don't have required fields
            if (!param.name || !param.in) {
                logger.warn(`Skipping parameter with missing name or in field: ${JSON.stringify(param)}`);
                return;
            }
            
            const name = param.name || 'unnamed';
            const location = param.in || 'unknown';
            const type = param.schema?.type || param.type || 'string';
            const required = param.required ? 'Yes' : 'No';
            const description = param.description || '';
            
            // Escape pipe characters in description to avoid breaking table
            const escapedDescription = description.replace(/\|/g, '\\|');
            
            markdown += `| ${name} | ${location} | ${type} | ${required} | ${escapedDescription} |\n`;
        });
        
        markdown += '\n';
        return markdown;
    }

    generateRequestBodySection(requestBody) {
        let markdown = `#### Request Body\n\n`;
        
        if (requestBody.description) {
            markdown += `${requestBody.description}\n\n`;
        }
        
        if (requestBody.content) {
            Object.entries(requestBody.content).forEach(([mediaType, mediaTypeObject]) => {
                markdown += `**Content-Type:** \`${mediaType}\`\n\n`;
                
                if (mediaTypeObject.schema) {
                    markdown += `**Schema:**\n\n`;
                    const schemaJson = JSON.stringify(mediaTypeObject.schema, null, 2);
                    const references = this.extractSchemaReferences(schemaJson);
                    
                    markdown += '```json\n';
                    markdown += schemaJson;
                    markdown += '\n```';
                    markdown += this.generateSchemaReferencesLine(references);
                }
            });
        }
        
        return markdown;
    }

    extractSchemaReferences(jsonString) {
        const references = [];
        const regex = /"#\/components\/schemas\/([^"]+)"/g;
        let match;
        
        while ((match = regex.exec(jsonString)) !== null) {
            const schemaName = match[1];
            if (!references.includes(schemaName)) {
                references.push(schemaName);
            }
        }
        
        return references;
    }

    generateSchemaReferencesLine(references) {
        if (references.length === 0) {
            return '\n\n';
        }
        
        const links = references.map(schemaName => {
            const anchorId = schemaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return `[${schemaName}](#${anchorId})`;
        });
        
        return `\n\n**References:** ${links.join(', ')}\n\n`;
    }

    generateResponsesSection(responses) {
        let markdown = `#### Responses\n\n`;
        
        const responseEntries = Object.entries(responses);
        
        if (responseEntries.length === 1) {
            // For single response, don't use tabs
            const [statusCode, response] = responseEntries[0];
            markdown += `**${statusCode}** - ${response.description || 'Response'}\n\n`;
            
            if (response.content) {
                Object.entries(response.content).forEach(([mediaType, mediaTypeObject]) => {
                    markdown += `*Content-Type:* \`${mediaType}\`\n\n`;
                    
                    if (mediaTypeObject.schema) {
                        const schemaJson = JSON.stringify(mediaTypeObject.schema, null, 2);
                        const references = this.extractSchemaReferences(schemaJson);
                        
                        markdown += '```json\n';
                        markdown += schemaJson;
                        markdown += '\n```';
                        markdown += this.generateSchemaReferencesLine(references);
                    }
                });
            }
        } else {
            // For multiple responses, use tabs for better UX
            markdown += `{{#tabs}}\n`;
            
            responseEntries.forEach(([statusCode, response]) => {
                markdown += `  {{#tab title="${statusCode}"}}\n`;
                
                if (response.description) {
                    markdown += `${response.description}\n\n`;
                }
                
                if (response.content) {
                    Object.entries(response.content).forEach(([mediaType, mediaTypeObject]) => {
                        markdown += `**Content-Type:** \`${mediaType}\`\n\n`;
                        
                        if (mediaTypeObject.schema) {
                            const schemaJson = JSON.stringify(mediaTypeObject.schema, null, 2);
                            const references = this.extractSchemaReferences(schemaJson);
                            
                            markdown += '```json\n';
                            markdown += schemaJson;
                            markdown += '\n```';
                            markdown += this.generateSchemaReferencesLine(references);
                        }
                    });
                } else {
                    markdown += 'No response body.\n\n';
                }
                
                markdown += `  {{/tab}}\n`;
            });
            
            markdown += `{{/tabs}}\n\n`;
        }
        
        return markdown;
    }



    generateSchemasSection(schemas) {
        let markdown = `## Data Models\n\n`;
        
        Object.entries(schemas).forEach(([schemaName, schema]) => {
            // Generate anchor ID for schema (lowercase, dash-separated)
            const anchorId = schemaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            markdown += `### ${schemaName} {#${anchorId}}\n\n`;
            
            if (schema.description) {
                markdown += `${schema.description}\n\n`;
            }
            
            markdown += '```json\n';
            markdown += JSON.stringify(schema, null, 2);
            markdown += '\n```\n\n';
        });
        
        return markdown;
    }
}

export async function convertOpenAPIToMarkdown(inputPath, outputPath, options = {}) {
    try {
        logger.info(`Converting OpenAPI spec: ${inputPath}`);
        
        // Read the OpenAPI specification
        const specContent = fs.readFileSync(inputPath, 'utf8');
        
        // Create converter instance
        const converter = new OpenAPIConverter(options);
        
        // Convert to markdown
        const markdown = await converter.convertToMarkdown(specContent);
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write the markdown file
        fs.writeFileSync(outputPath, markdown);
        
        logger.info(`Successfully converted OpenAPI spec to: ${outputPath}`);
        
        return {
            inputPath,
            outputPath,
            success: true
        };
        
    } catch (error) {
        logger.error(`Failed to convert OpenAPI spec: ${error.message}`);
        throw error;
    }
} 