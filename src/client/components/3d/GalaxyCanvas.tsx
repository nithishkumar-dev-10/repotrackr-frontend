import React, { useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import {
  GalaxyGraph,
  GalaxyNode,
  ReaderResponse,
  PlanResponse,
  ContextResponse,
  PlanItem,
  GalaxyCluster,
  GalaxyEdge,
} from '../../types/galaxy';

interface GalaxyCanvasProps {
  graph: GalaxyGraph;
  activeMode: 'reader' | 'plan' | 'context';
  readerData?: ReaderResponse | null;
  planData?: PlanResponse | null;
  contextData?: ContextResponse | null;
  selectedStep?: number | null;
  selectedPlanItem?: string | null;
  onSelectNode?: (node: GalaxyNode) => void;
  onSelectPlanItem?: (item: PlanItem) => void;
}

// 3D Visual Beam for Plan Verifier evidence
function EvidenceBeam({
  start,
  end,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const lineObj = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 });
    return new THREE.Line(geo, mat);
  }, [start, end, color]);

  return <primitive object={lineObj} />;
}

// Glowing reading path line
function ReaderPathLine({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
    return new THREE.Line(geo, mat);
  }, [points, color]);

  return <primitive object={lineObj} />;
}

// Graph Edges Component
function GraphEdges({
  edges,
  nodeMap,
  hoveredNodeId,
  selectedNodeId,
}: {
  edges: GalaxyEdge[];
  nodeMap: Map<string, GalaxyNode>;
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
}) {
  const { linePositions, lineColors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const defaultCol = new THREE.Color('#334155');
    const highlightCol = new THREE.Color('#7C93FF');

    edges.forEach((edge: GalaxyEdge) => {
      const src = nodeMap.get(edge.source);
      const dst = nodeMap.get(edge.target);
      if (!src || !dst) return;

      pos.push(src.position[0], src.position[1], src.position[2]);
      pos.push(dst.position[0], dst.position[1], dst.position[2]);

      const isConnected =
        src.id === hoveredNodeId ||
        dst.id === hoveredNodeId ||
        src.id === selectedNodeId ||
        dst.id === selectedNodeId;

      const c = isConnected ? highlightCol : defaultCol;
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    });

    return {
      linePositions: new Float32Array(pos),
      lineColors: new Float32Array(col),
    };
  }, [edges, nodeMap, hoveredNodeId, selectedNodeId]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.25} />
    </lineSegments>
  );
}

// Single Galaxy Node Mesh
function NodeMesh({
  node,
  clusterColor,
  isHovered,
  isSelected,
  modeHighlight,
  tierMode,
  stepNumber,
  onHover,
  onClick,
}: {
  node: GalaxyNode;
  clusterColor: string;
  isHovered: boolean;
  isSelected: boolean;
  modeHighlight: boolean;
  tierMode?: 'full' | 'signature' | 'dim';
  stepNumber?: number;
  onHover: (node: GalaxyNode | null) => void;
  onClick: (node: GalaxyNode) => void;
}) {
  const baseRadius = 0.22 + node.centrality * 0.35;

  let nodeColor = clusterColor;
  let opacity = 0.9;
  let emissiveIntensity = 0.5;

  if (tierMode === 'full') {
    nodeColor = '#38BDF8';
    emissiveIntensity = 2.0;
  } else if (tierMode === 'signature') {
    nodeColor = '#818CF8';
    emissiveIntensity = 1.0;
  } else if (tierMode === 'dim') {
    opacity = 0.18;
    emissiveIntensity = 0.1;
  } else if (modeHighlight) {
    nodeColor = '#3B5BFF';
    emissiveIntensity = 1.8;
  } else if (isHovered || isSelected) {
    nodeColor = '#FFFFFF';
    emissiveIntensity = 2.5;
  }

  return (
    <group position={node.position}>
      {/* Node Sphere */}
      <mesh
        onPointerOver={e => {
          e.stopPropagation();
          onHover(node);
        }}
        onPointerOut={() => onHover(null)}
        onClick={e => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        <sphereGeometry args={[baseRadius, 20, 20]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Entry Point Outer Ring */}
      {node.isEntryPoint && (
        <mesh>
          <ringGeometry args={[baseRadius * 1.4, baseRadius * 1.55, 32]} />
          <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Reader Step Badge */}
      {stepNumber && (
        <Billboard position={[0, baseRadius + 0.5, 0]}>
          <Html center distanceFactor={18}>
            <div className="bg-[#3B5BFF] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap pointer-events-none flex items-center gap-1">
              <span>#{stepNumber}</span>
              <span className="text-[10px] opacity-80">{node.name.replace('()', '')}</span>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// Plan Verifier Orbit Ring Component
function PlanRing({
  planItems,
  selectedItemId,
  nodeMap,
  onSelectPlanItem,
}: {
  planItems: PlanItem[];
  selectedItemId: string | null;
  nodeMap: Map<string, GalaxyNode>;
  onSelectPlanItem: (item: PlanItem) => void;
}) {
  const ringRadius = 24;

  const statusColorMap: Record<string, string> = {
    done: '#16A34A',
    partial: '#F59E0B',
    missing: '#EF4444',
    unknown: '#94A3B8',
  };

  const selectedItem = planItems.find(i => i.id === selectedItemId);

  return (
    <group>
      {/* Visual Ring Circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringRadius - 0.05, ringRadius + 0.05, 96]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Plan Items placed along the ring */}
      {planItems.map((item: PlanItem) => {
        const x = ringRadius * Math.cos(item.angle);
        const z = ringRadius * Math.sin(item.angle);
        const y = 0;
        const color = statusColorMap[item.status] || '#94A3B8';
        const isSelected = item.id === selectedItemId;

        return (
          <group key={item.id} position={[x, y, z]}>
            <mesh onClick={() => onSelectPlanItem(item)}>
              <sphereGeometry args={[isSelected ? 0.8 : 0.55, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isSelected ? 2 : 1}
              />
            </mesh>

            <Billboard position={[0, 1.2, 0]}>
              <Html center distanceFactor={22}>
                <button
                  onClick={() => onSelectPlanItem(item)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shadow-md border transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#0B1020] border-white scale-110 font-bold'
                      : 'bg-[#0B1020]/90 text-white/90 border-[#334155] hover:border-white/50'
                  }`}
                  style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                >
                  <span className="uppercase text-[10px] mr-1.5" style={{ color }}>
                    {item.status}
                  </span>
                  {item.title.length > 24 ? item.title.slice(0, 24) + '...' : item.title}
                </button>
              </Html>
            </Billboard>
          </group>
        );
      })}

      {/* Evidence Beams from selected Plan Item to code nodes */}
      {selectedItem && (
        <>
          {selectedItem.nodeIds.map((nodeId: string) => {
            const codeNode = nodeMap.get(nodeId);
            if (!codeNode) return null;
            const itemX = ringRadius * Math.cos(selectedItem.angle);
            const itemZ = ringRadius * Math.sin(selectedItem.angle);

            return (
              <EvidenceBeam
                key={nodeId}
                start={[itemX, 0, itemZ]}
                end={codeNode.position}
                color={statusColorMap[selectedItem.status] || '#16A34A'}
              />
            );
          })}
        </>
      )}
    </group>
  );
}

// Scene Root Container
function GalaxyScene({
  graph,
  activeMode,
  readerData,
  planData,
  contextData,
  selectedStep,
  selectedPlanItem,
  onSelectNode,
  onSelectPlanItem,
}: GalaxyCanvasProps) {
  const [hoveredNode, setHoveredNode] = useState<GalaxyNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null);

  const nodeMap = useMemo(() => {
    return new Map<string, GalaxyNode>(graph.nodes.map((n: GalaxyNode) => [n.id, n]));
  }, [graph.nodes]);

  const clusterColorMap = useMemo(() => {
    return new Map<string, string>(graph.clusters.map((c: GalaxyCluster) => [c.id, c.color]));
  }, [graph.clusters]);

  // Reader mode path points
  const readerPath = useMemo(() => {
    if (activeMode !== 'reader' || !readerData?.readingOrder) return null;
    const pts: THREE.Vector3[] = [];
    readerData.readingOrder.forEach(step => {
      const node = nodeMap.get(step.nodeId);
      if (node) pts.push(new THREE.Vector3(...node.position));
    });
    return pts;
  }, [activeMode, readerData, nodeMap]);

  // Context packed node map
  const packedTierMap = useMemo(() => {
    if (activeMode !== 'context' || !contextData?.packedNodes) return null;
    const map = new Map<string, 'full' | 'signature'>();
    contextData.packedNodes.forEach(pn => map.set(pn.nodeId, pn.tier));
    return map;
  }, [activeMode, contextData]);

  // Handle node selection
  const handleNodeClick = (node: GalaxyNode) => {
    setSelectedNode(node);
    onSelectNode?.(node);
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[20, 25, 20]} intensity={1.8} color="#7C93FF" />
      <pointLight position={[-20, -25, -20]} intensity={1.0} color="#38BDF8" />

      {/* Cluster Center Labels */}
      {graph.clusters.map((cluster: GalaxyCluster) => (
        <group key={cluster.id} position={cluster.center}>
          <Billboard position={[0, 4.5, 0]}>
            <Html center distanceFactor={26}>
              <div
                className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#0B1020]/80 border shadow-lg whitespace-nowrap pointer-events-none"
                style={{ borderColor: cluster.color, color: cluster.color }}
              >
                {cluster.name}
              </div>
            </Html>
          </Billboard>
        </group>
      ))}

      {/* Graph Edges */}
      <GraphEdges
        edges={graph.edges}
        nodeMap={nodeMap}
        hoveredNodeId={hoveredNode?.id || null}
        selectedNodeId={selectedNode?.id || null}
      />

      {/* Graph Nodes */}
      {graph.nodes.map((node: GalaxyNode) => {
        const clusterColor = clusterColorMap.get(node.cluster) || '#7C93FF';
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Reader mode step matching
        let stepNumber: number | undefined;
        let isModeHighlight = false;
        if (activeMode === 'reader' && readerData?.readingOrder) {
          const matchedStep = readerData.readingOrder.find(s => s.nodeId === node.id);
          if (matchedStep) {
            stepNumber = matchedStep.step;
            isModeHighlight = selectedStep ? matchedStep.step === selectedStep : true;
          }
        }

        // Context mode tier
        let tierMode: 'full' | 'signature' | 'dim' | undefined;
        if (activeMode === 'context' && packedTierMap) {
          if (packedTierMap.has(node.id)) {
            tierMode = packedTierMap.get(node.id);
          } else {
            tierMode = 'dim';
          }
        }

        return (
          <NodeMesh
            key={node.id}
            node={node}
            clusterColor={clusterColor}
            isHovered={isHovered}
            isSelected={isSelected}
            modeHighlight={isModeHighlight}
            tierMode={tierMode}
            stepNumber={stepNumber}
            onHover={setHoveredNode}
            onClick={handleNodeClick}
          />
        );
      })}

      {/* Reader Path Connections */}
      {readerPath && readerPath.length > 1 && (
        <ReaderPathLine points={readerPath} color="#3B5BFF" />
      )}

      {/* Plan Verifier Orbit Ring */}
      {activeMode === 'plan' && planData?.items && (
        <PlanRing
          planItems={planData.items}
          selectedItemId={selectedPlanItem || null}
          nodeMap={nodeMap}
          onSelectPlanItem={onSelectPlanItem || (() => {})}
        />
      )}

      {/* Hover Node Tooltip */}
      {hoveredNode && (
        <Billboard position={[hoveredNode.position[0], hoveredNode.position[1] + 1.2, hoveredNode.position[2]]}>
          <Html center distanceFactor={14}>
            <div className="bg-[#0B1020]/95 backdrop-blur-md text-white p-3 rounded-xl border border-[#334155] shadow-2xl min-w-[210px] max-w-[280px] pointer-events-none">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-sm text-[#93C5FD] truncate">{hoveredNode.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1E293B] text-[#7C93FF]">
                  {hoveredNode.type}
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#94A3B8] mb-1.5 flex items-center gap-1 truncate">
                <span>{hoveredNode.file}:{hoveredNode.line}</span>
              </div>
              {hoveredNode.docstring && (
                <p className="text-[11px] text-[#CBD5E1] line-clamp-2 leading-relaxed">
                  {hoveredNode.docstring}
                </p>
              )}
            </div>
          </Html>
        </Billboard>
      )}

      <OrbitControls
        enablePan
        enableZoom
        maxDistance={50}
        minDistance={5}
        dampingFactor={0.05}
      />
    </>
  );
}

export const GalaxyCanvas: React.FC<GalaxyCanvasProps> = props => {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#0B1020] shadow-2xl border border-[#1E293B]">
      <Canvas
        camera={{ position: [0, 16, 32], fov: 48 }}
        style={{ background: '#0B1020' }}
      >
        <GalaxyScene {...props} />
      </Canvas>

      {/* Ambient Canvas Watermark */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
        <span className="text-xs font-mono text-[#64748B]">3D REPO GALAXY • {props.graph.nodes.length} NODES</span>
      </div>
    </div>
  );
};
