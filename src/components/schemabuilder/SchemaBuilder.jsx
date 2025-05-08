
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import dagre from 'dagre';

// Import shadcn components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Loader2, Search, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// Custom node component
const SalesforceObjectNode = ({ data }) => {
  return (
    <div className={`px-4 py-2 rounded-md shadow-md w-64 border-2 ${data.custom ? 'border-blue-400 bg-blue-50' : 'border-gray-400 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="font-bold text-sm truncate">{data.label}</div>
        <Badge variant={data.custom ? "secondary" : "outline"} className="text-xs">
          {data.custom ? 'Custom' : 'Standard'}
        </Badge>
      </div>
      <div className="text-xs text-gray-500 mt-1">{data.name}</div>
      <div className="mt-2 text-xs">
        <Badge variant="outline" className="mr-1">
          {data.fieldCount} Fields
        </Badge>
        {data.relationshipCount > 0 && (
          <Badge variant="outline">
            {data.relationshipCount} Relations
          </Badge>
        )}
      </div>
    </div>
  );
};

// Function to create layout
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Set nodes
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 80 });
  });

  // Set edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Apply layout
  dagre.layout(dagreGraph);

  // Update node positions
  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 140, // Center the node
          y: nodeWithPosition.y - 40,
        },
      };
    }),
    edges,
  };
};

const SchemaBuilder = () => {
  const [schemaData, setSchemaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [showStandardOnly, setShowStandardOnly] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutDirection, setLayoutDirection] = useState('TB'); // Top to Bottom
  const nodeTypes = { salesforceObject: SalesforceObjectNode };

  // Fetch schema data
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const savedAuthData = localStorage.getItem('sfAuthData');
        if (!savedAuthData) {
          setError('No Salesforce authentication data found. Please log in first.');
          setLoading(false);
          return;
        }

        const { accessToken, instanceUrl } = JSON.parse(savedAuthData);
    
        const res = await fetch('/api/objectinfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, instanceUrl }),
        });

        const data = await res.json();
        
        if (res.ok) {
          setSchemaData(data.objects);
          processGraphData(data.objects);
        } else {
          setError(data.error || 'Failed to fetch Salesforce schema');
        }
      } catch (err) {
        setError(err.message || 'Error occurred while fetching schema data');
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  // Process schema data to create graph nodes and edges
  const processGraphData = useCallback((objects) => {
    if (!objects || objects.length === 0) return;

    const graphNodes = [];
    const graphEdges = [];
    const objectMap = {};

    // First pass - create nodes and build object map
    objects.forEach(obj => {
      // Count relationship fields
      const relationshipFields = obj.fields.filter(field => 
        field.type === 'reference' && field.referenceTo && field.referenceTo.length > 0
      );

      const node = {
        id: obj.name,
        type: 'salesforceObject',
        data: {
          name: obj.name,
          label: obj.label,
          custom: obj.custom,
          fields: obj.fields,
          fieldCount: obj.fields.length,
          relationshipCount: relationshipFields.length
        },
        position: { x: 0, y: 0 }, // Will be set by layout algorithm
      };
      
      graphNodes.push(node);
      objectMap[obj.name] = obj;
    });

    // Second pass - create edges
    objects.forEach(obj => {
      const referenceFields = obj.fields.filter(field => 
        field.type === 'reference' && field.referenceTo && field.referenceTo.length > 0
      );

      referenceFields.forEach(field => {
        field.referenceTo.forEach(targetObjName => {
          // Only create edges for objects that exist in our filtered set
          if (objectMap[targetObjName]) {
            const edge = {
              id: `${obj.name}-${field.name}-${targetObjName}`,
              source: obj.name,
              target: targetObjName,
              animated: false,
              label: field.relationshipName || field.name,
              style: { stroke: '#999', strokeWidth: 1.5 },
              markerEnd: {
                type: 'arrowclosed',
                color: '#999',
              },
              data: {
                fieldName: field.name,
                relationshipName: field.relationshipName,
                required: field.required
              }
            };
            
            graphEdges.push(edge);
          }
        });
      });
    });

    // Apply layout and set nodes/edges
    const layouted = getLayoutedElements(graphNodes, graphEdges, layoutDirection);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [setNodes, setEdges, layoutDirection]);

  // Apply filters and search
  useEffect(() => {
    if (!schemaData) return;

    let filteredObjects = [...schemaData];

    // Apply custom/standard filters
    if (showCustomOnly) {
      filteredObjects = filteredObjects.filter(obj => obj.custom);
    } else if (showStandardOnly) {
      filteredObjects = filteredObjects.filter(obj => !obj.custom);
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredObjects = filteredObjects.filter(obj => 
        obj.name.toLowerCase().includes(term) || 
        obj.label.toLowerCase().includes(term)
      );
    }

    processGraphData(filteredObjects);
  }, [schemaData, searchTerm, showCustomOnly, showStandardOnly, processGraphData]);

  // Handle node selection
  const onNodeClick = (_, node) => {
    setSelectedObject(node.data);
    setSelectedField(null);
  };

  // Handle field selection
  const onFieldClick = (field) => {
    setSelectedField(field);
  };

  // Change layout orientation
  const changeLayout = (direction) => {
    setLayoutDirection(direction);
    if (nodes.length > 0) {
      const layouted = getLayoutedElements(nodes, edges, direction);
      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle filters
  const toggleCustomOnly = () => {
    setShowCustomOnly(!showCustomOnly);
    if (!showCustomOnly) setShowStandardOnly(false);
  };

  const toggleStandardOnly = () => {
    setShowStandardOnly(!showStandardOnly);
    if (!showStandardOnly) setShowCustomOnly(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setShowCustomOnly(false);
    setShowStandardOnly(false);
    setSelectedObject(null);
    setSelectedField(null);
  };

  // Render loading state
  if (loading) {
    return (
      <Card className="w-full h-screen flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading Salesforce Schema...
          </CardTitle>
          <CardDescription>
            Fetching and processing objects and relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full h-screen">
        <CardHeader>
          <CardTitle>Error Loading Schema</CardTitle>
          <CardDescription>
            Could not load Salesforce schema data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-screen flex flex-col">
      <CardHeader className="border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Salesforce Schema Visualizer</CardTitle>
            <CardDescription>
              Visualizing {nodes.length} objects with {edges.length} relationships
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Label htmlFor="layoutDirection" className="mr-2">Layout:</Label>
              <select 
                id="layoutDirection"
                value={layoutDirection}
                onChange={(e) => changeLayout(e.target.value)}
                className="rounded-md border border-gray-300 text-sm px-2 py-1"
              >
                <option value="TB">Top to Bottom</option>
                <option value="LR">Left to Right</option>
                <option value="BT">Bottom to Top</option>
                <option value="RL">Right to Left</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="flex items-center"
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="flex h-full">
        {/* Left Panel - Controls */}
        <div className="w-64 p-4 border-r overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <Search className="h-4 w-4 mr-2 text-gray-500" />
                <Label htmlFor="search">Search Objects</Label>
              </div>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Object Types</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="showCustomOnly" className="text-sm text-gray-600">
                  Custom Objects Only
                </Label>
                <Switch
                  id="showCustomOnly"
                  checked={showCustomOnly}
                  onCheckedChange={toggleCustomOnly}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showStandardOnly" className="text-sm text-gray-600">
                  Standard Objects Only
                </Label>
                <Switch
                  id="showStandardOnly"
                  checked={showStandardOnly}
                  onCheckedChange={toggleStandardOnly}
                />
              </div>
            </div>
            
            {/* Object Stats */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Statistics</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Objects</div>
                  <div className="text-lg font-bold">{nodes.length}</div>
                </div>
                <div className="bg-slate-100 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Relations</div>
                  <div className="text-lg font-bold">{edges.length}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Custom</div>
                  <div className="text-lg font-bold">
                    {schemaData?.filter(obj => obj.custom).length || 0}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Standard</div>
                  <div className="text-lg font-bold">
                    {schemaData?.filter(obj => !obj.custom).length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content - Flow Diagram */}
        <div className="flex-grow flex flex-col">
          <div className="flex-grow relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap 
                nodeStrokeColor={(n) => n.data.custom ? '#93c5fd' : '#9ca3af'}
                nodeColor={(n) => n.data.custom ? '#dbeafe' : '#f9fafb'}
              />
              <Background variant="dots" gap={12} size={1} />
              <Panel position="top-right" className="bg-white bg-opacity-80 p-2 rounded-md shadow-sm">
                <div className="flex space-x-1">
                  <Badge variant="outline" className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
                    Custom Object
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                    Standard Object
                  </Badge>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </div>
        
        {/* Right Panel - Details */}
        {selectedObject && (
          <div className="w-80 border-l overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{selectedObject.label}</h3>
                <Badge variant={selectedObject.custom ? "secondary" : "outline"}>
                  {selectedObject.custom ? 'Custom' : 'Standard'}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mb-4">{selectedObject.name}</div>
              
              <Tabs defaultValue="fields">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fields">Fields ({selectedObject.fields.length})</TabsTrigger>
                  <TabsTrigger value="relations">Relations ({selectedObject.relationshipCount})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fields" className="mt-2">
                  <Input 
                    placeholder="Search fields..." 
                    className="mb-2" 
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {selectedObject.fields
                      .filter(field => !searchTerm || field.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      field.label.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(field => (
                        <div 
                          key={field.name}
                          className={`p-2 rounded-md cursor-pointer hover:bg-slate-100 ${
                            selectedField?.name === field.name ? 'bg-slate-100' : ''
                          }`}
                          onClick={() => onFieldClick(field)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{field.label}</div>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">{field.name}</div>
                          {field.required && (
                            <Badge variant="secondary" className="text-xs mt-1">Required</Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="relations" className="mt-2">
                  {selectedObject.fields
                    .filter(field => field.type === 'reference' && field.referenceTo && field.referenceTo.length > 0)
                    .map(field => (
                      <div key={field.name} className="p-2 mb-2 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{field.label}</div>
                          <Badge variant="outline" className="text-xs">
                            {field.relationshipName || field.name}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">{field.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {field.referenceTo.map(refObj => (
                            <Badge key={refObj} variant="secondary" className="text-xs">
                              {refObj}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
              
              {selectedField && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Field Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">API Name:</div>
                    <div>{selectedField.name}</div>
                    <div className="font-medium">Label:</div>
                    <div>{selectedField.label}</div>
                    <div className="font-medium">Type:</div>
                    <div>{selectedField.type}</div>
                    <div className="font-medium">Required:</div>
                    <div>{selectedField.required ? 'Yes' : 'No'}</div>
                    {selectedField.referenceTo && selectedField.referenceTo.length > 0 && (
                      <>
                        <div className="font-medium">References:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedField.referenceTo.map(ref => (
                            <Badge key={ref} variant="outline" className="text-xs">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                    {selectedField.relationshipName && (
                      <>
                        <div className="font-medium">Relationship:</div>
                        <div>{selectedField.relationshipName}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <CardFooter className="border-t p-2 text-xs text-gray-500">
        <div className="flex justify-between w-full">
          <div>Salesforce Schema Visualizer</div>
          <div>
            Using ReactFlow + shadcn/ui
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SchemaBuilder;