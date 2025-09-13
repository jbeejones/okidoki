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
        
        // Map HTTP methods to DaisyUI badge types
        const badgeTypeMap = {
            'get': 'success',      // Green for safe read operations
            'post': 'info',        // Blue for create operations
            'put': 'warning',      // Orange/Yellow for update operations
            'patch': 'warning',    // Orange/Yellow for partial updates
            'delete': 'error',     // Red for destructive operations
            'head': 'neutral',     // Gray for metadata requests
            'options': 'secondary' // Gray-ish for discovery requests
        };
        
        const badgeType = badgeTypeMap[method.toLowerCase()] || 'primary';
        
        // Using Handlebars badge helper syntax
        return `{{badge "${methodUpper}" "${badgeType}"}}`;
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
                
                if (operation.parameters) {
                    markdown += this.generateParametersSection(operation.parameters);
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

    generateParametersSection(parameters) {
        let markdown = `#### Parameters\n\n`;
        markdown += `| Name | In | Type | Required | Description |\n`;
        markdown += `|------|----|----|----------|-------------|\n`;
        
        parameters.forEach(param => {
            const type = param.schema?.type || 'string';
            const required = param.required ? 'Yes' : 'No';
            const description = param.description || '';
            markdown += `| ${param.name} | ${param.in} | ${type} | ${required} | ${description} |\n`;
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