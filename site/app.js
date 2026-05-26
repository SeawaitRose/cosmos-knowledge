const TYPE_LABELS = {
  book: "书本",
  concept: "概念",
  method: "方法",
  claim: "观点",
  example: "例子",
  action: "行动",
  reflection: "反思",
  question: "问题",
  value: "价值",
  belief: "信念",
  emotion: "情绪",
  decision: "决策",
  theme: "主题",
};

const TYPE_COLORS = {
  book: "#f4c76b",
  concept: "#67e8f9",
  method: "#8ee8b6",
  claim: "#b9a7ff",
  example: "#f6a96a",
  action: "#ff8f99",
  reflection: "#a7f3d0",
  question: "#f8df88",
  value: "#d8b4fe",
  belief: "#93c5fd",
  emotion: "#fda4af",
  decision: "#c7d2fe",
  theme: "#99f6e4",
};

const ALLOWED_NODE_TYPES = new Set(Object.keys(TYPE_LABELS));
const ALLOWED_EDGE_TYPES = new Set([
  "contains",
  "supports",
  "contrasts",
  "extends",
  "applies_to",
  "reminds_of",
  "causes",
  "challenges",
  "reframes",
  "evidences",
  "updates",
  "recurs_in",
  "synthesizes",
]);
const ALLOWED_CONFIDENCE = new Set(["high", "medium", "low"]);
const ALLOWED_SCENARIOS = new Set(["reading", "reflection", "complaint", "decision", "idea", "practice", "import"]);
const ALLOWED_COSMOS_ROLES = new Set(["galaxy", "star", "planet", "bridge", "comet"]);
const ALLOWED_DOCUMENT_PREFIXES = ["knowledge/books/", "knowledge/cards/", "knowledge/imports/"];
const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
const CELESTIAL_ASSET_MANIFEST = "site/assets/celestials/manifest.json";
const DATA_REFRESH_INTERVAL_MS = 12000;
const COSMOS_VIEW_LABELS = {
  galaxy: "元认知星系",
  meta: "元认知",
  comet: "彗星/远航",
};
const NODE_BASE_MASS = {
  book: 8.4,
  theme: 7.6,
  concept: 5.6,
  method: 5.4,
  belief: 4.7,
  value: 4.5,
  claim: 4.2,
  reflection: 3.5,
  question: 3.3,
  action: 3.2,
  decision: 3.1,
  example: 2.8,
  emotion: 2.6,
};
const EDGE_BASE_STRENGTH = {
  contains: 1.18,
  supports: 1.1,
  extends: 1.04,
  applies_to: 0.98,
  evidences: 0.86,
  updates: 0.82,
  reframes: 0.78,
  causes: 0.74,
  challenges: 0.66,
  contrasts: 0.58,
  recurs_in: 0.54,
  synthesizes: 0.36,
  reminds_of: 0.42,
};
const CONFIDENCE_WEIGHT = { high: 1, medium: 0.68, low: 0.42 };
const LIFECYCLE_STAGE_LABELS = {
  active: "明亮稳定",
  fading: "正在变暗",
  dormant: "沉寂晚年",
  synthesizing: "正在凝聚",
  remnant: "前身星云",
  theory_star: "新理论恒星",
};
const LIFECYCLE_STAGE_COLORS = {
  active: "#f8fbff",
  fading: "#ffd981",
  dormant: "#8aa0b8",
  synthesizing: "#c8bcff",
  remnant: "#8ee8b6",
  theory_star: "#ffffff",
};
const ALLOWED_LIFECYCLE_STAGES = new Set(Object.keys(LIFECYCLE_STAGE_LABELS));
const EBBINGHAUS_REVIEW_INTERVALS_DAYS = [1, 2, 4, 7, 15, 30, 60, 120, 240];
const SERVICE_API_PREFIX = "/api";
const WEEKDAY_OPTIONS = [
  ["monday", "周一"],
  ["tuesday", "周二"],
  ["wednesday", "周三"],
  ["thursday", "周四"],
  ["friday", "周五"],
  ["saturday", "周六"],
  ["sunday", "周日"],
];
const MATERIAL_PROFILES = {
  ocean: { id: "ocean", base: "#1c5f9f", land: "#2f7d4e", peak: "#d9d6be", cloud: "#f7fbff", accent: "#7bd8ff", roughness: 0.68, metalness: 0.02 },
  forest: { id: "forest", base: "#174c36", land: "#56a15f", peak: "#d7c891", cloud: "#d7f3ff", accent: "#92e0a3", roughness: 0.74, metalness: 0.02 },
  ice: { id: "ice", base: "#7fb9d8", land: "#d9f5ff", peak: "#ffffff", cloud: "#f8fdff", accent: "#bcefff", roughness: 0.5, metalness: 0.06 },
  desert: { id: "desert", base: "#9b6a36", land: "#d7a65e", peak: "#f0d09a", cloud: "#f5e4cf", accent: "#ffd981", roughness: 0.86, metalness: 0.03 },
  volcanic: { id: "volcanic", base: "#21171a", land: "#61402d", peak: "#ff7b36", cloud: "#8d6b66", accent: "#ffb16e", roughness: 0.62, metalness: 0.08 },
  metallic: { id: "metallic", base: "#586377", land: "#a9b5c8", peak: "#eef4ff", cloud: "#c7d2fe", accent: "#93c5fd", roughness: 0.38, metalness: 0.42 },
  gas: { id: "gas", base: "#7356a6", land: "#caa7ff", peak: "#fff4c2", cloud: "#f4e7ff", accent: "#c8bcff", roughness: 0.58, metalness: 0.02 },
  comet: { id: "comet", base: "#2f4657", land: "#8aa0b8", peak: "#e8f8ff", cloud: "#f5fbff", accent: "#8ddcff", roughness: 0.8, metalness: 0.04 },
  star: { id: "star", base: "#f5d06d", land: "#ff9e4a", peak: "#ffffff", cloud: "#ffe8a3", accent: "#fff4c2", roughness: 0.36, metalness: 0.01 },
};
const MATERIAL_PROFILE_BY_TYPE = {
  book: ["gas", "ocean", "star"],
  theme: ["gas", "forest", "metallic"],
  concept: ["ocean", "ice", "forest"],
  method: ["forest", "metallic", "desert"],
  claim: ["desert", "volcanic", "metallic"],
  example: ["desert", "ocean", "ice"],
  action: ["volcanic", "forest", "metallic"],
  reflection: ["ocean", "forest", "ice"],
  question: ["ice", "comet", "gas"],
  value: ["forest", "ocean", "star"],
  belief: ["star", "gas", "metallic"],
  emotion: ["gas", "volcanic", "ocean"],
  decision: ["metallic", "desert", "forest"],
};

const state = {
  graph: { version: 1, updated_at: "", nodes: [], edges: [] },
  lifecycle: { version: 1, updated_at: "", records: {}, syntheses: [] },
  celestialAssets: { version: 0, profiles: {} },
  celestialAssetsError: "",
  nodeMap: new Map(),
  edgeMap: new Map(),
  markdown: new Map(),
  extracted: { review: [], pending: [] },
  graphError: "",
  lifecycleError: "",
  dailyBrief: null,
  dailyBriefError: "",
  bookRecommendations: [],
  view: "home",
  selectedId: "",
  filters: { query: "", type: "", tag: "", confidence: "" },
  cosmosView: "galaxy",
  cosmosMetrics: { key: "", map: new Map() },
  layout: new Map(),
  hitboxes: [],
  camera: { x: 0, y: 0, scale: 1, targetX: 0, targetY: 0, targetScale: 1 },
  three: {
    module: null,
    loading: null,
    ready: false,
    error: "",
    scene: null,
    camera: null,
    renderer: null,
    raycaster: null,
    pointer: null,
    group: null,
    stars: null,
    textureLoader: null,
    nodeObjects: new Map(),
    edgeObjects: [],
    orbitObjects: [],
    textureCache: new Map(),
    assetTextureCache: new Map(),
    assetBakeQueue: [],
    assetBakeQueued: new Set(),
    assetBakeScheduled: false,
    visibleNodeIds: new Set(),
    projectedNodes: new Map(),
    frustum: null,
    projectionMatrix: null,
    cullSphere: null,
    projectScratch: null,
    target: null,
    spherical: { radius: 980, theta: 0.25, phi: 1.15 },
    targetSpherical: { radius: 980, theta: 0.25, phi: 1.15 },
    pan: { x: 0, y: 0, z: 0 },
    targetPan: { x: 0, y: 0, z: 0 },
    adaptiveLowPower: false,
    lastRenderAt: 0,
    frameMs: 16,
    slowFrameCount: 0,
    fastFrameCount: 0,
    dragging: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    mode: "rotate",
    lastKey: "",
  },
  dataRefresh: {
    timer: null,
    running: false,
    signature: "",
    lastCheckedAt: 0,
    lastAppliedAt: 0,
  },
  reviewTimeline: {
    days: 0,
    playing: true,
    lastTick: 0,
    progressMs: 0,
    cycleDays: 240,
    cycleMs: 26000,
    renderedDay: -1,
  },
  controlMode: "touch",
  pathMode: false,
  gesture: {
    stream: null,
    landmarker: null,
    visionPromise: null,
    lastVideoTime: -1,
    previousPinchDistance: 0,
    pinchDown: false,
    pinchStartedAt: 0,
    activeHand: null,
    pinchAnchorX: 0,
    pinchAnchorY: 0,
    pinchCandidateId: "",
    pinchMoved: false,
    previousTwoHandDistance: 0,
    lastSelectAt: 0,
    previous: null,
    lastX: 0,
    lastY: 0,
    pointerX: 0.5,
    pointerY: 0.5,
    areaBase: 0,
    active: false,
    hoverId: "",
    hoverSince: 0,
  },
  drag: null,
  suppressClick: false,
  gestureStartScale: 1,
  packageResult: null,
  service: { available: false, status: null, error: "" },
  notification: null,
  manager: {
    query: "",
    selectedNodeId: "",
    selectedEdgeId: "__new__",
    reports: { node: "", edge: "", lifecycle: "", automation: "", examples: "" },
  },
  started: false,
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindElements();
  bindEvents();
  maybeRedirectFromFileUrl();
  await loadServiceStatus();
  await loadGraph();
  await loadLifecycle();
  await loadLinkedMarkdown();
  await loadDailyBrief();
  await loadBookRecommendations();
  await loadNotificationConfig();
  await loadCelestialAssets();
  renderAll();
  startCanvasLoops();
  startDataRefresh();
}

function bindElements() {
  [
    "ambientCanvas",
    "previewCanvas",
    "cosmos3dCanvas",
    "cosmosCanvas",
    "gestureHud",
    "gestureVideo",
    "gestureCanvas",
    "gestureStatus",
    "graphStatus",
    "previewNodeCount",
    "metricGrid",
    "dailyBriefMeta",
    "dailyFocusQuestion",
    "dailyFocusReason",
    "dailyFuzzyList",
    "dailyAiPrompt",
    "suggestedList",
    "pendingQuestions",
    "searchInput",
    "typeFilter",
    "tagFilter",
    "confidenceFilter",
    "galaxyViewButton",
    "metaViewButton",
    "cometViewButton",
    "touchModeButton",
    "cameraModeButton",
    "reviewTimeline",
    "reviewTimelineLabel",
    "reviewTimelineStats",
    "reviewTimelineToggle",
    "pathModeButton",
    "resetCameraButton",
    "cosmosHint",
    "actionList",
    "reviewList",
    "healthSummary",
    "healthSuggestions",
    "taskFuzzyList",
    "taskActionReview",
    "taskRecommendation",
    "bookCount",
    "bookList",
    "themeList",
    "sourceList",
    "refreshManageButton",
    "managerStatus",
    "managerSearchInput",
    "managerNodeList",
    "managerNodeMeta",
    "managerNodeId",
    "managerNodeType",
    "managerNodeLabel",
    "managerNodeConfidence",
    "managerNodeSummary",
    "managerNodeTags",
    "managerNodeSource",
    "managerCosmosRole",
    "managerSourceAnchor",
    "managerNodeStatus",
    "managerCardPath",
    "saveNodeButton",
    "openNodeInCosmosButton",
    "deleteNodeButton",
    "managerNodeReport",
    "managerEdgeMeta",
    "managerEdgeSelect",
    "managerEdgeId",
    "managerEdgeType",
    "managerEdgeFrom",
    "managerEdgeTo",
    "managerEdgeConfidence",
    "managerEdgeEvidence",
    "saveEdgeButton",
    "deleteEdgeButton",
    "managerEdgeReport",
    "managerLastReviewed",
    "managerReviewCount",
    "managerLastPracticed",
    "managerPracticeCount",
    "managerMastery",
    "managerLifecycleStage",
    "saveLifecycleButton",
    "managerLifecycleReport",
    "refreshAutomationButton",
    "beijingTimeStatus",
    "timeCalibration",
    "webhookStatus",
    "feishuWebhookInput",
    "dailyEnabledInput",
    "dailyTimeInput",
    "weeklyEnabledInput",
    "weeklyDayInput",
    "weeklyTimeInput",
    "saveAutomationButton",
    "testDailyButton",
    "testWeeklyButton",
    "automationReport",
    "packageInput",
    "packageSummary",
    "packageStatus",
    "packageReport",
    "mergePackageButton",
    "dryRunPackageButton",
    "mergeInstruction",
    "resetDemoButton",
    "resetBlankButton",
    "examplesStatus",
    "examplesReport",
    "detailPanel",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  els.searchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim();
    const matches = filteredNodes();
    if (state.filters.query && matches.length) selectNode(matches[0].id, true);
    renderAll();
  });

  els.typeFilter.addEventListener("change", (event) => {
    state.filters.type = event.target.value;
    renderAll();
  });

  els.tagFilter.addEventListener("change", (event) => {
    state.filters.tag = event.target.value;
    renderAll();
  });

  els.confidenceFilter.addEventListener("change", (event) => {
    state.filters.confidence = event.target.value;
    renderAll();
  });

  els.cosmosCanvas.addEventListener("click", (event) => {
    if (state.suppressClick || state.three.moved) return;
    const hit = nearestHit(event, 12);
    if (!hit) return;
    selectNode(hit.id, false);
    renderAll();
  });

  els.cosmosCanvas.addEventListener("dblclick", (event) => {
    const hit = nearestHit(event, 18);
    if (hit) selectNode(hit.id, true);
    else resetCamera();
    renderAll();
  });

  els.cosmosCanvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      handleCosmosWheel(event);
    },
    { passive: false }
  );

  ["gesturestart", "gesturechange", "gestureend"].forEach((type) => {
    els.cosmosCanvas.addEventListener(
      type,
      (event) => {
        event.preventDefault();
        if (type === "gesturestart") {
          state.gestureStartScale = state.camera.targetScale;
        } else if (type === "gesturechange") {
          zoomCameraToCenter(state.gestureStartScale * event.scale);
        }
      },
      { passive: false }
    );
  });

  els.cosmosCanvas.addEventListener("pointerdown", (event) => {
    els.cosmosCanvas.setPointerCapture(event.pointerId);
    state.three.dragging = true;
    state.three.moved = false;
    state.three.lastX = event.clientX;
    state.three.lastY = event.clientY;
    state.three.mode = event.shiftKey || event.button === 1 ? "pan" : "rotate";
    const point = canvasPointFromEvent(event, els.cosmosCanvas);
    state.drag = {
      pointerId: event.pointerId,
      x: point.x,
      y: point.y,
      moved: false,
    };
  });

  els.cosmosCanvas.addEventListener("pointermove", (event) => {
    handleThreePointerMove(event);
    if (state.three.dragging) return;
    if (!state.drag || state.drag.pointerId !== event.pointerId) return;
    const { x, y } = canvasPointFromEvent(event, els.cosmosCanvas);
    const dx = x - state.drag.x;
    const dy = y - state.drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) state.drag.moved = true;
    panCamera(dx, dy);
    state.drag.x = x;
    state.drag.y = y;
  });

  els.cosmosCanvas.addEventListener("pointerup", () => {
    const moved = state.three.moved;
    state.three.dragging = false;
    if (state.drag?.moved || moved) {
      state.suppressClick = true;
      setTimeout(() => {
        state.suppressClick = false;
        state.three.moved = false;
      }, 0);
    }
    state.drag = null;
  });

  els.cosmosCanvas.addEventListener("pointercancel", () => {
    state.three.dragging = false;
    state.drag = null;
  });

  els.cosmosCanvas.addEventListener("mousemove", (event) => {
    const hit = nearestHit(event, 8);
    els.cosmosCanvas.style.cursor = hit ? "pointer" : "default";
    if (hit) {
      const node = state.nodeMap.get(hit.id);
      els.cosmosHint.textContent = `${node.label} · 点击查看轨道关系`;
    } else {
      els.cosmosHint.textContent = state.selectedId
        ? `已选择 ${nodeLabel(state.selectedId)}`
        : "点击星体查看轨道关系";
    }
  });

  els.packageInput.addEventListener("change", handlePackageUpload);
  els.mergePackageButton?.addEventListener("click", () => mergeUploadedPackage(false));
  els.dryRunPackageButton?.addEventListener("click", () => mergeUploadedPackage(true));
  els.refreshManageButton?.addEventListener("click", reloadKnowledgeData);
  els.managerSearchInput?.addEventListener("input", (event) => {
    state.manager.query = event.target.value.trim();
    renderManage();
  });
  els.saveNodeButton?.addEventListener("click", saveManagedNode);
  els.deleteNodeButton?.addEventListener("click", deleteManagedNode);
  els.openNodeInCosmosButton?.addEventListener("click", () => {
    if (!state.manager.selectedNodeId) return;
    selectNode(state.manager.selectedNodeId, true);
    setView("cosmos");
  });
  els.managerEdgeSelect?.addEventListener("change", (event) => {
    state.manager.selectedEdgeId = event.target.value || "__new__";
    renderManageEdgeForm();
  });
  els.saveEdgeButton?.addEventListener("click", saveManagedEdge);
  els.deleteEdgeButton?.addEventListener("click", deleteManagedEdge);
  els.saveLifecycleButton?.addEventListener("click", saveManagedLifecycle);
  els.refreshAutomationButton?.addEventListener("click", async () => {
    await loadNotificationConfig();
    renderAutomation();
  });
  els.saveAutomationButton?.addEventListener("click", saveAutomationConfig);
  els.testDailyButton?.addEventListener("click", () => testAutomation("daily"));
  els.testWeeklyButton?.addEventListener("click", () => testAutomation("weekly"));
  els.resetDemoButton?.addEventListener("click", () => resetKnowledgeExample("demo"));
  els.resetBlankButton?.addEventListener("click", () => resetKnowledgeExample("blank"));
  els.resetCameraButton.addEventListener("click", resetCamera);
  els.galaxyViewButton.addEventListener("click", () => setCosmosView("galaxy"));
  els.metaViewButton.addEventListener("click", () => setCosmosView("meta"));
  els.cometViewButton.addEventListener("click", () => setCosmosView("comet"));
  els.touchModeButton.addEventListener("click", () => setControlMode("touch"));
  els.cameraModeButton.addEventListener("click", () => setControlMode("camera"));
  els.reviewTimeline.addEventListener("input", (event) => {
    setReviewTimelineDay(Number(event.target.value), false);
  });
  els.reviewTimelineToggle.addEventListener("click", () => {
    state.reviewTimeline.playing = !state.reviewTimeline.playing;
    state.reviewTimeline.lastTick = 0;
    renderReviewTimeline();
  });
  els.pathModeButton.addEventListener("click", () => {
    state.pathMode = !state.pathMode;
    renderControlMode();
  });

  window.addEventListener("resize", () => {
    sizeCanvas(els.ambientCanvas);
    sizeCanvas(els.previewCanvas);
    sizeCanvas(els.cosmosCanvas);
    resetLayout();
  });
}

function setView(view) {
  state.view = view || "home";
  if (state.view === "cosmos") resetLayout();
  renderAll();
  requestAnimationFrame(() => {
    sizeCanvas(els.previewCanvas);
    sizeCanvas(els.cosmosCanvas);
  });
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${SERVICE_API_PREFIX}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || response.statusText || "API request failed");
  }
  return data;
}

async function loadServiceStatus() {
  try {
    const status = await apiRequest("/status");
    state.service = { available: true, status, error: "" };
  } catch (error) {
    state.service = { available: false, status: null, error: error.message };
  }
}

async function loadNotificationConfig() {
  if (!state.service.available) return;
  try {
    state.notification = await apiRequest("/notification");
  } catch (error) {
    state.notification = null;
    state.manager.reports.automation = `读取自动化配置失败：${error.message}`;
  }
}

async function reloadKnowledgeData() {
  await loadServiceStatus();
  await loadGraph();
  await loadLifecycle();
  state.markdown = new Map();
  await loadLinkedMarkdown();
  await loadDailyBrief();
  await loadBookRecommendations();
  await loadNotificationConfig();
  state.cosmosMetrics = { key: "", map: new Map() };
  resetLayout();
  renderAll();
}

async function loadGraph() {
  state.graphError = "";
  try {
    state.graph = await fetchGraphData();
    state.nodeMap = new Map(state.graph.nodes.map((node) => [node.id, node]));
    state.edgeMap = new Map(state.graph.edges.map((edge) => [edge.id, edge]));
    state.dataRefresh.signature = knowledgeDataSignature(state.graph, state.lifecycle);
    els.graphStatus.textContent = `${state.graph.nodes.length} 节点 · ${state.graph.edges.length} 关系`;
  } catch (error) {
    console.error(error);
    state.graphError = location.protocol === "file:"
      ? "当前是 file:// 打开，浏览器不能稳定读取项目知识库。请使用 http://localhost:8765/site/"
      : `未读取到 knowledge/data/graph.json：${error.message}`;
    state.graph = { version: 1, updated_at: "", nodes: [], edges: [] };
    state.nodeMap = new Map();
    state.edgeMap = new Map();
    els.graphStatus.textContent = location.protocol === "file:" ? "请使用本地服务打开" : "未读取到图谱";
  }
}

async function fetchGraphData() {
  const response = await fetchFirst(projectUrls("knowledge/data/graph.json"));
  return normalizeGraph(await response.json());
}

function normalizeGraph(graph) {
  return {
    version: graph?.version || 1,
    updated_at: graph?.updated_at || "",
    nodes: Array.isArray(graph?.nodes) ? graph.nodes : [],
    edges: Array.isArray(graph?.edges) ? graph.edges : [],
  };
}

async function loadLifecycle() {
  state.lifecycleError = "";
  try {
    const response = await fetchFirst(projectUrls("knowledge/data/cosmos-lifecycle.json"));
    const lifecycle = await response.json();
    state.lifecycle = normalizeLifecycle(lifecycle);
  } catch (error) {
    state.lifecycleError = error.message;
    state.lifecycle = normalizeLifecycle({});
  }
}

function startDataRefresh() {
  if (state.dataRefresh.timer) return;
  state.dataRefresh.signature = knowledgeDataSignature(state.graph, state.lifecycle);
  state.dataRefresh.timer = window.setInterval(refreshKnowledgeDataIfChanged, DATA_REFRESH_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshKnowledgeDataIfChanged();
  });
}

async function refreshKnowledgeDataIfChanged() {
  if (state.dataRefresh.running) return;
  state.dataRefresh.running = true;
  state.dataRefresh.lastCheckedAt = Date.now();
  try {
    const [nextGraph, nextLifecycle, nextDailyBrief, nextBookRecommendations] = await Promise.all([
      fetchGraphData(),
      fetchLifecycleData(),
      fetchDailyBriefData().catch(() => state.dailyBrief || buildFallbackDailyBrief()),
      fetchBookRecommendationsData().catch(() => state.bookRecommendations),
    ]);
    const nextSignature = knowledgeDataSignature(nextGraph, nextLifecycle, nextDailyBrief, nextBookRecommendations);
    if (nextSignature === state.dataRefresh.signature) return;

    const graphChanged = graphStructureSignature(nextGraph) !== graphStructureSignature(state.graph);
    state.graph = nextGraph;
    state.lifecycle = nextLifecycle;
    state.dailyBrief = nextDailyBrief;
    state.dailyBriefError = "";
    state.bookRecommendations = nextBookRecommendations;
    state.nodeMap = new Map(state.graph.nodes.map((node) => [node.id, node]));
    state.edgeMap = new Map(state.graph.edges.map((edge) => [edge.id, edge]));
    state.dataRefresh.signature = nextSignature;
    state.dataRefresh.lastAppliedAt = Date.now();
    els.graphStatus.textContent = `${state.graph.nodes.length} 节点 · ${state.graph.edges.length} 关系`;

    if (graphChanged) {
      state.markdown = new Map();
      await loadLinkedMarkdown();
    }
    resetLayout();
    state.cosmosMetrics = { key: "", map: new Map() };
    state.three.lastKey = "";
    renderAll();
  } catch (error) {
    console.warn("Knowledge data refresh skipped.", error);
  } finally {
    state.dataRefresh.running = false;
  }
}

async function fetchLifecycleData() {
  try {
    const response = await fetchFirst(projectUrls("knowledge/data/cosmos-lifecycle.json"));
    return normalizeLifecycle(await response.json());
  } catch {
    return normalizeLifecycle({});
  }
}

function knowledgeDataSignature(graph, lifecycle, dailyBrief = state.dailyBrief, bookRecommendations = state.bookRecommendations) {
  return [
    graphStructureSignature(graph),
    lifecycle?.updated_at || "",
    Object.keys(lifecycle?.records || {}).length,
    Array.isArray(lifecycle?.syntheses) ? lifecycle.syntheses.length : 0,
    dailyBriefSignature(dailyBrief),
    bookRecommendationSignature(bookRecommendations),
  ].join("::");
}

function graphStructureSignature(graph) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  return [
    graph?.updated_at || "",
    nodes.length,
    edges.length,
    nodes.map((node) => `${node.id}:${node.type}:${node.label}:${node.confidence}`).join("|"),
    edges.map((edge) => `${edge.id}:${edge.from}:${edge.to}:${edge.type}:${edge.confidence}`).join("|"),
  ].join("::");
}

function dailyBriefSignature(brief) {
  if (!isObject(brief)) return "";
  return [
    brief.date || "",
    brief.focus_question?.text || "",
    Array.isArray(brief.fuzzy_points) ? brief.fuzzy_points.length : 0,
    brief.ai_prompt || "",
  ].join("::");
}

function bookRecommendationSignature(recommendations) {
  return Array.isArray(recommendations)
    ? recommendations.map((item) => `${item.title || ""}:${item.author || ""}`).join("|")
    : "";
}

async function loadCelestialAssets() {
  state.celestialAssetsError = "";
  try {
    const response = await fetchFirst(projectUrls(CELESTIAL_ASSET_MANIFEST));
    const manifest = await response.json();
    state.celestialAssets = {
      version: manifest.version || 1,
      profiles: isObject(manifest.profiles) ? manifest.profiles : {},
    };
  } catch (error) {
    console.warn("Celestial texture manifest unavailable; using procedural textures.", error);
    state.celestialAssetsError = error.message;
    state.celestialAssets = { version: 0, profiles: {} };
  }
}

function normalizeLifecycle(raw) {
  const records = isObject(raw?.records) ? raw.records : {};
  const syntheses = Array.isArray(raw?.syntheses) ? raw.syntheses.filter(isObject) : [];
  return {
    version: raw?.version || 1,
    updated_at: raw?.updated_at || "",
    records,
    syntheses,
  };
}

async function loadLinkedMarkdown() {
  const paths = new Set();
  for (const node of state.graph.nodes) {
    for (const path of nodePaths(node)) paths.add(path);
  }

  await Promise.all(
    [...paths].map(async (path) => {
      try {
        const response = await fetchFirst(projectUrls(path));
        state.markdown.set(path, await response.text());
      } catch (error) {
        console.warn("Markdown load failed", path, error);
      }
    })
  );

  state.extracted = extractMarkdownSignals();
}

async function loadDailyBrief() {
  state.dailyBriefError = "";
  try {
    state.dailyBrief = await fetchDailyBriefData();
  } catch (error) {
    state.dailyBriefError = error.message;
    state.dailyBrief = buildFallbackDailyBrief();
  }
}

async function fetchDailyBriefData() {
  const response = await fetchFirst(projectUrls("knowledge/reports/daily-growth-latest.json"));
  return response.json();
}

async function loadBookRecommendations() {
  try {
    state.bookRecommendations = await fetchBookRecommendationsData();
  } catch (error) {
    state.bookRecommendations = [];
  }
}

async function fetchBookRecommendationsData() {
  const response = await fetchFirst(projectUrls("knowledge/index/book-recommendations.json"));
  const data = await response.json();
  const books = Array.isArray(data) ? data : data.books;
  return Array.isArray(books) ? books : [];
}

function renderAll() {
  renderNav();
  renderCosmosView();
  renderControlMode();
  renderFilters();
  renderDailyBrief();
  renderHome();
  renderTasks();
  renderArchive();
  renderManage();
  renderAutomation();
  renderImport();
  renderExamples();
  renderDetail();
}

function setCosmosView(view) {
  if (!COSMOS_VIEW_LABELS[view] || state.cosmosView === view) return;
  state.cosmosView = view;
  state.selectedId = "";
  resetLayout();
  state.three.lastKey = "";
  renderAll();
}

function renderCosmosView() {
  els.galaxyViewButton?.classList.toggle("active", state.cosmosView === "galaxy");
  els.metaViewButton?.classList.toggle("active", state.cosmosView === "meta");
  els.cometViewButton?.classList.toggle("active", state.cosmosView === "comet");
}

function renderNav() {
  document.body.classList.toggle("cosmos-mode", state.view === "cosmos");
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === state.view);
  });
}

function renderControlMode() {
  els.touchModeButton.classList.toggle("active", state.controlMode === "touch");
  els.cameraModeButton.classList.toggle("active", state.controlMode === "camera");
  els.pathModeButton.classList.toggle("active", state.pathMode);
  els.gestureHud.hidden = state.controlMode !== "camera";
  renderReviewTimeline();
  if (state.controlMode === "touch") {
    els.cosmosHint.textContent = state.three.ready
      ? "拖拽或双指滑动旋转视角，捏合缩放，按住 Shift 平移"
      : "拖拽或双指滑动漫游，捏合缩放";
  }
}

function updateReviewTimeline(now) {
  const timeline = state.reviewTimeline;
  if (!timeline.playing || state.view !== "cosmos") {
    timeline.lastTick = now;
    return;
  }
  if (!timeline.lastTick) timeline.lastTick = now;
  const elapsed = Math.min(180, Math.max(0, now - timeline.lastTick));
  timeline.lastTick = now;
  timeline.progressMs = (timeline.progressMs + elapsed) % timeline.cycleMs;
  const nextDay = Math.round((timeline.progressMs / timeline.cycleMs) * timeline.cycleDays);
  if (nextDay !== timeline.days) {
    setReviewTimelineDay(nextDay, true);
  } else {
    renderReviewTimeline();
  }
}

function setReviewTimelineDay(value, playing = state.reviewTimeline.playing) {
  const timeline = state.reviewTimeline;
  const nextDay = Math.round(clamp(Number(value) || 0, 0, timeline.cycleDays));
  timeline.days = nextDay;
  timeline.playing = playing;
  timeline.progressMs = (nextDay / timeline.cycleDays) * timeline.cycleMs;
  timeline.lastTick = 0;
  timeline.renderedDay = -1;
  renderReviewTimeline();
}

function renderReviewTimeline() {
  if (!els.reviewTimeline) return;
  const timeline = state.reviewTimeline;
  const day = Math.round(timeline.days);
  els.reviewTimeline.max = String(timeline.cycleDays);
  els.reviewTimeline.value = String(day);
  els.reviewTimelineLabel.textContent = day <= 0 ? "今天" : `${day} 天后`;
  els.reviewTimelineToggle.textContent = timeline.playing ? "暂停" : "播放";
  els.reviewTimelineToggle.classList.toggle("paused", !timeline.playing);
  els.reviewTimelineToggle.setAttribute("aria-label", timeline.playing ? "暂停遗忘曲线动画" : "播放遗忘曲线动画");
  if (timeline.renderedDay === day && els.reviewTimelineStats.textContent !== "等待知识生命史") return;
  timeline.renderedDay = day;

  if (!state.graph.nodes.length) {
    els.reviewTimelineStats.textContent = "等待知识生命史";
    return;
  }
  const metrics = cosmosMetrics();
  let due = 0;
  let fading = 0;
  let dormant = 0;
  for (const node of state.graph.nodes) {
    const lifecycle = (metrics.get(node.id) || fallbackMetric(node)).lifecycle;
    if (lifecycle.reviewDue) due += 1;
    if (lifecycle.stage === "fading") fading += 1;
    if (lifecycle.stage === "dormant" || lifecycle.stage === "remnant") dormant += 1;
  }
  els.reviewTimelineStats.textContent = `${due} 个待复习 · ${fading} 个变暗 · ${dormant} 个沉寂`;
}

function renderFilters() {
  setOptions(
    els.typeFilter,
    [["", "全部类型"], ...unique(state.graph.nodes.map((node) => node.type)).map((type) => [type, typeLabel(type)])],
    state.filters.type
  );
  setOptions(
    els.tagFilter,
    [["", "全部主题"], ...allTags().map((tag) => [tag, tag])],
    state.filters.tag
  );
  els.confidenceFilter.value = state.filters.confidence;
}

function renderDailyBrief() {
  const brief = state.dailyBrief || buildFallbackDailyBrief();
  const focus = brief.focus_question || {};
  const fuzzy = Array.isArray(brief.fuzzy_points) ? brief.fuzzy_points : [];
  const supplements = Array.isArray(brief.supplements) ? brief.supplements : [];
  const action = brief.action_review || {};
  const recommendation = brief.recommendation || {};
  const generated = brief.date || "";

  if (els.dailyBriefMeta) {
    els.dailyBriefMeta.textContent = state.dailyBriefError ? "本地推导" : generated ? `生成于 ${generated}` : "等待生成";
  }
  if (els.dailyFocusQuestion) els.dailyFocusQuestion.textContent = focus.text || "暂无每日简报";
  if (els.dailyFocusReason) {
    els.dailyFocusReason.textContent = focus.reason || "运行每日简报脚本后，这里会显示今天最值得开启的 AI 对话。";
  }
  if (els.dailyFuzzyList) {
    els.dailyFuzzyList.innerHTML = fuzzy.length
      ? fuzzy.slice(0, 3).map((item) => textItem(item.text || "", item.source || item.reason || "")).join("")
      : empty("暂无明显模糊点。");
  }
  if (els.dailyAiPrompt) {
    els.dailyAiPrompt.value = brief.ai_prompt || fallbackAiPrompt(focus, fuzzy, supplements, action);
  }
  if (els.taskFuzzyList) {
    const combined = [
      ...fuzzy.map((item) => ({ text: item.text || "", source: item.source || item.reason || "" })),
      ...supplements.map((item) => ({ text: item.text || "", source: item.source || "" })),
    ];
    els.taskFuzzyList.innerHTML = combined.length
      ? combined.slice(0, 6).map((item) => textItem(item.text, item.source)).join("")
      : empty("暂无需要追问的模糊点。");
  }
  if (els.taskActionReview) {
    els.taskActionReview.innerHTML = textItem(action.prompt || "今天从一个知识点设计最小行动实验。", `${action.text || "行动回访"} · ${action.status || "open"}`);
  }
  if (els.taskRecommendation) {
    const title = recommendation.title || "暂无推荐";
    const author = recommendation.author ? ` · ${recommendation.author}` : "";
    const reason = recommendation.why_read || "生成每日简报后会根据知识缺口和成长路线推荐。";
    els.taskRecommendation.innerHTML = `
      <div class="recommendation-card">
        <span class="item-type">${escapeHtml(Array.isArray(recommendation.domain) ? recommendation.domain.slice(0, 3).join(" / ") : recommendation.domain || "推荐阅读")}</span>
        <strong>${escapeHtml(title)}${escapeHtml(author)}</strong>
        <p>${escapeHtml(reason)}</p>
      </div>
    `;
  }
}

function renderHome() {
  const nodes = state.graph.nodes;
  const edges = state.graph.edges;
  const books = nodes.filter((node) => node.type === "book");
  const actions = nodes.filter((node) => node.type === "action");
  const questions = nodes.filter((node) => node.type === "question");
  const themes = allTags();
  const health = healthCheck();

  els.previewNodeCount.textContent = nodes.length;
  els.metricGrid.innerHTML = [
    metric("知识节点", nodes.length),
    metric("关系轨道", edges.length),
    metric("书本档案", books.length),
    metric("成长任务", actions.length + questions.length + state.extracted.review.length),
    metric("健康缺口", health.orphans.length + health.missingSources.length),
  ].join("");

  const degree = nodeDegrees();
  const metrics = cosmosMetrics();
  const suggested = [...nodes]
    .sort((a, b) => ((metrics.get(b.id) || fallbackMetric(b)).mass - (metrics.get(a.id) || fallbackMetric(a)).mass) || (degree.get(b.id) || 0) - (degree.get(a.id) || 0))
    .slice(0, 5);
  els.suggestedList.innerHTML = suggested.length
    ? suggested.map((node) => {
        const metric = metrics.get(node.id) || fallbackMetric(node);
        return nodeButton(node, `${roleLabel(metric.role)} · M ${metric.mass.toFixed(1)}`);
      }).join("")
    : empty("还没有可探索节点。");
  bindNodeButtons(els.suggestedList);

  const pending = [
    ...questions.map((node) => ({ text: node.label, source: node.summary, nodeId: node.id })),
    ...state.extracted.pending,
  ].slice(0, 5);
  els.pendingQuestions.innerHTML = pending.length
    ? pending.map((item) => textItem(item.text, item.source, item.nodeId)).join("")
    : empty("暂无待追问。");
  bindNodeButtons(els.pendingQuestions);
}

function renderTasks() {
  const actions = state.graph.nodes.filter((node) => node.type === "action");
  const questions = state.graph.nodes.filter((node) => node.type === "question");
  const reviews = [
    ...questions.map((node) => ({ text: node.label, source: node.summary, nodeId: node.id })),
    ...state.extracted.review,
    ...state.extracted.pending,
  ];
  const health = healthCheck();

  els.actionList.innerHTML = actions.length
    ? actions.map((node) => nodeButton(node, node.metadata?.status || "行动实验")).join("")
    : empty("暂无行动实验。");
  bindNodeButtons(els.actionList);

  els.reviewList.innerHTML = reviews.length
    ? reviews.slice(0, 12).map((item) => textItem(item.text, item.source, item.nodeId)).join("")
    : empty("暂无复习问题。");
  bindNodeButtons(els.reviewList);

  els.healthSummary.innerHTML = [
    healthItem("孤立节点", `${health.orphans.length} 个`, health.orphans.length ? "warn" : "ok"),
    healthItem("缺少来源", `${health.missingSources.length} 个`, health.missingSources.length ? "warn" : "ok"),
    healthItem("缺失端点关系", `${health.missingEndpoints.length} 条`, health.missingEndpoints.length ? "error" : "ok"),
    healthItem("可读取文档", `${state.markdown.size} 个`, state.markdown.size ? "ok" : "warn"),
  ].join("");

  const suggestions = [];
  if (health.orphans.length) suggestions.push(`给 ${health.orphans[0].label} 增加至少 1 条关系。`);
  if (health.missingSources.length) suggestions.push(`补齐 ${health.missingSources[0].label} 的来源路径或来源节点。`);
  if (!state.extracted.review.length) suggestions.push("为核心书籍补充可复习问题，让网站能形成复习队列。");
  if (!suggestions.length) suggestions.push("当前结构健康，可以继续通过读书或复盘扩展新节点。");
  els.healthSuggestions.innerHTML = suggestions.map((text) => textItem(text, "维护建议")).join("");
}

function renderArchive() {
  const books = state.graph.nodes.filter((node) => node.type === "book");
  els.bookCount.textContent = `${books.length} 本`;
  els.bookList.innerHTML = books.length
    ? books.map((node) => nodeButton(node, node.metadata?.author || "书本")).join("")
    : empty("暂无书本。");
  bindNodeButtons(els.bookList);

  const themes = allThemes();
  els.themeList.innerHTML = themes.length
    ? themes.map((theme) => `<button class="chip" data-theme="${escapeAttr(theme.name)}">${escapeHtml(theme.name)} · ${theme.count}</button>`).join("")
    : empty("暂无主题。");
  els.themeList.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.tag = button.dataset.theme;
      state.view = "cosmos";
      renderAll();
    });
  });

  const sources = sourceRecords();
  els.sourceList.innerHTML = sources.length
    ? sources.map((source) => textItem(source.path, source.label, source.nodeId)).join("")
    : empty("暂无来源档案。");
  bindNodeButtons(els.sourceList);
}

function renderManage() {
  if (!els.managerNodeList) return;
  const serviceText = state.service.available ? "本地服务已连接" : "请用 scripts/serve_knowledge_site.py 打开";
  els.managerStatus.textContent = serviceText;
  const query = state.manager.query.toLowerCase();
  const nodes = state.graph.nodes.filter((node) => {
    if (!query) return true;
    return [node.id, node.label, node.summary, node.type, ...(node.tags || [])].join(" ").toLowerCase().includes(query);
  });
  if (!state.manager.selectedNodeId || !state.nodeMap.has(state.manager.selectedNodeId)) {
    state.manager.selectedNodeId = nodes[0]?.id || state.graph.nodes[0]?.id || "";
  }
  els.managerNodeList.innerHTML = nodes.length
    ? nodes.map((node) => {
        const metric = cosmosMetrics().get(node.id) || fallbackMetric(node);
        const active = node.id === state.manager.selectedNodeId ? " active" : "";
        return `
          <button class="manager-node-row${active}" data-manage-node="${escapeAttr(node.id)}">
            <span>
              <strong>${escapeHtml(node.label)}</strong>
              <small>${escapeHtml(node.id)}</small>
            </span>
            <em>${escapeHtml(typeLabel(node.type))} · ${escapeHtml(roleLabel(metric.role))}</em>
          </button>
        `;
      }).join("")
    : empty("没有匹配节点。");
  els.managerNodeList.querySelectorAll("[data-manage-node]").forEach((button) => {
    button.addEventListener("click", () => {
      state.manager.selectedNodeId = button.dataset.manageNode;
      renderManage();
    });
  });
  renderManageNodeForm();
  renderManageEdgeForm();
  renderManageLifecycleForm();
}

function renderManageNodeForm() {
  const node = state.nodeMap.get(state.manager.selectedNodeId);
  setOptions(els.managerNodeType, Object.keys(TYPE_LABELS).map((type) => [type, typeLabel(type)]), node?.type || "concept");
  setOptions(els.managerNodeConfidence, [["high", "high"], ["medium", "medium"], ["low", "low"]], node?.confidence || "medium");
  setOptions(
    els.managerCosmosRole,
    [["", "自动推断"], ["galaxy", "元认知星系"], ["star", "恒星"], ["planet", "行星"], ["bridge", "星际桥"], ["comet", "彗星"]],
    node?.metadata?.cosmos?.role || ""
  );
  const galaxies = state.graph.nodes.filter((item) => item.type === "theme" && item.metadata?.cosmos?.role === "galaxy");
  setOptions(
    els.managerSourceAnchor,
    [["", "自动归属"], ...galaxies.map((item) => [item.id, item.label])],
    node?.metadata?.cosmos?.source_anchor || ""
  );
  setOptions(els.managerNodeStatus, [["", "无"], ["open", "open"], ["active", "active"], ["done", "done"]], node?.metadata?.status || "");
  els.managerNodeMeta.textContent = node ? `${relationsFor(node.id).length} 条关系` : "未选择";
  els.managerNodeId.value = node?.id || "";
  els.managerNodeLabel.value = node?.label || "";
  els.managerNodeSummary.value = node?.summary || "";
  els.managerNodeTags.value = Array.isArray(node?.tags) ? node.tags.join(", ") : "";
  els.managerNodeSource.value = node?.source || "";
  els.managerCardPath.value = node?.metadata?.card_path || node?.metadata?.book_note || node?.metadata?.source_path || node?.metadata?.import_path || "";
  els.managerNodeReport.innerHTML = state.manager.reports.node ? packageItem(state.manager.reports.node, "ok") : "";
}

function renderManageEdgeForm() {
  const edges = state.graph.edges;
  const selected = state.manager.selectedEdgeId || "__new__";
  setOptions(
    els.managerEdgeSelect,
    [["__new__", "新增关系"], ...edges.map((edge) => [edge.id, `${edge.type}: ${nodeLabel(edge.from)} -> ${nodeLabel(edge.to)}`])],
    selected
  );
  const edge = selected === "__new__" ? null : edges.find((item) => item.id === selected);
  const nodeOptions = state.graph.nodes.map((node) => [node.id, `${node.label} (${node.type})`]);
  setOptions(els.managerEdgeType, [...ALLOWED_EDGE_TYPES].sort().map((type) => [type, type]), edge?.type || "supports");
  setOptions(els.managerEdgeFrom, nodeOptions, edge?.from || state.manager.selectedNodeId || nodeOptions[0]?.[0] || "");
  setOptions(els.managerEdgeTo, nodeOptions, edge?.to || nodeOptions.find(([id]) => id !== els.managerEdgeFrom.value)?.[0] || nodeOptions[0]?.[0] || "");
  setOptions(els.managerEdgeConfidence, [["high", "high"], ["medium", "medium"], ["low", "low"]], edge?.confidence || "medium");
  els.managerEdgeMeta.textContent = edge ? edge.id : "新增关系";
  els.managerEdgeId.value = edge?.id || "";
  els.managerEdgeEvidence.value = edge?.evidence || "";
  els.managerEdgeReport.innerHTML = state.manager.reports.edge ? packageItem(state.manager.reports.edge, "ok") : "";
}

function renderManageLifecycleForm() {
  const nodeId = state.manager.selectedNodeId;
  const record = isObject(state.lifecycle.records?.[nodeId]) ? state.lifecycle.records[nodeId] : {};
  setOptions(
    els.managerLifecycleStage,
    [["", "自动推断"], ...Object.entries(LIFECYCLE_STAGE_LABELS).map(([value, label]) => [value, label])],
    record.stage || ""
  );
  els.managerLastReviewed.value = record.last_reviewed_at || "";
  els.managerReviewCount.value = Number.isInteger(record.review_count) ? String(record.review_count) : "0";
  els.managerLastPracticed.value = record.last_practiced_at || "";
  els.managerPracticeCount.value = Number.isInteger(record.practice_count) ? String(record.practice_count) : "0";
  els.managerMastery.value = typeof record.mastery === "number" ? String(record.mastery) : "0.5";
  els.managerLifecycleReport.innerHTML = state.manager.reports.lifecycle ? packageItem(state.manager.reports.lifecycle, "ok") : "";
}

async function saveManagedNode() {
  const current = state.nodeMap.get(state.manager.selectedNodeId);
  if (!current) return;
  if (els.managerNodeType.value !== current.type) {
    state.manager.reports.node = "暂不支持直接修改节点类型；类型会影响 ID 前缀和关系端点，请新建知识包迁移。";
    renderManageNodeForm();
    return;
  }
  const metadata = structuredCloneSafe(current.metadata || {});
  const cosmos = structuredCloneSafe(metadata.cosmos || {});
  const role = els.managerCosmosRole.value;
  const anchor = els.managerSourceAnchor.value;
  if (role) cosmos.role = role;
  else delete cosmos.role;
  if (anchor) cosmos.source_anchor = anchor;
  else delete cosmos.source_anchor;
  if (Object.keys(cosmos).length) metadata.cosmos = cosmos;
  else delete metadata.cosmos;
  const status = els.managerNodeStatus.value;
  if (status) metadata.status = status;
  else delete metadata.status;
  const docPath = els.managerCardPath.value.trim();
  ["card_path", "book_note", "source_path", "import_path"].forEach((key) => delete metadata[key]);
  if (docPath) {
    if (docPath.startsWith("knowledge/books/")) metadata.book_note = docPath;
    else if (docPath.startsWith("knowledge/imports/")) metadata.import_path = docPath;
    else metadata.card_path = docPath;
  }
  const node = {
    ...current,
    type: els.managerNodeType.value,
    label: els.managerNodeLabel.value.trim(),
    summary: els.managerNodeSummary.value.trim(),
    confidence: els.managerNodeConfidence.value,
    source: els.managerNodeSource.value.trim(),
    tags: els.managerNodeTags.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
    metadata,
  };
  try {
    await apiRequest("/nodes/update", { method: "POST", body: JSON.stringify({ node }) });
    state.manager.reports.node = "节点已保存。";
    await reloadKnowledgeData();
  } catch (error) {
    state.manager.reports.node = `保存失败：${error.message}`;
    renderManage();
  }
}

async function deleteManagedNode() {
  const node = state.nodeMap.get(state.manager.selectedNodeId);
  if (!node || !confirm(`删除节点「${node.label}」及其相关关系？`)) return;
  try {
    await apiRequest("/nodes/delete", { method: "POST", body: JSON.stringify({ id: node.id }) });
    state.manager.selectedNodeId = "";
    state.manager.reports.node = "节点已删除。";
    await reloadKnowledgeData();
  } catch (error) {
    state.manager.reports.node = `删除失败：${error.message}`;
    renderManage();
  }
}

async function saveManagedEdge() {
  const from = els.managerEdgeFrom.value;
  const to = els.managerEdgeTo.value;
  const type = els.managerEdgeType.value;
  const id = els.managerEdgeId.value.trim() || edgeIdFor(from, type, to);
  const existing = state.edgeMap.get(id);
  const edge = {
    ...(existing || {}),
    id,
    type,
    from,
    to,
    confidence: els.managerEdgeConfidence.value,
    evidence: els.managerEdgeEvidence.value.trim(),
    metadata: existing?.metadata || {},
  };
  try {
    await apiRequest("/edges/update", { method: "POST", body: JSON.stringify({ edge }) });
    state.manager.selectedEdgeId = id;
    state.manager.reports.edge = "关系已保存。";
    await reloadKnowledgeData();
  } catch (error) {
    state.manager.reports.edge = `保存失败：${error.message}`;
    renderManageEdgeForm();
  }
}

async function deleteManagedEdge() {
  const id = state.manager.selectedEdgeId;
  if (!id || id === "__new__" || !confirm(`删除关系 ${id}？`)) return;
  try {
    await apiRequest("/edges/delete", { method: "POST", body: JSON.stringify({ id }) });
    state.manager.selectedEdgeId = "__new__";
    state.manager.reports.edge = "关系已删除。";
    await reloadKnowledgeData();
  } catch (error) {
    state.manager.reports.edge = `删除失败：${error.message}`;
    renderManageEdgeForm();
  }
}

async function saveManagedLifecycle() {
  const nodeId = state.manager.selectedNodeId;
  if (!nodeId) return;
  const record = {};
  if (els.managerLastReviewed.value) record.last_reviewed_at = els.managerLastReviewed.value;
  record.review_count = Math.max(0, Math.floor(Number(els.managerReviewCount.value) || 0));
  if (els.managerLastPracticed.value) record.last_practiced_at = els.managerLastPracticed.value;
  record.practice_count = Math.max(0, Math.floor(Number(els.managerPracticeCount.value) || 0));
  record.mastery = clamp(Number(els.managerMastery.value) || 0, 0, 1);
  if (els.managerLifecycleStage.value) record.stage = els.managerLifecycleStage.value;
  try {
    await apiRequest("/lifecycle/update", { method: "POST", body: JSON.stringify({ node_id: nodeId, record }) });
    state.manager.reports.lifecycle = "生命史已保存。";
    await reloadKnowledgeData();
  } catch (error) {
    state.manager.reports.lifecycle = `保存失败：${error.message}`;
    renderManageLifecycleForm();
  }
}

function renderAutomation() {
  if (!els.timeCalibration) return;
  const config = state.notification || {};
  const next = config.next_send_times || {};
  els.beijingTimeStatus.textContent = config.beijing_now ? `北京时间 ${formatDateTime(config.beijing_now)}` : "等待本地服务";
  els.webhookStatus.textContent = config.has_webhook ? `已配置 ${config.webhook_masked || ""}` : "未配置";
  els.timeCalibration.innerHTML = [
    healthItem("本地服务", state.service.available ? "已连接" : "未连接", state.service.available ? "ok" : "warn"),
    healthItem("北京时间", config.beijing_now ? formatDateTime(config.beijing_now) : "等待校准", config.beijing_now ? "ok" : "warn"),
    healthItem("下次每日", next.daily ? formatDateTime(next.daily) : "未计算", config.daily_enabled ? "ok" : ""),
    healthItem("下次每周", next.weekly ? formatDateTime(next.weekly) : "未计算", config.weekly_enabled ? "ok" : ""),
  ].join("");
  els.dailyEnabledInput.value = String(Boolean(config.daily_enabled));
  els.dailyTimeInput.value = config.daily_time || "09:00";
  els.weeklyEnabledInput.value = String(Boolean(config.weekly_enabled));
  setOptions(els.weeklyDayInput, WEEKDAY_OPTIONS, config.weekly_day || "sunday");
  els.weeklyTimeInput.value = config.weekly_time || "18:00";
  els.automationReport.innerHTML = state.manager.reports.automation ? packageItem(state.manager.reports.automation, state.manager.reports.automation.includes("失败") ? "error" : "ok") : "";
}

async function saveAutomationConfig() {
  try {
    const body = {
      daily_enabled: els.dailyEnabledInput.value === "true",
      daily_time: els.dailyTimeInput.value,
      weekly_enabled: els.weeklyEnabledInput.value === "true",
      weekly_day: els.weeklyDayInput.value,
      weekly_time: els.weeklyTimeInput.value,
    };
    if (els.feishuWebhookInput.value.trim()) body.feishu_webhook = els.feishuWebhookInput.value.trim();
    state.notification = await apiRequest("/notification", { method: "PUT", body: JSON.stringify(body) });
    els.feishuWebhookInput.value = "";
    state.manager.reports.automation = "自动化配置已保存。";
    renderAutomation();
  } catch (error) {
    state.manager.reports.automation = `保存失败：${error.message}`;
    renderAutomation();
  }
}

async function testAutomation(kind) {
  try {
    const body = { kind };
    if (els.feishuWebhookInput.value.trim()) body.feishu_webhook = els.feishuWebhookInput.value.trim();
    const result = await apiRequest("/notification/test", { method: "POST", body: JSON.stringify(body) });
    state.manager.reports.automation = result.sent ? "测试消息已发送。" : "测试请求完成，请检查机器人响应。";
    renderAutomation();
  } catch (error) {
    state.manager.reports.automation = `测试失败：${error.message}`;
    renderAutomation();
  }
}

function renderExamples() {
  if (!els.examplesReport) return;
  els.examplesStatus.textContent = state.manager.reports.examples ? "已执行" : "等待操作";
  els.examplesReport.innerHTML = state.manager.reports.examples
    ? packageItem(state.manager.reports.examples, state.manager.reports.examples.includes("失败") ? "error" : "ok")
    : empty("恢复示例或清空示例后，这里会显示结果。");
}

async function resetKnowledgeExample(mode) {
  const label = mode === "blank" ? "清空当前知识库" : "恢复示例知识库";
  if (!confirm(`${label}？当前 knowledge/ 会被替换。`)) return;
  try {
    await apiRequest("/examples/reset", { method: "POST", body: JSON.stringify({ mode }) });
    state.manager.reports.examples = mode === "blank" ? "已清空为新知识库。" : "已恢复示例知识库。";
    await reloadKnowledgeData();
  } catch (error) {
    state.manager.reports.examples = `${label}失败：${error.message}`;
    renderExamples();
  }
}

function renderImport() {
  if (!state.packageResult) {
    els.packageSummary.innerHTML = empty("选择一个 JSON 文件后，这里会展示节点、关系和文档预览。");
    els.packageReport.innerHTML = empty("等待上传标准知识包。");
    els.packageStatus.textContent = "等待上传";
    els.mergeInstruction.value = "";
    els.mergePackageButton.disabled = true;
    els.dryRunPackageButton.disabled = true;
    return;
  }

  const { pkg, errors, warnings } = state.packageResult;
  const nodes = pkg?.graph_patch?.nodes || [];
  const edges = pkg?.graph_patch?.edges || [];
  const docs = pkg?.documents || [];
  const lifecycleRecords = isObject(pkg?.lifecycle_patch?.records) ? Object.keys(pkg.lifecycle_patch.records).length : 0;
  const lifecycleSyntheses = Array.isArray(pkg?.lifecycle_patch?.syntheses) ? pkg.lifecycle_patch.syntheses.length : 0;

  els.packageSummary.innerHTML = [
    healthItem("Package", pkg?.package_id || "未命名", errors.length ? "error" : "ok"),
    healthItem("文档", `${docs.length} 个`, docs.length ? "ok" : "warn"),
    healthItem("节点", `${nodes.length} 个`, nodes.length ? "ok" : "warn"),
    healthItem("关系", `${edges.length} 条`, edges.length ? "ok" : "warn"),
    healthItem("生命史", `${lifecycleRecords} 记录 · ${lifecycleSyntheses} 凝聚`, lifecycleRecords || lifecycleSyntheses ? "ok" : ""),
  ].join("");

  const report = [];
  if (errors.length) report.push(...errors.map((text) => packageItem(text, "error")));
  if (warnings.length) report.push(...warnings.map((text) => packageItem(text, "warn")));
  if (!errors.length && !warnings.length) report.push(packageItem(state.service.available ? "预检通过：可以直接在网站中合并。" : "预检通过：启动本地服务后可在网站中合并。", "ok"));
  if (!errors.length && warnings.length) report.unshift(packageItem("预检通过，但建议先处理提醒项。", "ok"));
  els.packageReport.innerHTML = report.join("");
  els.packageStatus.textContent = errors.length ? `${errors.length} 个错误` : "预检通过";
  els.mergeInstruction.value = errors.length ? "" : mergeInstruction(pkg, nodes, edges, docs, lifecycleRecords, lifecycleSyntheses);
  els.mergePackageButton.disabled = Boolean(errors.length || !state.service.available);
  els.dryRunPackageButton.disabled = Boolean(errors.length || !state.service.available);
}

function renderDetail() {
  const node = state.nodeMap.get(state.selectedId);
  els.detailPanel.classList.toggle("is-empty", !node);
  if (!node) {
    els.detailPanel.innerHTML = `
      <div class="detail-empty">
        <span class="mini-orb"></span>
        <h3>选择一颗星体</h3>
        <p>查看摘要、轨道关系、来源和对应文档。</p>
      </div>
    `;
    return;
  }

  const related = relationsFor(node.id);
  const paths = nodePaths(node);
  const markdown = paths.map((path) => state.markdown.get(path)).find(Boolean);
  const metric = cosmosMetrics().get(node.id) || fallbackMetric(node);
  els.detailPanel.innerHTML = `
    <div class="detail-head">
      <button class="detail-close" id="detailCloseButton" type="button" aria-label="关闭详情">×</button>
      <div class="detail-kicker">
        <span class="status-pill">${escapeHtml(typeLabel(node.type))}</span>
        <span class="status-pill">${escapeHtml(node.confidence || "unknown")}</span>
        <span class="status-pill">${escapeHtml(roleLabel(metric.role))}</span>
      </div>
      <h3>${escapeHtml(node.label)}</h3>
      <p class="detail-summary">${escapeHtml(node.summary || "暂无摘要。")}</p>
      ${tagsHtml(node)}
      <div class="inline-actions detail-actions">
        <button class="secondary-button" id="manageCurrentNodeButton" type="button">管理此节点</button>
      </div>
    </div>
    <div class="detail-section">
      <h4>宇宙参数</h4>
      <div class="cosmos-meta-grid">
        ${healthItem("质量", `M ${metric.mass.toFixed(1)}`, metric.role === "star" || metric.role === "galaxy" ? "ok" : "")}
        ${healthItem("角色", roleLabel(metric.role), metric.role === "comet" ? "warn" : "")}
        ${healthItem("跨元认知", `${metric.massParts.crossAnchorCount || 0} 条`, metric.massParts.crossAnchorCount ? "ok" : "")}
        ${healthItem("复现", `${Number(metric.massParts.recurrence || 0).toFixed(1)}`, metric.massParts.recurrence ? "ok" : "")}
      </div>
      <p class="detail-meta">${escapeHtml(cosmosExplanation(node, metric))}</p>
    </div>
    ${lifecycleHtml(node, metric)}
    <div class="detail-section">
      <h4>来源</h4>
      <p class="detail-meta">${escapeHtml(sourceText(node, paths))}</p>
    </div>
    ${sourceTraceHtml(node)}
    <div class="detail-section">
      <h4>轨道关系</h4>
      <div class="relation-list">
        ${
          related.length
            ? related
                .map((item) => {
                  const other = item.other;
                  return `
                    <div class="relation-item">
                      <span>${escapeHtml(item.direction)} · ${escapeHtml(item.edge.type)} · ${escapeHtml(item.edge.confidence || "unknown")}</span>
                      <button data-node-id="${escapeAttr(other.id)}">${escapeHtml(other.label)}</button>
                      ${item.edge.evidence ? `<span>${escapeHtml(item.edge.evidence)}</span>` : ""}
                    </div>
                  `;
                })
                .join("")
            : empty("暂无关系。")
        }
      </div>
    </div>
    ${
      markdown
        ? `<div class="detail-section"><h4>文档预览</h4><div class="detail-markdown">${escapeHtml(markdown.slice(0, 1800))}</div></div>`
        : ""
    }
  `;
  els.detailPanel.querySelectorAll("[data-node-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectNode(button.dataset.nodeId, true);
      state.view = "cosmos";
      renderAll();
    });
  });
  els.detailPanel.querySelector("#detailCloseButton")?.addEventListener("click", () => {
    state.selectedId = "";
    state.pathMode = false;
    renderAll();
  });
  els.detailPanel.querySelector("#manageCurrentNodeButton")?.addEventListener("click", () => {
    state.manager.selectedNodeId = node.id;
    state.view = "manage";
    renderAll();
  });
}

function startCanvasLoops() {
  if (state.started) return;
  state.started = true;
  sizeCanvas(els.ambientCanvas);
  sizeCanvas(els.previewCanvas);
  sizeCanvas(els.cosmosCanvas);
  const ambientStars = createStars(180, 1);
  const previewStars = createStars(90, 1.8);

  function frame(now) {
    try {
      if (document.hidden) {
        requestAnimationFrame(frame);
        return;
      }
      sizeCanvas(els.ambientCanvas);
      if (state.view === "home") sizeCanvas(els.previewCanvas);
      if (state.view === "cosmos") sizeCanvas(els.cosmosCanvas);
      drawAmbient(els.ambientCanvas, ambientStars, now);
      if (state.view === "home") drawPreview(els.previewCanvas, previewStars, now);
      updateReviewTimeline(now);
      processGestureFrame(now);
      drawCosmos3D(now);
    } catch (error) {
      console.error("Canvas loop failed", error);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function drawAmbient(canvas, stars, now) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  if (!width || !height) return;
  ctx.clearRect(0, 0, width, height);
  for (const star of stars) {
    const x = ((star.x * width + now * star.speed * 0.004) % width + width) % width;
    const y = star.y * height;
    ctx.globalAlpha = 0.18 + Math.sin(now * 0.001 + star.phase) * 0.08;
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(x, y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPreview(canvas, stars, now) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  if (!width || !height) return;
  ctx.clearRect(0, 0, width, height);
  drawStarfield(ctx, stars, width, height, now, 0.65);

  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.22;
  const gradient = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.42, radius * 0.08, cx, cy, radius * 1.3);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.14, "#8ee8b6");
  gradient.addColorStop(0.56, "#167a89");
  gradient.addColorStop(1, "#08111d");

  ctx.save();
  ctx.shadowColor = "rgba(103, 232, 249, 0.5)";
  ctx.shadowBlur = 44;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const count = Math.max(8, state.graph.nodes.length || 10);
  for (let i = 0; i < count; i += 1) {
    const orbit = radius * (1.45 + (i % 4) * 0.28);
    const angle = now * 0.00018 * (1 + (i % 3) * 0.25) + (i / count) * Math.PI * 2;
    const x = cx + Math.cos(angle) * orbit;
    const y = cy + Math.sin(angle) * orbit * 0.38;
    drawOrbitDot(ctx, x, y, 3 + (i % 3), Object.values(TYPE_COLORS)[i % Object.values(TYPE_COLORS).length]);
  }
}

function drawCosmos(canvas, now) {
  if (state.view !== "cosmos") return;
  sizeCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  if (width <= 2 || height <= 2) return;
  updateCamera();
  ctx.clearRect(0, 0, width, height);
  drawStarfield(ctx, createStableStars(), width, height, now, 0.82);

  const nodes = filteredNodes();
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = state.graph.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
  const metrics = cosmosMetrics();
  prepareLayout(nodes);
  if (!nodes.length && state.graph.nodes.length) {
    drawEmptyCosmosMessage(ctx, width, height, "当前筛选没有匹配节点");
  } else if (!state.graph.nodes.length) {
    drawEmptyCosmosMessage(ctx, width, height, "未连接到 knowledge/data/graph.json");
  }

  const selected = state.nodeMap.get(state.selectedId);
  const selectedRelated = selected
    ? state.pathMode
      ? collectPathNodeIds(selected.id, 2)
      : new Set(relationsFor(selected.id).map((item) => item.other.id))
    : new Set();
  if (selected) selectedRelated.add(selected.id);

  ctx.save();
  for (const r of orbitRings()) {
    const center = worldToScreen(0, 0, width, height);
    const rx = r * state.camera.scale;
    const ry = r * 0.42 * state.camera.scale;
    if (rx < 12 || rx > width * 2.8) continue;
    ctx.strokeStyle = "rgba(255,255,255,0.065)";
    ctx.lineWidth = Math.max(0.6, 1 / state.camera.scale);
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  for (const edge of edges) {
    const from = state.layout.get(edge.from);
    const to = state.layout.get(edge.to);
    if (!from || !to) continue;
    const fromWorld = currentNodeWorld(from, now);
    const toWorld = currentNodeWorld(to, now);
    const fromScreen = worldToScreen(fromWorld.x, fromWorld.y, width, height);
    const toScreen = worldToScreen(toWorld.x, toWorld.y, width, height);
    if (!isScreenSegmentVisible(fromScreen, toScreen, width, height, 120)) continue;
    const isHot = !selected || edge.from === selected.id || edge.to === selected.id || (state.pathMode && selectedRelated.has(edge.from) && selectedRelated.has(edge.to));
    const isSynthesisEdge = edge.type === "synthesizes";
    const color = isSynthesisEdge
      ? isHot ? "rgba(200, 188, 255, 0.28)" : "rgba(200, 188, 255, 0.05)"
      : isHot ? "rgba(245, 245, 247, 0.38)" : "rgba(255, 255, 255, 0.07)";
    ctx.save();
    ctx.globalAlpha = isSynthesisEdge ? (isHot ? 0.9 : 0.42) : (isHot ? 1 : 0.58);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.7, (isHot ? 1.5 : 1) / state.camera.scale);
    if (isSynthesisEdge) ctx.setLineDash([4, 10]);
    ctx.beginPath();
    const mx = (fromScreen.x + toScreen.x) / 2;
    const my = (fromScreen.y + toScreen.y) / 2 - 34 * state.camera.scale;
    ctx.moveTo(fromScreen.x, fromScreen.y);
    ctx.quadraticCurveTo(mx, my, toScreen.x, toScreen.y);
    ctx.stroke();
    if (isSynthesisEdge) ctx.setLineDash([]);
    ctx.restore();
  }

  drawSynthesisNebula2D(ctx, nodes, selectedRelated, selected, now, width, height);

  state.hitboxes = [];
  const sorted = [...nodes].sort((a, b) => (state.layout.get(a.id)?.z || 0) - (state.layout.get(b.id)?.z || 0));
  for (const node of sorted) {
    const point = state.layout.get(node.id);
    if (!point) continue;
    const world = currentNodeWorld(point, now);
    const screen = worldToScreen(world.x, world.y, width, height);
    const hot = selectedRelated.has(node.id);
    const dim = selected && !hot;
    const metric = metrics.get(node.id) || fallbackMetric(node);
    const radius = nodeRadiusForMetric(metric) * world.scale * state.camera.scale;
    if (!isScreenCircleVisible(screen.x, screen.y, radius, width, height, 120)) continue;
    if (metric.role === "comet") drawCometTail(ctx, node, screen.x, screen.y, radius, point, now, state.camera.scale, dim);
    drawNode(ctx, node, screen.x, screen.y, radius, hot, dim, now);
    state.hitboxes.push({ id: node.id, x: screen.x, y: screen.y, r: radius + 10 });
  }

  drawGesturePointer(ctx, width, height);

  const cometCount = nodes.filter((node) => (metrics.get(node.id) || fallbackMetric(node)).role === "comet").length;
  els.cosmosHint.textContent = nodes.length
    ? `${COSMOS_VIEW_LABELS[state.cosmosView]} · ${nodes.length} 颗星体 · ${edges.length} 条轨道 · ${cometCount} 条彗星轨迹`
    : "没有匹配的星体";
}

async function ensureThreeScene() {
  if (state.three.ready) return true;
  if (state.three.error) return false;
  if (!state.three.loading) {
    state.three.loading = import(THREE_URL)
      .then((module) => {
        state.three.module = module;
        initThreeScene(module);
        return true;
      })
      .catch((error) => {
        console.warn(error);
        state.three.error = "3D 引擎加载失败，已回退到 2.5D Canvas。";
        return false;
      });
  }
  return state.three.loading;
}

function initThreeScene(THREE) {
  const canvas = els.cosmos3dCanvas;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !performanceProfile().lowPower,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(canvasPixelRatio(canvas));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020204, 0.00042);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 6000);
  const group = new THREE.Group();
  const stars = new THREE.Group();
  scene.add(stars);
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(420, 520, 680);
  scene.add(key);

  const fill = new THREE.PointLight(0x8ddcff, 2.2, 1600);
  fill.position.set(-420, -120, 280);
  scene.add(fill);

  state.three.scene = scene;
  state.three.camera = camera;
  state.three.renderer = renderer;
  state.three.textureLoader = new THREE.TextureLoader();
  state.three.raycaster = new THREE.Raycaster();
  state.three.pointer = new THREE.Vector2();
  state.three.frustum = new THREE.Frustum();
  state.three.projectionMatrix = new THREE.Matrix4();
  state.three.cullSphere = new THREE.Sphere();
  state.three.projectScratch = new THREE.Vector3();
  state.three.group = group;
  state.three.stars = stars;
  state.three.target = new THREE.Vector3(0, 0, 0);
  state.three.ready = true;
  buildThreeStars();
  rebuildThreeObjects();
}

function drawCosmos3D(now) {
  if (state.view !== "cosmos") return;
  ensureThreeScene();
  if (!state.three.ready) {
    drawCosmos(els.cosmosCanvas, now);
    return;
  }
  if (shouldSkipThreeFrame(now)) return;

  const frameStart = performance.now();
  syncThreeSize();
  updateThreeCamera();

  const nodes = filteredNodes();
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = state.graph.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
  prepareLayout(nodes);
  rebuildThreeObjectsIfNeeded(nodes, edges);
  animateThreeObjects(now, nodes, edges);
  if (state.three.stars) {
    state.three.stars.rotation.y = now * 0.000018;
    state.three.stars.rotation.x = Math.sin(now * 0.00004) * 0.035;
  }

  state.three.renderer.render(state.three.scene, state.three.camera);
  drawCosmosOverlay(now, nodes, edges);
  recordThreeFrameCost(performance.now() - frameStart);
}

function shouldSkipThreeFrame(now) {
  const profile = performanceProfile();
  const minInterval = 1000 / profile.maxFps;
  if (now - state.three.lastRenderAt < minInterval - 1) return true;
  state.three.lastRenderAt = now;
  return false;
}

function recordThreeFrameCost(costMs) {
  state.three.frameMs = state.three.frameMs * 0.92 + costMs * 0.08;
  if (els.cosmosCanvas) {
    els.cosmosCanvas.dataset.threeFrameMs = state.three.frameMs.toFixed(1);
    els.cosmosCanvas.dataset.lastThreeCostMs = costMs.toFixed(1);
    els.cosmosCanvas.dataset.assetBakeQueue = String(state.three.assetBakeQueue.length);
  }
  if (state.three.frameMs > 28) {
    state.three.slowFrameCount += 1;
    state.three.fastFrameCount = 0;
  } else if (state.three.frameMs < 18) {
    state.three.fastFrameCount += 1;
    state.three.slowFrameCount = 0;
  }

  if (!state.three.adaptiveLowPower && state.three.slowFrameCount > 90) {
    state.three.adaptiveLowPower = true;
    state.three.slowFrameCount = 0;
    buildThreeStars();
    state.three.lastKey = "";
  } else if (state.three.adaptiveLowPower && state.three.fastFrameCount > 240) {
    state.three.adaptiveLowPower = false;
    state.three.fastFrameCount = 0;
    buildThreeStars();
    state.three.lastKey = "";
  }
}

function syncThreeSize() {
  const renderer = state.three.renderer;
  const camera = state.three.camera;
  const canvas = renderer.domElement;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const dpr = canvasPixelRatio(canvas);
  renderer.setPixelRatio(dpr);
  const targetWidth = Math.floor(width * dpr);
  const targetHeight = Math.floor(height * dpr);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  sizeCanvas(els.cosmosCanvas);
}

function updateThreeCamera() {
  const THREE = state.three.module;
  const spherical = state.three.spherical;
  const target = state.three.targetSpherical;
  spherical.radius += (target.radius - spherical.radius) * 0.14;
  spherical.theta += (target.theta - spherical.theta) * 0.14;
  spherical.phi += (target.phi - spherical.phi) * 0.14;

  state.three.pan.x += (state.three.targetPan.x - state.three.pan.x) * 0.14;
  state.three.pan.y += (state.three.targetPan.y - state.three.pan.y) * 0.14;
  state.three.pan.z += (state.three.targetPan.z - state.three.pan.z) * 0.14;

  const sinPhi = Math.sin(spherical.phi);
  const position = new THREE.Vector3(
    spherical.radius * sinPhi * Math.sin(spherical.theta),
    spherical.radius * Math.cos(spherical.phi),
    spherical.radius * sinPhi * Math.cos(spherical.theta)
  );
  const lookAt = new THREE.Vector3(state.three.pan.x, state.three.pan.y, state.three.pan.z);
  state.three.target.copy(lookAt);
  state.three.camera.position.copy(position.add(lookAt));
  state.three.camera.lookAt(lookAt);
  syncCameraDebugAttributes();
}

function prepareThreeCulling() {
  const camera = state.three.camera;
  camera.updateMatrixWorld();
  state.three.projectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  state.three.frustum.setFromProjectionMatrix(state.three.projectionMatrix);
  state.three.visibleNodeIds.clear();
  state.three.projectedNodes.clear();
}

function isThreeSphereVisible(position, radius) {
  const sphere = state.three.cullSphere;
  sphere.center.copy(position);
  sphere.radius = radius;
  return state.three.frustum.intersectsSphere(sphere);
}

function syncCameraDebugAttributes() {
  if (!els.cosmosCanvas) return;
  els.cosmosCanvas.dataset.cameraTheta = state.three.targetSpherical.theta.toFixed(4);
  els.cosmosCanvas.dataset.cameraPhi = state.three.targetSpherical.phi.toFixed(4);
  els.cosmosCanvas.dataset.cameraRadius = state.three.targetSpherical.radius.toFixed(1);
  els.cosmosCanvas.dataset.cameraX = state.camera.targetX.toFixed(1);
  els.cosmosCanvas.dataset.cameraY = state.camera.targetY.toFixed(1);
  els.cosmosCanvas.dataset.cameraScale = state.camera.targetScale.toFixed(3);
}

function buildThreeStars() {
  const THREE = state.three.module;
  const stars = state.three.stars;
  stars.clear();
  const farPositions = [];
  const farColors = [];
  const nearPositions = [];
  const nearColors = [];
  const nebulaPositions = [];
  const nebulaColors = [];
  const palette = [0xffffff, 0x8ddcff, 0xb9f6d1, 0xffd981, 0xc8bcff, 0x8aa0b8];
  const nebulaPalette = [0x30415f, 0x47345f, 0x5a4a2d, 0x1d4b58];
  const starCount = performanceProfile().threeStars;
  for (let i = 0; i < starCount; i += 1) {
    const seed = hashNumber(`three-star-${i}`);
    const radius = 800 + (seed % 1700);
    const theta = ((seed * 9301) % 6283) / 1000;
    const phi = 0.2 + (((seed * 49297) % 2600) / 2600) * Math.PI * 0.86;
    const targetPositions = seed % 7 === 0 ? nearPositions : farPositions;
    const targetColors = seed % 7 === 0 ? nearColors : farColors;
    targetPositions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    const color = new THREE.Color(palette[seed % palette.length]);
    targetColors.push(color.r, color.g, color.b);
  }

  const nebulaCount = performanceProfile().nebulaClouds;
  for (let i = 0; i < nebulaCount; i += 1) {
    const seed = hashNumber(`three-nebula-${i}`);
    const centerTheta = ((seed * 48271) % 6283) / 1000;
    const centerPhi = 0.5 + (((seed * 69621) % 1700) / 1700) * Math.PI * 0.58;
    const radius = 1200 + (seed % 1100);
    const smear = 0.12 + ((seed % 37) / 37) * 0.18;
    for (let p = 0; p < 20; p += 1) {
      const particleSeed = hashNumber(`three-nebula-${i}-${p}`);
      const theta = centerTheta + (((particleSeed % 200) - 100) / 100) * smear;
      const phi = centerPhi + ((((particleSeed * 37) % 200) - 100) / 100) * smear * 0.62;
      nebulaPositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
      const color = new THREE.Color(nebulaPalette[seed % nebulaPalette.length]);
      nebulaColors.push(color.r, color.g, color.b);
    }
  }

  addStarPoints(THREE, stars, farPositions, farColors, 2.4, 0.64);
  addStarPoints(THREE, stars, nearPositions, nearColors, 4.8, 0.9);
  addStarPoints(THREE, stars, nebulaPositions, nebulaColors, 24, 0.11, true);
}

function addStarPoints(THREE, group, positions, colors, size, opacity, soft = false) {
  if (!positions.length) return;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: soft ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  group.add(new THREE.Points(geometry, material));
}

function materialProfileForNode(node, metric) {
  if (metric.stage === "theory_star" || metric.role === "star") return MATERIAL_PROFILES.star;
  if (metric.role === "comet") return MATERIAL_PROFILES.comet;
  if (metric.role === "galaxy" && node.type === "theme") return MATERIAL_PROFILES.gas;
  const candidates = MATERIAL_PROFILE_BY_TYPE[node.type] || ["ocean", "forest", "desert"];
  return MATERIAL_PROFILES[candidates[hashNumber(`material:${node.id}`) % candidates.length]] || MATERIAL_PROFILES.ocean;
}

function textureSeed(node) {
  return hashNumber(`texture:${node.id}`);
}

function lifecycleStageBucket(metric) {
  if (metric.stage === "dormant" || metric.stage === "remnant" || metric.luminosity < 0.38) return "dormant";
  if (metric.stage === "fading" || metric.lifecycle?.reviewDue || metric.luminosity < 0.62) return "fading";
  if (metric.stage === "synthesizing") return "synthesizing";
  if (metric.stage === "theory_star") return "theory";
  return "active";
}

function celestialAssetPath(profileId, kind) {
  const profile = state.celestialAssets?.profiles?.[profileId];
  const path = profile?.assets?.[kind];
  return nonEmptyString(path) ? path : "";
}

function projectAssetUrl(path) {
  const clean = path.replace(/^\/+/, "");
  if (location.protocol === "file:") return localSiteUrl(clean);
  return `/${clean}`;
}

function configureCelestialTexture(THREE, texture, colorManaged = true) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = performanceProfile().lowPower ? 1 : 4;
  if (colorManaged && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function loadCelestialAssetTexture(THREE, path, onLoad) {
  if (!nonEmptyString(path) || !state.three.textureLoader) return;
  const key = `asset:${path}`;
  const existing = state.three.assetTextureCache.get(key);
  if (existing?.loaded && existing.texture?.image) {
    onLoad(existing.texture);
    return;
  }
  if (existing) {
    if (!existing.failed) existing.callbacks.push(onLoad);
    return;
  }

  const entry = { texture: null, loaded: false, failed: false, callbacks: [onLoad] };
  state.three.assetTextureCache.set(key, entry);
  entry.texture = state.three.textureLoader.load(
    projectAssetUrl(path),
    (texture) => {
      configureCelestialTexture(THREE, texture);
      entry.loaded = true;
      const callbacks = entry.callbacks.splice(0);
      callbacks.forEach((callback) => callback(texture));
    },
    undefined,
    (error) => {
      entry.failed = true;
      entry.callbacks = [];
      console.warn(`Celestial texture failed: ${path}`, error);
    }
  );
}

function scheduleCelestialAssetBake(THREE, job) {
  const key = `${job.nodeId}:${job.variant}:${job.path}:${job.profile.id}:${job.material?.uuid || ""}:${job.seed % performanceProfile().assetSeedBuckets}`;
  if (state.three.assetBakeQueued.has(key)) return;
  state.three.assetBakeQueued.add(key);
  state.three.assetBakeQueue.push({ ...job, key, THREE });
  state.three.assetBakeQueue.sort((a, b) => assetBakePriority(a.variant) - assetBakePriority(b.variant));
  requestCelestialAssetBakeFrame();
}

function assetBakePriority(variant) {
  return { surface: 0, emissive: 1, cloud: 2, detail: 3 }[variant] ?? 4;
}

function requestCelestialAssetBakeFrame() {
  if (state.three.assetBakeScheduled) return;
  state.three.assetBakeScheduled = true;
  const callback = (deadline) => processCelestialAssetBakeQueue(deadline);
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 160 });
  } else {
    window.setTimeout(() => callback(null), 16);
  }
}

function processCelestialAssetBakeQueue(deadline = null) {
  state.three.assetBakeScheduled = false;
  const started = performance.now();
  const budget = performanceProfile().lowPower ? 5 : 8;
  while (state.three.assetBakeQueue.length) {
    if (performance.now() - started > budget && deadline?.timeRemaining?.() <= 1) break;
    const job = state.three.assetBakeQueue.shift();
    state.three.assetBakeQueued.delete(job.key);
    applyBakedCelestialAsset(job);
    if (performance.now() - started > budget) break;
  }
  if (els.cosmosCanvas) {
    els.cosmosCanvas.dataset.assetBakeQueue = String(state.three.assetBakeQueue.length);
  }
  if (state.three.assetBakeQueue.length) requestCelestialAssetBakeFrame();
}

function applyBakedCelestialAsset(job) {
  const live = state.three.nodeObjects.get(job.nodeId);
  if (!live || live.material !== job.material) return;
  if (job.cloudMaterial && live.cloudMaterial !== job.cloudMaterial) return;
  const texture = createAssetBackedTexture(job.THREE, job.image, job.profile, job.seed, job.metric, job.variant);
  if (job.variant === "surface") {
    live.material.map = texture;
    if (job.profile.id === "star" && !celestialAssetPath(job.profile.id, "emissive")) {
      live.material.emissiveMap = texture;
    }
    live.material.needsUpdate = true;
  } else if (job.variant === "detail") {
    live.material.bumpMap = texture;
    live.material.bumpScale = bumpScaleForProfile(job.profile, job.metric);
    live.material.needsUpdate = true;
  } else if (job.variant === "emissive") {
    live.material.emissiveMap = texture;
    live.material.needsUpdate = true;
  } else if (job.variant === "cloud" && live.cloudMaterial) {
    live.cloudMaterial.map = texture;
    live.cloudMaterial.needsUpdate = true;
  }
  pruneTextureCache();
}

function createAssetBackedTexture(THREE, image, profile, seed, metric, variant = "surface") {
  const profileData = performanceProfile();
  const width = variant === "surface"
    ? profileData.assetSurfaceTextureWidth
    : profileData.assetDetailTextureWidth;
  const height = width / 2;
  const imageId = image?.currentSrc || image?.src || profile.id;
  const seedBucket = seed % profileData.assetSeedBuckets;
  const stage = lifecycleStageBucket(metric);
  const key = `asset-baked:${variant}:${profile.id}:${seedBucket}:${stage}:${width}:${imageId}`;
  if (state.three.textureCache.has(key)) {
    const texture = state.three.textureCache.get(key);
    state.three.textureCache.delete(key);
    state.three.textureCache.set(key, texture);
    return texture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const bakedSeed = hashNumber(`asset-bucket:${profile.id}:${variant}:${seedBucket}:${stage}`);
  const shift = variant === "surface" ? (bakedSeed % width) : (bakedSeed % Math.max(1, Math.floor(width * 0.34)));
  ctx.drawImage(image, -shift, 0, width, height);
  ctx.drawImage(image, width - shift, 0, width, height);
  if (shift > 0) ctx.drawImage(image, -shift - width, 0, width, height);

  if (variant === "surface") {
    tintAssetSurface(ctx, width, height, profile, bakedSeed, metric);
    drawAssetSurfaceMarks(ctx, width, height, profile, bakedSeed, metric);
  } else if (variant === "detail") {
    normalizeDetailTexture(ctx, width, height, bakedSeed);
  } else if (variant === "cloud") {
    shapeCloudAlpha(ctx, width, height, profile, bakedSeed, metric);
  } else if (variant === "emissive") {
    shapeEmissiveTexture(ctx, width, height, profile);
  }

  const texture = new THREE.CanvasTexture(canvas);
  configureCelestialTexture(THREE, texture, variant !== "detail");
  state.three.textureCache.set(key, texture);
  return texture;
}

function tintAssetSurface(ctx, width, height, profile, seed, metric) {
  const image = ctx.getImageData(0, 0, width, height);
  const dim = lifecycleDimFactor(metric);
  const accent = parseHexColor(profile.accent);
  for (let y = 0; y < height; y += 1) {
    const v = y / height;
    const lat = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const u = x / width;
      const n = proceduralNoise(seed + 313, u * 18.5, v * 9.2);
      let color = {
        r: image.data[index],
        g: image.data[index + 1],
        b: image.data[index + 2],
      };
      const detailTint = profile.id === "star"
        ? n * 0.18
        : profile.id === "gas"
          ? Math.sin((v * 22 + n * 1.5) * Math.PI) * 0.05
          : (n - 0.5) * 0.11;
      color = mixRgb(color, accent, Math.max(0, detailTint));
      if (profile.id === "ice" && lat > 0.72) color = mixRgb(color, { r: 255, g: 255, b: 255 }, (lat - 0.72) * 1.6);
      color = burnRgb(desaturateRgb(color, dim.desaturate), dim.brightness * (0.92 + n * 0.12));
      image.data[index] = color.r;
      image.data[index + 1] = color.g;
      image.data[index + 2] = color.b;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function normalizeDetailTexture(ctx, width, height, seed) {
  const image = ctx.getImageData(0, 0, width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const gray = image.data[index] * 0.299 + image.data[index + 1] * 0.587 + image.data[index + 2] * 0.114;
      const n = proceduralNoise(seed + 919, x * 0.04, y * 0.04);
      const value = clamp((gray - 92) * 1.52 + 92 + (n - 0.5) * 42, 0, 255);
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function shapeCloudAlpha(ctx, width, height, profile, seed, metric) {
  const image = ctx.getImageData(0, 0, width, height);
  const luminosity = clamp(metric.luminosity + 0.12, 0.18, 1);
  for (let y = 0; y < height; y += 1) {
    const v = y / height;
    const lat = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const n = proceduralNoise(seed + 1223, x * 0.018, y * 0.035);
      const band = profile.id === "gas" ? 0.42 + Math.abs(Math.sin((v * 18 + n * 1.7) * Math.PI)) * 0.58 : 1 - lat * 0.28;
      image.data[index + 3] = Math.round(clamp(image.data[index + 3] * luminosity * band, 0, 165));
    }
  }
  ctx.putImageData(image, 0, 0);
}

function shapeEmissiveTexture(ctx, width, height, profile) {
  const image = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];
    const hot = profile.id === "star" ? Math.max(r, g, b) : Math.max(0, r * 1.25 + g * 0.35 - b - 95);
    const amount = clamp((hot - 72) / 168, 0, 1);
    image.data[i] = Math.round(r * amount);
    image.data[i + 1] = Math.round(g * amount);
    image.data[i + 2] = Math.round(b * amount);
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

function drawAssetSurfaceMarks(ctx, width, height, profile, seed, metric) {
  const draw = (callback) => {
    ctx.save();
    callback();
    ctx.restore();
  };
  if (["ice", "desert", "metallic", "comet", "volcanic"].includes(profile.id)) {
    const count = profile.id === "comet" ? 28 : profile.id === "desert" ? 18 : 12;
    draw(() => {
      ctx.globalCompositeOperation = "multiply";
      for (let i = 0; i < count; i += 1) {
        const local = hashNumber(`asset-crater:${seed}:${i}`);
        const x = (local % 1000) / 1000 * width;
        const y = ((local / 1000) % 1000) / 1000 * height;
        const r = (profile.id === "comet" ? 10 : 7) + (local % 31);
        ctx.globalAlpha = clamp(0.05 + metric.luminosity * 0.08, 0.04, 0.14);
        ctx.fillStyle = "#0a0a0d";
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.55, (local % 628) / 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.07;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1, r * 0.08);
        ctx.stroke();
        ctx.globalCompositeOperation = "multiply";
      }
    });
  }
  if (profile.id === "gas") {
    draw(() => {
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = profile.peak;
      ctx.lineWidth = Math.max(2, height * 0.018);
      for (let i = 0; i < 4; i += 1) {
        const y = height * (0.24 + i * 0.14) + Math.sin(seed + i) * height * 0.035;
        ctx.beginPath();
        ctx.ellipse(width * (0.28 + i * 0.13), y, width * 0.18, height * 0.035, -0.08, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }
  if (profile.id === "star") {
    draw(() => {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = profile.peak;
      ctx.lineWidth = Math.max(2, height * 0.01);
      for (let i = 0; i < 10; i += 1) {
        const y = ((hashNumber(`flare:${seed}:${i}`) % 1000) / 1000) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width; x += 80) {
          ctx.lineTo(x, y + Math.sin(x * 0.018 + seed + i) * height * 0.035);
        }
        ctx.stroke();
      }
    });
  }
}

function createPlanetTexture(THREE, profile, seed, metric, variant = "surface") {
  const profileData = performanceProfile();
  const size = variant === "cloud"
    ? profileData.cloudTextureSize
    : profile.id === "star" ? profileData.starTextureSize : profileData.planetTextureSize;
  const seedBucket = seed % profileData.proceduralSeedBuckets;
  const stage = lifecycleStageBucket(metric);
  const key = `${variant}:${profile.id}:${seedBucket}:${stage}:${size}`;
  if (state.three.textureCache.has(key)) {
    const texture = state.three.textureCache.get(key);
    state.three.textureCache.delete(key);
    state.three.textureCache.set(key, texture);
    return texture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const image = ctx.createImageData(size, size);
  const base = parseHexColor(profile.base);
  const land = parseHexColor(profile.land);
  const peak = parseHexColor(profile.peak);
  const cloud = parseHexColor(profile.cloud);
  const accent = parseHexColor(profile.accent);
  const dim = lifecycleDimFactor(metric);
  const textureSeed = hashNumber(`procedural:${profile.id}:${variant}:${seedBucket}:${stage}`);

  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const i = (y * size + x) * 4;
      const n1 = proceduralNoise(textureSeed, u * 5.3, v * 3.7);
      const n2 = proceduralNoise(textureSeed + 71, u * 12.1, v * 8.8);
      const n3 = proceduralNoise(textureSeed + 191, u * 31.0, v * 19.0);
      const wave = Math.sin((u * 8 + n1 * 2.4 + v * 1.5) * Math.PI);
      const lat = Math.abs(v - 0.5) * 2;
      let color;
      let alpha = 255;

      if (variant === "cloud") {
        const cloudBand = n1 * 0.58 + n2 * 0.3 + (1 - lat) * 0.12;
        const streak = Math.abs(Math.sin((u * 12 + n2 * 3 + v * 1.5) * Math.PI));
        const opacity = clamp((cloudBand + streak * 0.18 - 0.48) * 2.6, 0, 1) * clamp(metric.luminosity + 0.12, 0.16, 1);
        color = mixRgb(cloud, accent, n2 * 0.22);
        alpha = Math.round(opacity * 138);
      } else if (profile.id === "star") {
        const plasma = clamp(0.52 + n1 * 0.42 + Math.abs(wave) * 0.26 + n3 * 0.12, 0, 1);
        color = mixRgb(mixRgb(profile.id === "star" ? land : base, peak, plasma), accent, n2 * 0.35);
        color = burnRgb(color, 1.18 + plasma * 0.72);
      } else if (profile.id === "gas") {
        const band = 0.5 + Math.sin((v * 15 + n1 * 1.9 + u * 0.5) * Math.PI) * 0.5;
        color = mixRgb(base, land, band * 0.78);
        color = mixRgb(color, peak, n2 * 0.28 + (1 - lat) * 0.08);
      } else if (profile.id === "ice") {
        const cap = lat > 0.7 ? 0.5 : 0;
        color = mixRgb(base, land, clamp(n1 * 0.55 + cap + n2 * 0.18, 0, 1));
        color = mixRgb(color, peak, n3 * 0.22);
      } else if (profile.id === "volcanic") {
        const lava = n1 * 0.45 + n2 * 0.32 + Math.abs(wave) * 0.28;
        color = lava > 0.76 ? mixRgb(land, peak, n3) : mixRgb(base, land, n1 * 0.5);
      } else if (profile.id === "metallic") {
        color = mixRgb(base, land, n1 * 0.74);
        color = mixRgb(color, peak, Math.max(0, n3 - 0.62) * 1.8);
      } else {
        const continent = n1 * 0.62 + n2 * 0.28 + Math.sin((u * 2.1 + v * 1.7 + n2) * Math.PI) * 0.1;
        color = continent > 0.56 ? mixRgb(land, peak, Math.max(0, continent - 0.62) * 1.5) : mixRgb(base, accent, n2 * 0.16);
        if (lat > 0.82) color = mixRgb(color, peak, (lat - 0.82) * 3.6);
      }

      const shade = 0.76 + n3 * 0.2 + Math.cos((u - 0.18) * Math.PI * 2) * 0.04;
      color = burnRgb(desaturateRgb(color, dim.desaturate), shade * dim.brightness);
      image.data[i] = color.r;
      image.data[i + 1] = color.g;
      image.data[i + 2] = color.b;
      image.data[i + 3] = alpha;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = performanceProfile().lowPower ? 1 : 4;
  texture.needsUpdate = true;
  state.three.textureCache.set(key, texture);
  return texture;
}

function createAtmosphere(THREE, radius, color, profile, metric, segments) {
  const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.08, segments, 18);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: atmosphereOpacity(metric, profile),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  return new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
}

function createCloudShell(THREE, radius, profile, seed, metric, segments) {
  if (performanceProfile().lowPower || ["star", "volcanic", "metallic", "comet"].includes(profile.id)) return null;
  const texture = createPlanetTexture(THREE, profile, seed + 991, metric, "cloud");
  const geometry = new THREE.SphereGeometry(radius * 1.025, segments, 18);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: clamp(metric.luminosity * 0.34, 0.04, 0.34),
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

function applyCelestialTextureAssets(THREE, node, metric, object) {
  const { profile, seed, material } = object;
  const surfacePath = celestialAssetPath(profile.id, "surface");
  loadCelestialAssetTexture(THREE, surfacePath, (texture) => {
    scheduleCelestialAssetBake(THREE, {
      nodeId: node.id,
      path: surfacePath,
      variant: "surface",
      image: texture.image,
      profile,
      seed,
      metric,
      material,
    });
  });

  if (!performanceProfile().lowPower) {
    const detailPath = celestialAssetPath(profile.id, "detail");
    loadCelestialAssetTexture(THREE, detailPath, (texture) => {
      scheduleCelestialAssetBake(THREE, {
        nodeId: node.id,
        path: detailPath,
        variant: "detail",
        image: texture.image,
        profile,
        seed: seed + 404,
        metric,
        material,
      });
    });
  }

  const emissivePath = celestialAssetPath(profile.id, "emissive");
  loadCelestialAssetTexture(THREE, emissivePath, (texture) => {
    scheduleCelestialAssetBake(THREE, {
      nodeId: node.id,
      path: emissivePath,
      variant: "emissive",
      image: texture.image,
      profile,
      seed: seed + 808,
      metric,
      material,
    });
  });

  const cloudPath = celestialAssetPath(profile.id, "cloud");
  if (object.cloudMaterial) {
    loadCelestialAssetTexture(THREE, cloudPath, (texture) => {
      scheduleCelestialAssetBake(THREE, {
        nodeId: node.id,
        path: cloudPath,
        variant: "cloud",
        image: texture.image,
        profile,
        seed: seed + 991,
        metric,
        material,
        cloudMaterial: object.cloudMaterial,
      });
    });
  }
}

function bumpScaleForProfile(profile, metric) {
  if (profile.id === "star" || profile.id === "gas") return 0.015;
  if (profile.id === "comet") return 0.34;
  if (profile.id === "desert" || profile.id === "ice") return 0.22;
  if (profile.id === "metallic" || profile.id === "volcanic") return 0.16;
  return clamp(0.07 + metric.mass * 0.006, 0.08, 0.18);
}

function updatePlanetMaterial(object, metric, hot, dim, now) {
  const profile = object.profile;
  const color = object.color;
  const dimming = lifecycleDimFactor(metric);
  const visibleLuminosity = dim ? metric.luminosity * 0.34 : metric.luminosity;
  const duePulse = metric.lifecycle?.reviewDue ? 0.84 + Math.sin(now * 0.006) * 0.16 : 1;
  const fusionPulse = profile.id === "star" ? 1.05 + Math.sin(now * 0.004 + object.seed * 0.001) * 0.18 : 1;
  object.mesh.scale.setScalar(profile.id === "star" ? 1 + (fusionPulse - 1) * 0.035 : 1);
  object.material.color.copy(color).multiplyScalar(dimming.brightness * (hot ? 1.18 : 0.86));
  object.material.emissive.copy(color);
  object.material.opacity = dim
    ? clamp(0.08 + metric.luminosity * 0.18, 0.08, 0.28)
    : clamp(0.16 + metric.luminosity * 0.84, 0.16, 1);
  object.material.transparent = true;
  object.material.emissiveIntensity = (hot ? 1.18 : profile.id === "star" ? 1.72 : profile.id === "volcanic" ? 0.72 : 0.22)
    * visibleLuminosity
    * duePulse
    * fusionPulse;
  object.material.roughness = clamp(profile.roughness + dimming.desaturate * 0.18, 0.24, 0.95);
  object.material.metalness = profile.metalness;

  object.glowMaterial.color.copy(color);
  object.glowMaterial.opacity = hot
    ? 0.18 + metric.luminosity * 0.34
    : dim
      ? 0.01 + metric.luminosity * 0.035
      : (profile.id === "star" ? 0.36 * fusionPulse : profile.id === "comet" ? 0.14 : 0.06) * metric.luminosity * duePulse;

  object.atmosphereMaterial.color.copy(color);
  object.atmosphereMaterial.opacity = dim ? 0.012 : atmosphereOpacity(metric, profile) * (hot ? 1.28 : 1);

  if (object.cloudMaterial) {
    object.cloudMaterial.opacity = dim
      ? 0.018
      : clamp(metric.luminosity * (metric.stage === "fading" ? 0.16 : 0.3), 0.035, 0.34);
  }
}

function atmosphereOpacity(metric, profile) {
  if (profile.id === "star") return clamp(0.18 + metric.luminosity * 0.24, 0.12, 0.44);
  if (profile.id === "comet") return clamp(metric.luminosity * 0.12, 0.025, 0.14);
  if (metric.stage === "dormant" || metric.stage === "remnant") return 0.025;
  return clamp(0.045 + metric.luminosity * 0.11, 0.04, 0.18);
}

function lifecycleDimFactor(metric) {
  const freshness = metric.freshness ?? 0.72;
  const luminosity = metric.luminosity ?? 0.74;
  const stagePenalty = {
    active: 0,
    fading: 0.34,
    dormant: 0.68,
    synthesizing: 0.2,
    remnant: 0.58,
    theory_star: -0.08,
  }[metric.stage] || 0.08;
  return {
    brightness: clamp(0.28 + luminosity * 0.86 - stagePenalty * 0.32, 0.18, 1.22),
    desaturate: clamp((1 - freshness) * 0.62 + stagePenalty, 0, 0.82),
  };
}

function proceduralNoise(seed, x, y) {
  const a = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.00017) * 43758.5453;
  const b = Math.sin((x + seed * 0.00001) * 41.17 + y * 17.31) * 24634.6345;
  return ((a + b) - Math.floor(a + b));
}

function parseHexColor(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mixRgb(a, b, amount) {
  const t = clamp(amount, 0, 1);
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function burnRgb(color, amount) {
  return {
    r: Math.round(clamp(color.r * amount, 0, 255)),
    g: Math.round(clamp(color.g * amount, 0, 255)),
    b: Math.round(clamp(color.b * amount, 0, 255)),
  };
}

function desaturateRgb(color, amount) {
  const gray = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
  return mixRgb(color, { r: gray, g: gray, b: gray }, amount);
}

function disposeThreeObjectTree(root) {
  root.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
    for (const material of materials) material.dispose();
  });
}

function pruneTextureCache() {
  const limit = performanceProfile().maxTextureCache;
  if (state.three.textureCache.size <= limit) return;

  const liveTextures = new Set();
  for (const object of state.three.nodeObjects.values()) {
    if (object.material?.map) liveTextures.add(object.material.map);
    if (object.material?.emissiveMap) liveTextures.add(object.material.emissiveMap);
    if (object.material?.bumpMap) liveTextures.add(object.material.bumpMap);
    if (object.cloudMaterial?.map) liveTextures.add(object.cloudMaterial.map);
  }

  for (const [key, texture] of state.three.textureCache) {
    if (state.three.textureCache.size <= limit) break;
    if (liveTextures.has(texture)) continue;
    state.three.textureCache.delete(key);
    texture.dispose?.();
  }
}

function createCelestialSphereGeometry(THREE, radius, segments, metric, profile, seed) {
  const geometry = new THREE.SphereGeometry(radius, segments, 18);
  if (profile.id !== "comet") return geometry;

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const length = Math.hypot(x, y, z) || 1;
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    const n1 = proceduralNoise(seed + 1709, nx * 2.7 + nz, ny * 2.2);
    const n2 = proceduralNoise(seed + 1877, nx * 7.1, nz * 6.4 + ny);
    const rough = 0.82 + n1 * 0.26 + n2 * 0.12;
    positions.setXYZ(i, x * rough, y * rough, z * rough);
  }
  geometry.scale(1.34, 0.82, 0.96);
  geometry.computeVertexNormals();
  return geometry;
}

function rebuildThreeObjectsIfNeeded(nodes, edges) {
  const metrics = cosmosMetrics();
  const key = [
    state.cosmosView,
    nodes.map((node) => {
      const metric = metrics.get(node.id) || fallbackMetric(node);
      return `${node.id}:${metric.role}:${metric.mass.toFixed(2)}`;
    }).join("|"),
    edges.map((edge) => edge.id).join("|"),
  ].join("::");
  if (state.three.lastKey === key) return;
  state.three.lastKey = key;
  rebuildThreeObjects();
}

function rebuildThreeObjects() {
  if (!state.three.ready) return;
  const THREE = state.three.module;
  const group = state.three.group;
  group.children.forEach(disposeThreeObjectTree);
  group.clear();
  state.three.assetBakeQueue = [];
  state.three.assetBakeQueued.clear();
  state.three.nodeObjects = new Map();
  state.three.edgeObjects = [];
  state.three.orbitObjects = [];
  state.three.visibleNodeIds = new Set();
  state.three.projectedNodes = new Map();
  const nodes = filteredNodes();
  const nodeIds = new Set(nodes.map((node) => node.id));
  const metrics = cosmosMetrics();
  const visibleEdges = state.graph.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));

  for (const r of orbitRings()) {
    const curve = new THREE.EllipseCurve(0, 0, r, r * 0.42, 0, Math.PI * 2);
    const points = curve.getPoints(160).map((point) => new THREE.Vector3(point.x, 0, point.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
    const line = new THREE.LineLoop(geometry, material);
    group.add(line);
    state.three.orbitObjects.push(line);
  }

  for (const node of nodes) {
    const metric = metrics.get(node.id) || fallbackMetric(node);
    const profile = materialProfileForNode(node, metric);
    const seed = textureSeed(node);
    const color = new THREE.Color(profile.accent || nodeVisualColor(node, metric));
    const radius = nodeRadiusForMetric(metric) * (metric.role === "comet" ? 1.25 : metric.stage === "theory_star" ? 1.68 : 1.48);
    const segments = performanceProfile().sphereSegments(metric.role);
    const geometry = createCelestialSphereGeometry(THREE, radius, segments, metric, profile, seed);
    const surfaceTexture = createPlanetTexture(THREE, profile, seed, metric, "surface");
    const material = new THREE.MeshStandardMaterial({
      color,
      map: surfaceTexture,
      emissiveMap: profile.id === "star" ? surfaceTexture : null,
      emissive: color,
      emissiveIntensity: (0.18 + Math.min(metric.mass, 14) * 0.045) * metric.luminosity,
      roughness: profile.roughness,
      metalness: profile.metalness,
      bumpScale: bumpScaleForProfile(profile, metric),
      transparent: true,
      opacity: clamp(0.32 + metric.luminosity * 0.68, 0.28, 1),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.nodeId = node.id;

    const glowGeometry = new THREE.SphereGeometry(radius * (profile.id === "star" ? 2.34 : metric.role === "comet" ? 1.9 : 1.42), segments, 18);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: (profile.id === "star" ? 0.38 : metric.role === "star" ? 0.28 : 0.12) * metric.luminosity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glow);
    const atmosphere = createAtmosphere(THREE, radius, color, profile, metric, segments);
    mesh.add(atmosphere);
    const cloud = createCloudShell(THREE, radius, profile, seed, metric, segments);
    if (cloud) mesh.add(cloud);

    group.add(mesh);
    const record = { mesh, glow, atmosphere, cloud, material, glowMaterial, atmosphereMaterial: atmosphere.material, cloudMaterial: cloud?.material || null, color, radius, profile, seed };
    state.three.nodeObjects.set(node.id, record);
    applyCelestialTextureAssets(THREE, node, metric, record);
  }

  for (const edge of visibleEdges) {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const material = new THREE.LineBasicMaterial({ color: edge.type === "synthesizes" ? 0xc8bcff : 0xffffff, transparent: true, opacity: edge.type === "synthesizes" ? 0.08 : 0.12 });
    const line = new THREE.Line(geometry, material);
    line.userData.edgeId = edge.id;
    group.add(line);
    state.three.edgeObjects.push({ edge, line, material });
  }
  pruneTextureCache();
}

function animateThreeObjects(now, nodes, edges) {
  const THREE = state.three.module;
  const metrics = cosmosMetrics();
  const profile = performanceProfile();
  const selected = state.nodeMap.get(state.selectedId);
  const selectedRelated = selected
    ? state.pathMode
      ? collectPathNodeIds(selected.id, 2)
      : new Set(relationsFor(selected.id).map((item) => item.other.id))
    : new Set();
  if (selected) selectedRelated.add(selected.id);
  prepareThreeCulling();

  for (const node of nodes) {
    const object = state.three.nodeObjects.get(node.id);
    const point = state.layout.get(node.id);
    if (!object || !point) continue;
    const metric = metrics.get(node.id) || fallbackMetric(node);
    const world = currentNodeWorld3D(point, now);
    object.mesh.position.set(world.x, world.y, world.z);
    const hot = selectedRelated.has(node.id);
    const visible = hot || isThreeSphereVisible(object.mesh.position, object.radius * profile.cullRadiusMultiplier);
    object.mesh.visible = visible;
    if (!visible) continue;
    state.three.visibleNodeIds.add(node.id);
    state.three.projectedNodes.set(node.id, projectThreePosition(object.mesh.position));
    object.mesh.rotation.y += object.profile.id === "gas" ? 0.0022 : object.profile.id === "star" ? 0.0044 : 0.003;
    if (object.cloud) object.cloud.rotation.y += 0.0016;
    const dim = selected && !hot;
    updatePlanetMaterial(object, metric, hot, dim, now);
  }

  const activeEdgeIds = new Set(edges.map((edge) => edge.id));
  for (const item of state.three.edgeObjects) {
    const edge = item.edge;
    const fromObject = state.three.nodeObjects.get(edge.from);
    const toObject = state.three.nodeObjects.get(edge.to);
    const from = fromObject?.mesh;
    const to = toObject?.mesh;
    const visible = activeEdgeIds.has(edge.id)
      && from
      && to
      && (state.three.visibleNodeIds.has(edge.from) || state.three.visibleNodeIds.has(edge.to));
    item.line.visible = Boolean(visible);
    if (!visible) continue;
    const positions = item.line.geometry.attributes.position;
    positions.setXYZ(0, from.position.x, from.position.y, from.position.z);
    positions.setXYZ(1, to.position.x, to.position.y, to.position.z);
    positions.needsUpdate = true;
    const hot = !selected || edge.from === selected.id || edge.to === selected.id || (state.pathMode && selectedRelated.has(edge.from) && selectedRelated.has(edge.to));
    const synth = edge.type === "synthesizes";
    item.material.opacity = synth ? (hot ? 0.26 : 0.045) : (hot ? 0.42 : 0.08);
    item.material.color.set(synth ? 0xc8bcff : hot ? 0xf5f5f7 : 0xffffff);
  }
}

function currentNodeWorld3D(point, now = performance.now()) {
  const angle = point.baseAngle + now * point.speed * point.direction;
  const orbitX = Math.cos(angle) * point.orbitA;
  const orbitZ = Math.sin(angle) * point.orbitB * 1.18;
  const depth = Math.sin(angle * 1.3 + point.eccentricity);
  return {
    x: point.x + orbitX,
    y: point.z + depth * (point.role === "comet" ? 82 : 34),
    z: point.y + orbitZ,
  };
}

function drawCosmosOverlay(now, nodes, edges) {
  const canvas = els.cosmosCanvas;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const metrics = cosmosMetrics();
  ctx.clearRect(0, 0, width, height);
  state.hitboxes = [];

  if (!nodes.length && state.graph.nodes.length) {
    drawEmptyCosmosMessage(ctx, width, height, "当前筛选没有匹配节点");
  } else if (!state.graph.nodes.length) {
    drawEmptyCosmosMessage(ctx, width, height, "未连接到 knowledge/data/graph.json");
  }

  const selected = state.nodeMap.get(state.selectedId);
  const selectedRelated = selected
    ? state.pathMode
      ? collectPathNodeIds(selected.id, 2)
      : new Set(relationsFor(selected.id).map((item) => item.other.id))
    : new Set();
  if (selected) selectedRelated.add(selected.id);

  drawSynthesisNebula3D(ctx, nodes, selectedRelated, selected, now);

  for (const node of nodes) {
    const object = state.three.nodeObjects.get(node.id);
    if (!object) continue;
    const screen = state.three.projectedNodes.get(node.id);
    if (!screen || !screen.visible) continue;
    const metric = metrics.get(node.id) || fallbackMetric(node);
    const radius = Math.max(12, nodeRadiusForMetric(metric) * screen.scale * 0.9);
    const hot = selectedRelated.has(node.id);
    const dim = selected && !hot;
    const point = state.layout.get(node.id);
    if (metric.role === "comet" && point) drawCometTail(ctx, node, screen.x, screen.y, radius, point, now, screen.scale, dim);
    if (shouldShowNodeLabel(node, screen.scale, hot, metric)) {
      drawNodeLabel(ctx, node, screen.x, screen.y, radius, hot, dim, metric);
    }
    state.hitboxes.push({ id: node.id, x: screen.x, y: screen.y, r: radius + 12 });
  }

  drawGesturePointer(ctx, width, height);
  const cometCount = nodes.filter((node) => (metrics.get(node.id) || fallbackMetric(node)).role === "comet").length;
  els.cosmosHint.textContent = nodes.length
    ? `${COSMOS_VIEW_LABELS[state.cosmosView]} · ${nodes.length} 颗星体 · ${edges.length} 条轨道 · ${cometCount} 条彗星轨迹`
    : "没有匹配的星体";
}

function drawSynthesisNebula2D(ctx, nodes, selectedRelated, selected, now, width, height) {
  const visible = new Set(nodes.map((node) => node.id));
  for (const synthesis of state.lifecycle.syntheses || []) {
    if (!isObject(synthesis) || !visible.has(synthesis.theory_node_id)) continue;
    const theoryPoint = state.layout.get(synthesis.theory_node_id);
    if (!theoryPoint) continue;
    const theoryWorld = currentNodeWorld(theoryPoint, now);
    const to = worldToScreen(theoryWorld.x, theoryWorld.y, width, height);
    for (const predecessorId of synthesis.predecessor_node_ids || []) {
      if (!visible.has(predecessorId)) continue;
      const predecessorPoint = state.layout.get(predecessorId);
      if (!predecessorPoint) continue;
      const predecessorWorld = currentNodeWorld(predecessorPoint, now);
      const from = worldToScreen(predecessorWorld.x, predecessorWorld.y, width, height);
      const hot = !selected || selectedRelated.has(predecessorId) || selectedRelated.has(synthesis.theory_node_id);
      drawNebulaLine(ctx, from, to, hot, `${synthesis.id}:${predecessorId}`, now, state.camera.scale);
    }
  }
}

function drawSynthesisNebula3D(ctx, nodes, selectedRelated, selected, now) {
  const visible = new Set(nodes.map((node) => node.id));
  for (const synthesis of state.lifecycle.syntheses || []) {
    if (!isObject(synthesis) || !visible.has(synthesis.theory_node_id)) continue;
    const to = state.three.projectedNodes.get(synthesis.theory_node_id);
    if (!to || !to.visible) continue;
    for (const predecessorId of synthesis.predecessor_node_ids || []) {
      if (!visible.has(predecessorId)) continue;
      const from = state.three.projectedNodes.get(predecessorId);
      if (!from || !from.visible) continue;
      const hot = !selected || selectedRelated.has(predecessorId) || selectedRelated.has(synthesis.theory_node_id);
      drawNebulaLine(ctx, from, to, hot, `${synthesis.id}:${predecessorId}`, now, Math.min(from.scale, to.scale));
    }
  }
}

function drawNebulaLine(ctx, from, to, hot, seedText, now, scale = 1) {
  const seed = hashNumber(seedText);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const bend = (((seed % 200) - 100) / 100) * Math.min(80, dist * 0.22);
  const mx = (from.x + to.x) / 2 - (dy / dist) * bend;
  const my = (from.y + to.y) / 2 + (dx / dist) * bend;
  const alpha = hot ? 0.32 : 0.11;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(200, 188, 255, ${alpha})`;
  ctx.lineWidth = Math.max(0.8, (hot ? 1.6 : 1) * scale);
  ctx.setLineDash([2 + (seed % 5), 9]);
  ctx.lineDashOffset = -now * 0.012;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(mx, my, to.x, to.y);
  ctx.stroke();
  ctx.setLineDash([]);

  const particle = (Math.sin(now * 0.0012 + seed) + 1) / 2;
  const px = (1 - particle) * (1 - particle) * from.x + 2 * (1 - particle) * particle * mx + particle * particle * to.x;
  const py = (1 - particle) * (1 - particle) * from.y + 2 * (1 - particle) * particle * my + particle * particle * to.y;
  ctx.fillStyle = `rgba(200, 188, 255, ${hot ? 0.46 : 0.2})`;
  ctx.beginPath();
  ctx.arc(px, py, hot ? 2.2 : 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function projectThreePosition(vector) {
  const projected = state.three.projectScratch.copy(vector).project(state.three.camera);
  const canvas = els.cosmosCanvas;
  const visible = projected.z > -1 && projected.z < 1;
  return {
    x: (projected.x * 0.5 + 0.5) * canvas.width,
    y: (-projected.y * 0.5 + 0.5) * canvas.height,
    scale: clamp(1.2 - projected.z * 0.5, 0.35, 1.6),
    visible,
  };
}

function drawNodeLabel(ctx, node, x, y, radius, hot, dim, metric = cosmosMetrics().get(node.id) || fallbackMetric(node)) {
  ctx.save();
  const importance = nodeImportance(node);
  const fontSize = Math.round(hot ? 17 : 12 + Math.min(metric.mass, 12) * 0.34);
  const title = trimText(node.label, hot ? 18 : metric.mass >= 10 ? 14 : 10);
  const meta = `${roleLabel(metric.role)} · M ${metric.mass.toFixed(1)} · ${metric.lifecycle.stageLabel || "明亮稳定"}`;
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  const titleWidth = ctx.measureText(title).width;
  ctx.font = `500 ${Math.max(10, fontSize - 5)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  const metaWidth = ctx.measureText(meta).width;
  const labelWidth = Math.ceil(Math.max(titleWidth, hot ? metaWidth : 0) + 22);
  const labelHeight = hot ? fontSize + 28 : fontSize + 12;
  const labelX = x - labelWidth / 2;
  const labelY = y + radius + 14;
  const alpha = dim ? 0.34 : hot ? 0.94 : 0.78;

  ctx.globalAlpha = alpha;
  roundRect(ctx, labelX, labelY, labelWidth, labelHeight, 8);
  ctx.fillStyle = hot ? "rgba(245, 245, 247, 0.94)" : "rgba(10, 10, 14, 0.68)";
  ctx.fill();
  ctx.strokeStyle = hot ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.globalAlpha = dim ? 0.52 : 1;
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  ctx.fillStyle = hot ? "#060608" : "rgba(245,247,251,0.94)";
  ctx.fillText(title, x, labelY + fontSize + 1);
  if (hot) {
    ctx.font = `500 ${Math.max(10, fontSize - 5)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    ctx.fillStyle = "rgba(6, 6, 8, 0.62)";
    ctx.fillText(meta, x, labelY + fontSize + 18);
  }
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function prepareLayout(nodes) {
  const metrics = cosmosMetrics();
  const currentKey = layoutStructureKey(nodes, metrics);
  if (state.layout.key === currentKey && state.layout.size === nodes.length) return;

  state.layout = new Map();
  state.layout.key = currentKey;

  if (!nodes.length) return;

  const nodeIds = new Set(nodes.map((node) => node.id));
  const anchors = nodes.filter((node) => ["galaxy", "star"].includes(metrics.get(node.id)?.role) && (node.type === "book" || node.type === "theme" || metrics.get(node.id)?.role === "star"));
  const anchorPositions = galaxyAnchorPositions(anchors.length ? anchors : nodes.slice(0, Math.min(nodes.length, 4)), metrics);
  const items = nodes.map((node, index) => {
    const metric = metrics.get(node.id) || fallbackMetric(node);
    const seed = hashNumber(`${state.cosmosView}:${node.id}`);
    const anchor = metric.anchor && anchorPositions.get(metric.anchor) ? anchorPositions.get(metric.anchor) : null;
    const roleRadius = roleTargetRadius(metric.role);
    const angle = (seed % 6283) / 1000 + index * 0.19;
    const spread = 0.68 + ((seed % 100) / 100) * 0.52;
    const initialRadius = anchor ? 88 + ((seed % 180) * spread) : roleRadius * (0.72 + ((seed % 71) / 100));
    const fixed = metric.role === "galaxy" && anchorPositions.has(node.id);
    const start = anchorPositions.get(node.id) || {
      x: (anchor?.x || 0) + Math.cos(angle) * initialRadius,
      y: (anchor?.y || 0) + Math.sin(angle) * initialRadius * 0.76,
    };
    if (state.cosmosView === "meta" && metric.role === "star") {
      start.x *= 0.34;
      start.y *= 0.34;
    }
    if (metric.stage === "theory_star") {
      start.x *= state.cosmosView === "meta" ? 0.12 : 0.42;
      start.y *= state.cosmosView === "meta" ? 0.12 : 0.42;
    }
    if (state.cosmosView === "comet" && metric.role === "comet") {
      start.x += Math.cos(angle) * 280;
      start.y += Math.sin(angle) * 220;
    }
    return {
      node,
      metric,
      fixed,
      x: start.x,
      y: start.y,
      vx: 0,
      vy: 0,
      radius: 18 + metric.mass * 2.8,
    };
  });

  const byId = new Map(items.map((item) => [item.node.id, item]));
  const visibleEdges = state.graph.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
  const iterations = state.cosmosView === "comet" ? 330 : 280;
  for (let step = 0; step < iterations; step += 1) {
    applyLayoutRepulsion(items);
    applyLayoutEdges(visibleEdges, byId);
    applyLayoutSyntheses(byId);
    applyLayoutAnchors(items, anchorPositions);
    applyLayoutLensGravity(items);
    integrateLayout(items, step, iterations);
  }

  for (const item of items) {
    const metric = item.metric;
    const seed = hashNumber(`orbit:${state.cosmosView}:${item.node.id}`);
    const baseAngle = (seed % 6283) / 1000;
    const eccentricity = metric.role === "comet" ? 0.82 : metric.role === "bridge" ? 0.42 : metric.role === "star" ? 0.16 : 0.26;
    const orbitBias = numberOrDefault(item.node.metadata?.cosmos?.orbit_bias, 1);
    const orbitA = orbitSizeFor(metric, seed) * orbitBias;
    const orbitB = orbitA * Math.max(0.16, 1 - eccentricity);
    state.layout.set(item.node.id, {
      x: item.x,
      y: item.y,
      z: Math.sin(baseAngle * 1.7) * (metric.role === "comet" ? 120 : 72),
      baseAngle,
      orbitA,
      orbitB,
      eccentricity,
      speed: orbitSpeedFor(metric, seed),
      direction: seed % 2 ? 1 : -1,
      scale: 0.88 + Math.min(metric.mass, 16) * 0.012,
      role: metric.role,
      mass: metric.mass,
      anchor: metric.anchor,
    });
  }
}

function layoutStructureKey(nodes, metrics) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const visibleEdges = state.graph.edges
    .filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to))
    .map((edge) => `${edge.id}:${edge.from}:${edge.to}:${edge.type}:${edge.confidence}:${edge.metadata?.cosmos?.strength || ""}:${edge.metadata?.cosmos?.distance || ""}`)
    .join("|");
  const roles = nodes
    .map((node) => {
      const metric = metrics.get(node.id) || fallbackMetric(node);
      return `${node.id}:${metric.role}:${metric.mass.toFixed(2)}:${metric.anchor || ""}`;
    })
    .join("|");
  const syntheses = (state.lifecycle.syntheses || [])
    .map((item) => `${item.id}:${item.theory_node_id}:${(item.predecessor_node_ids || []).join(",")}`)
    .join("|");
  return [state.cosmosView, state.graph.updated_at, state.lifecycle.updated_at, roles, visibleEdges, syntheses].join("::");
}

function orbitRings() {
  return state.cosmosView === "comet" ? [220, 440, 720, 1040] : [160, 320, 520, 760, 1020];
}

function resetLayout() {
  state.layout = new Map();
  state.layout.key = "";
}

function currentNodeWorld(point, now = performance.now()) {
  const angle = point.baseAngle + now * point.speed * point.direction;
  const orbitX = Math.cos(angle) * point.orbitA;
  const orbitY = Math.sin(angle) * point.orbitB;
  const depth = Math.sin(angle * 1.7 + point.eccentricity);
  return {
    x: point.x + orbitX,
    y: point.y + orbitY + depth * (point.role === "comet" ? 18 : 8),
    z: depth,
    scale: point.scale * (0.88 + (depth + 1) * 0.08),
  };
}

function cosmosMetrics() {
  const key = [
    todayIso(),
    Math.round(state.reviewTimeline.days || 0),
    state.graph.updated_at,
    state.graph.nodes.length,
    state.graph.edges.length,
    state.lifecycle.updated_at || "",
    Object.keys(state.lifecycle.records || {}).map((id) => {
      const record = state.lifecycle.records[id] || {};
      return [
        id,
        record.last_reviewed_at || "",
        record.last_practiced_at || "",
        record.review_count || 0,
        record.practice_count || 0,
        record.mastery ?? "",
        record.stage || "",
        record.synthesized_into || "",
      ].join(":");
    }).join("|"),
    (state.lifecycle.syntheses || []).map((item) => `${item.id}:${item.theory_node_id}:${(item.predecessor_node_ids || []).join(",")}`).join("|"),
    state.graph.nodes.map((node) => `${node.id}:${node.metadata?.cosmos?.mass || ""}:${node.metadata?.cosmos?.role || ""}:${node.metadata?.cosmos?.source_anchor || ""}`).join("|"),
    state.graph.edges.map((edge) => `${edge.id}:${edge.from}:${edge.to}:${edge.type}:${edge.confidence}:${edge.metadata?.cosmos?.strength || ""}:${edge.metadata?.cosmos?.distance || ""}`).join("|"),
  ].join("::");
  if (state.cosmosMetrics.key === key) return state.cosmosMetrics.map;

  const degree = nodeDegrees();
  const anchorMemo = new Map();
  const map = new Map();
  for (const node of state.graph.nodes) {
    const relations = relationsFor(node.id).filter((item) => state.nodeMap.has(item.other.id));
    const anchors = relationAnchorIds(node, relations, anchorMemo);
    const weakEdges = relations.filter((item) => isWeakOrDistantEdge(item.edge)).length;
    const recurrence = recurrenceScore(node, relations);
    const lifecycle = lifecycleForNode(node, relations);
    const crossAnchorCount = Math.max(0, anchors.length - 1);
    const explicitMass = numberOrDefault(node.metadata?.cosmos?.mass, NaN);
    const derivedMass = (NODE_BASE_MASS[node.type] || 3.2)
      + (degree.get(node.id) || 0) * 0.82
      + crossAnchorCount * 1.2
      + recurrence * 0.92
      + (CONFIDENCE_WEIGHT[node.confidence] || 0.5) * 1.1;
    let mass = Number.isFinite(explicitMass) ? explicitMass : derivedMass;
    if (lifecycle.stage === "theory_star") mass += 2.4;
    mass = clamp(mass, 2.2, 22);

    const cometScore = weakEdges * 0.8
      + crossAnchorCount * 1.15
      + recurrence * 1.1
      + (node.type === "question" || node.metadata?.status === "open" ? 1.25 : 0)
      + (node.confidence === "low" ? 0.7 : 0);
    const explicitRole = typeof node.metadata?.cosmos?.role === "string" ? node.metadata.cosmos.role : "";
    const role = explicitRole || inferCosmosRole(node, mass, anchors, cometScore, lifecycle);
    const attractors = relations
      .map((item) => ({
        nodeId: item.other.id,
        label: item.other.label,
        strength: edgeStrength(item.edge),
        edgeType: item.edge.type,
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);
    const synthesis = synthesisForNode(node.id);
    map.set(node.id, {
      id: node.id,
      role,
      mass,
      massParts: {
        base: NODE_BASE_MASS[node.type] || 3.2,
        degree: degree.get(node.id) || 0,
        crossAnchorCount,
        recurrence,
        confidence: node.confidence || "unknown",
      },
      lifecycle,
      luminosity: lifecycle.luminosity,
      freshness: lifecycle.freshness,
      stage: lifecycle.stage,
      synthesizedInto: lifecycle.synthesizedInto,
      synthesis,
      anchor: sourceAnchorId(node.id, anchorMemo),
      anchors,
      cometScore,
      weakEdges,
      attractors,
    });
  }
  state.cosmosMetrics = { key, map };
  return map;
}

function fallbackMetric(node) {
  const lifecycle = fallbackLifecycle(node);
  const explicitRole = typeof node.metadata?.cosmos?.role === "string" ? node.metadata.cosmos.role : "";
  return {
    id: node.id,
    role: explicitRole || (node.type === "book" ? "star" : "planet"),
    mass: NODE_BASE_MASS[node.type] || 3,
    massParts: {},
    lifecycle,
    luminosity: lifecycle.luminosity,
    freshness: lifecycle.freshness,
    stage: lifecycle.stage,
    synthesizedInto: "",
    synthesis: { asTheory: null, asPredecessor: [] },
    anchor: "",
    anchors: [],
    cometScore: 0,
    weakEdges: 0,
    attractors: [],
  };
}

function inferCosmosRole(node, mass, anchors, cometScore, lifecycle = fallbackLifecycle(node)) {
  if (node.type === "book") return "star";
  if (lifecycle.stage === "theory_star") return "star";
  if (node.type === "theme") return "planet";
  if ((node.type === "question" || node.metadata?.status === "open") && cometScore >= 1.2 && mass < 10.8) return "comet";
  if (cometScore >= 2.6 && mass < 11.6) return "comet";
  if (anchors.length >= 2 || mass >= 8.4) return "bridge";
  return "planet";
}

function relationAnchorIds(node, relations, memo) {
  const anchors = new Set();
  const own = sourceAnchorId(node.id, memo);
  if (own) anchors.add(own);
  for (const item of relations) {
    const anchor = sourceAnchorId(item.other.id, memo);
    if (anchor) anchors.add(anchor);
  }
  return [...anchors];
}

function sourceAnchorId(nodeId, memo = new Map(), stack = new Set()) {
  if (memo.has(nodeId)) return memo.get(nodeId);
  if (stack.has(nodeId)) return "";
  stack.add(nodeId);
  const node = state.nodeMap.get(nodeId);
  let anchor = "";
  if (node) {
    const explicit = node.metadata?.cosmos?.source_anchor;
    if (typeof explicit === "string" && state.nodeMap.has(explicit)) {
      anchor = explicit;
    } else if (node.type === "theme" && node.metadata?.cosmos?.role === "galaxy") {
      anchor = node.id;
    } else if (typeof node.source === "string" && state.nodeMap.has(node.source)) {
      anchor = sourceAnchorId(node.source, memo, stack);
    }
    if (!anchor) {
      const parent = state.graph.edges.find((edge) => edge.type === "contains" && edge.to === nodeId && state.nodeMap.has(edge.from));
      if (parent) anchor = sourceAnchorId(parent.from, memo, stack);
    }
  }
  stack.delete(nodeId);
  memo.set(nodeId, anchor);
  return anchor;
}

function recurrenceScore(node, relations) {
  const explicit = numberOrDefault(node.metadata?.cosmos?.recurrence, NaN);
  if (Number.isFinite(explicit)) return clamp(explicit, 0, 6);
  let score = 0;
  if (Array.isArray(node.metadata?.review_questions)) score += Math.min(2, node.metadata.review_questions.length * 0.32);
  score += relations.filter((item) => item.edge.type === "recurs_in" || item.edge.type === "updates").length * 0.7;
  score += nodeTags(node).filter((tag) => /反复|长期|迁移|开放|复盘/.test(tag)).length * 0.45;
  return score;
}

function lifecycleForNode(node) {
  const record = isObject(state.lifecycle.records?.[node.id]) ? state.lifecycle.records[node.id] : {};
  const synthesis = synthesisForNode(node.id);
  const baseHalfLifeDays = reviewHalfLifeDays(node);
  const reviewDays = daysSinceIso(record.last_reviewed_at);
  const practiceDays = daysSinceIso(record.last_practiced_at);
  const mastery = clamp(numberOrDefault(record.mastery, 0.5), 0, 1);
  const reviewCount = Math.max(0, Math.floor(numberOrDefault(record.review_count, 0)));
  const practiceCount = Math.max(0, Math.floor(numberOrDefault(record.practice_count, 0)));
  const halfLifeDays = ebbinghausHalfLifeDays(baseHalfLifeDays, reviewCount, practiceCount, mastery);
  const activityDays = [reviewDays, practiceDays].filter((value) => value !== null);
  const daysSinceActivity = activityDays.length ? Math.min(...activityDays) : null;
  const inferredDays = daysSinceActivity === null ? halfLifeDays * 1.35 : daysSinceActivity;
  const memoryStrengthDays = halfLifeDays / Math.LN2;
  const freshness = clamp(Math.exp(-inferredDays / memoryStrengthDays), 0.08, 1);
  const activityBoost = clamp(Math.log1p(reviewCount + practiceCount * 1.3) * 0.045, 0, 0.18);
  const nextReviewAt = nextEbbinghausReviewAt(record.last_reviewed_at, reviewCount, baseHalfLifeDays);
  const daysUntilReview = nextReviewAt ? daysUntilIso(nextReviewAt) : null;
  let stage = ALLOWED_LIFECYCLE_STAGES.has(record.stage) ? record.stage : "";

  if (synthesis.asTheory) {
    stage = "theory_star";
  } else if (!stage) {
    if (record.synthesized_into || synthesis.asPredecessor.length) {
      stage = freshness < 0.38 ? "remnant" : "synthesizing";
    } else if (freshness < 0.28) {
      stage = "dormant";
    } else if (freshness < 0.58) {
      stage = "fading";
    } else {
      stage = "active";
    }
  }

  let luminosity = clamp(0.24 + freshness * 0.58 + mastery * 0.16 + activityBoost, 0.18, 1.16);
  if (stage === "theory_star") luminosity = Math.max(luminosity, 1.08);
  if (stage === "active") luminosity = Math.max(luminosity, 0.74);
  if (stage === "fading") luminosity = clamp(luminosity, 0.42, 0.72);
  if (stage === "dormant") luminosity = clamp(luminosity * 0.58, 0.18, 0.42);
  if (stage === "synthesizing") luminosity = clamp(luminosity * 0.9, 0.48, 0.86);
  if (stage === "remnant") luminosity = clamp(luminosity * 0.66, 0.26, 0.58);

  return {
    record,
    stage,
    stageLabel: LIFECYCLE_STAGE_LABELS[stage] || "明亮稳定",
    freshness,
    luminosity,
    mastery,
    reviewCount,
    practiceCount,
    lastReviewedAt: nonEmptyString(record.last_reviewed_at) ? record.last_reviewed_at : "",
    lastPracticedAt: nonEmptyString(record.last_practiced_at) ? record.last_practiced_at : "",
    synthesizedInto: nonEmptyString(record.synthesized_into) ? record.synthesized_into : "",
    baseHalfLifeDays,
    halfLifeDays,
    memoryStrengthDays,
    nextReviewAt,
    daysUntilReview,
    reviewDue: daysUntilReview !== null && daysUntilReview <= 0,
    daysSinceReview: reviewDays,
    daysSincePractice: practiceDays,
    daysSinceActivity,
    reason: lifecycleReason(node, stage, halfLifeDays, daysSinceActivity, synthesis, record),
  };
}

function fallbackLifecycle(node) {
  const halfLifeDays = reviewHalfLifeDays(node);
  return {
    record: {},
    stage: "active",
    stageLabel: LIFECYCLE_STAGE_LABELS.active,
    freshness: 0.72,
    luminosity: 0.74,
    mastery: 0.5,
    reviewCount: 0,
    practiceCount: 0,
    lastReviewedAt: "",
    lastPracticedAt: "",
    synthesizedInto: "",
    baseHalfLifeDays: halfLifeDays,
    halfLifeDays,
    memoryStrengthDays: halfLifeDays / Math.LN2,
    nextReviewAt: "",
    daysUntilReview: null,
    reviewDue: false,
    daysSinceReview: null,
    daysSincePractice: null,
    daysSinceActivity: null,
    reason: "暂无生命周期档案，先按默认亮度显示。",
  };
}

function lifecycleReason(node, stage, halfLifeDays, daysSinceActivity, synthesis, record) {
  if (stage === "theory_star" && synthesis.asTheory) {
    return "这是生命周期档案记录的新理论恒星，由多个前身知识吸积、凝聚而来。";
  }
  if (record.synthesized_into || synthesis.asPredecessor.length) {
    const target = record.synthesized_into || synthesis.asPredecessor[0]?.theory_node_id || "";
    return target
      ? `它已成为「${nodeLabel(target)}」的前身/燃料，视觉上保留为谱系、星云或吸积盘。`
      : "它正在参与新理论的凝聚，视觉上会向新恒星收束。";
  }
  if (daysSinceActivity === null) return "暂无复习或实践记录，按艾宾浩斯指数遗忘曲线和默认半衰期推导亮度。";
  if (daysSinceActivity > halfLifeDays * 1.65) return `距离最近复习/实践 ${daysSinceActivity} 天，已明显超过当前 ${Math.round(halfLifeDays)} 天记忆半衰期。`;
  if (daysSinceActivity > halfLifeDays * 0.75) return `距离最近复习/实践 ${daysSinceActivity} 天，正在进入艾宾浩斯衰减区。`;
  return `最近 ${daysSinceActivity} 天内有复习或实践，当前记忆强度仍能支撑亮度。`;
}

function reviewHalfLifeDays(node) {
  const explicit = numberOrDefault(node.metadata?.cosmos?.review_half_life_days, NaN);
  if (Number.isFinite(explicit)) return clamp(explicit, 7, 365);
  if (node.type === "action" || node.type === "method") return 21;
  if (node.type === "book" || node.type === "theme") return 90;
  return 45;
}

function ebbinghausHalfLifeDays(baseHalfLifeDays, reviewCount, practiceCount, mastery) {
  const reviewReinforcement = Math.log1p(reviewCount) * 0.48;
  const practiceReinforcement = Math.log1p(practiceCount) * 0.62;
  const masteryReinforcement = mastery * 0.36;
  return clamp(baseHalfLifeDays * (1 + reviewReinforcement + practiceReinforcement + masteryReinforcement), 3, 365);
}

function nextEbbinghausReviewAt(lastReviewedAt, reviewCount, baseHalfLifeDays) {
  if (!nonEmptyString(lastReviewedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(lastReviewedAt)) return "";
  const index = clamp(reviewCount, 0, EBBINGHAUS_REVIEW_INTERVALS_DAYS.length - 1);
  const cadenceScale = clamp(baseHalfLifeDays / 45, 0.55, 2);
  const interval = Math.max(1, Math.round(EBBINGHAUS_REVIEW_INTERVALS_DAYS[index] * cadenceScale));
  return addDaysIso(lastReviewedAt, interval);
}

function synthesisForNode(nodeId) {
  const syntheses = Array.isArray(state.lifecycle.syntheses) ? state.lifecycle.syntheses.filter(isObject) : [];
  return {
    asTheory: syntheses.find((item) => item.theory_node_id === nodeId) || null,
    asPredecessor: syntheses.filter((item) => Array.isArray(item.predecessor_node_ids) && item.predecessor_node_ids.includes(nodeId)),
  };
}

function daysSinceIso(value) {
  if (!nonEmptyString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const then = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setDate(today.getDate() + Math.round(state.reviewTimeline.days || 0));
  return Math.max(0, Math.round((today - then) / 86400000));
}

function daysUntilIso(value) {
  if (!nonEmptyString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setDate(today.getDate() + Math.round(state.reviewTimeline.days || 0));
  return Math.round((target - today) / 86400000);
}

function addDaysIso(value, days) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const outYear = date.getFullYear();
  const outMonth = String(date.getMonth() + 1).padStart(2, "0");
  const outDay = String(date.getDate()).padStart(2, "0");
  return `${outYear}-${outMonth}-${outDay}`;
}

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isWeakOrDistantEdge(edge) {
  return ["reminds_of", "contrasts", "challenges", "updates", "recurs_in"].includes(edge.type)
    || edge.confidence === "low"
    || edge.metadata?.cosmos?.distance === "far";
}

function edgeStrength(edge) {
  const explicit = numberOrDefault(edge.metadata?.cosmos?.strength, NaN);
  if (Number.isFinite(explicit)) return clamp(explicit, 0.12, 2.4);
  const from = state.nodeMap.get(edge.from);
  const to = state.nodeMap.get(edge.to);
  const shared = from && to ? tagAffinity(from, to) : 0;
  const confidence = CONFIDENCE_WEIGHT[edge.confidence] || 0.56;
  return clamp((EDGE_BASE_STRENGTH[edge.type] || 0.72) * confidence * (1 + shared * 0.36), 0.12, 2.2);
}

function edgeDistance(edge) {
  const explicit = numberOrDefault(edge.metadata?.cosmos?.distance, NaN);
  if (Number.isFinite(explicit)) return clamp(explicit, 78, 620);
  const distanceHint = edge.metadata?.cosmos?.distance;
  if (distanceHint === "near") return 122;
  if (distanceHint === "medium") return 260;
  if (distanceHint === "far") return 500;
  const from = state.nodeMap.get(edge.from);
  const to = state.nodeMap.get(edge.to);
  const fromAnchor = sourceAnchorId(edge.from);
  const toAnchor = sourceAnchorId(edge.to);
  const crossGalaxy = fromAnchor && toAnchor && fromAnchor !== toAnchor;
  const shared = from && to ? tagAffinity(from, to) : 0;
  const base = {
    contains: 138,
    supports: 168,
    extends: 182,
    applies_to: 188,
    evidences: 220,
    updates: 250,
    reframes: 255,
    causes: 260,
    challenges: 300,
    contrasts: 320,
    recurs_in: 380,
    synthesizes: 460,
    reminds_of: 430,
  }[edge.type] || 260;
  return clamp(base + (crossGalaxy ? 120 : 0) - shared * 58, 96, 620);
}

function tagAffinity(a, b) {
  const aTags = new Set(nodeThemes(a));
  const bTags = new Set(nodeThemes(b));
  if (!aTags.size || !bTags.size) return 0;
  let shared = 0;
  for (const tag of aTags) if (bTags.has(tag)) shared += 1;
  return shared / Math.max(aTags.size, bTags.size);
}

function galaxyAnchorPositions(anchors, metrics) {
  const positions = new Map();
  const sorted = [...anchors].sort((a, b) => {
    const massDelta = (metrics.get(b.id)?.mass || 0) - (metrics.get(a.id)?.mass || 0);
    return massDelta || a.label.localeCompare(b.label, "zh-CN");
  });
  const count = sorted.length;
  if (!count) return positions;
  sorted.forEach((node, index) => {
    const metric = metrics.get(node.id) || fallbackMetric(node);
    const seed = hashNumber(`anchor:${node.id}`);
    const angle = count === 1 ? -Math.PI / 2 : (index / count) * Math.PI * 2 - Math.PI / 2 + ((seed % 80) - 40) / 500;
    const radius = count === 1
      ? (state.cosmosView === "meta" && metric.role === "star" ? 90 : 0)
      : state.cosmosView === "meta"
        ? (metric.role === "star" ? 210 : 560)
        : state.cosmosView === "comet"
          ? (metric.role === "star" ? 260 : 430)
          : 430;
    positions.set(node.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.74,
    });
  });
  return positions;
}

function applyLayoutRepulsion(items) {
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i];
      const b = items[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy) || 1;
      const minDist = Math.min(150, a.radius + b.radius + 24);
      const force = clamp((5200 + (a.metric.mass + b.metric.mass) * 120) / (dist * dist), 0, 2.1);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (!a.fixed) {
        a.vx -= fx / Math.sqrt(a.metric.mass);
        a.vy -= fy / Math.sqrt(a.metric.mass);
      }
      if (!b.fixed) {
        b.vx += fx / Math.sqrt(b.metric.mass);
        b.vy += fy / Math.sqrt(b.metric.mass);
      }
      if (dist < minDist) {
        const push = (minDist - dist) * 0.018;
        dx /= dist;
        dy /= dist;
        if (!a.fixed) {
          a.x -= dx * push;
          a.y -= dy * push;
        }
        if (!b.fixed) {
          b.x += dx * push;
          b.y += dy * push;
        }
      }
    }
  }
}

function applyLayoutEdges(edges, byId) {
  for (const edge of edges) {
    const a = byId.get(edge.from);
    const b = byId.get(edge.to);
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const target = edgeDistance(edge) * lensDistanceFactor(edge, a.metric, b.metric);
    const force = clamp((dist - target) * edgeStrength(edge) * 0.008, -2.2, 2.2);
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    if (!a.fixed) {
      a.vx += fx / Math.sqrt(a.metric.mass);
      a.vy += fy / Math.sqrt(a.metric.mass);
    }
    if (!b.fixed) {
      b.vx -= fx / Math.sqrt(b.metric.mass);
      b.vy -= fy / Math.sqrt(b.metric.mass);
    }
  }
}

function applyLayoutSyntheses(byId) {
  const syntheses = Array.isArray(state.lifecycle.syntheses) ? state.lifecycle.syntheses.filter(isObject) : [];
  for (const synthesis of syntheses) {
    const theory = byId.get(synthesis.theory_node_id);
    const predecessors = Array.isArray(synthesis.predecessor_node_ids) ? synthesis.predecessor_node_ids : [];
    if (!theory || !predecessors.length) continue;
    predecessors.forEach((nodeId, index) => {
      const item = byId.get(nodeId);
      if (!item || item.fixed) return;
      let dx = theory.x - item.x;
      let dy = theory.y - item.y;
      const dist = Math.hypot(dx, dy) || 1;
      const seed = hashNumber(`${synthesis.id}:${nodeId}`);
      const diskRadius = 92 + (index % 4) * 28 + (seed % 23);
      const force = clamp((dist - diskRadius) * 0.006, -0.72, 0.82);
      dx /= dist;
      dy /= dist;
      const tangent = ((seed % 2) ? 1 : -1) * 0.18;
      item.vx += (dx * force - dy * tangent) / Math.sqrt(item.metric.mass);
      item.vy += (dy * force + dx * tangent) / Math.sqrt(item.metric.mass);
      if (!theory.fixed) {
        theory.vx -= dx * force * 0.06;
        theory.vy -= dy * force * 0.06;
      }
    });
  }
}

function lensDistanceFactor(edge, aMetric, bMetric) {
  if (edge.type === "synthesizes") {
    return state.cosmosView === "meta" ? 0.92 : 1.22;
  }
  if (state.cosmosView === "meta") {
    return aMetric.role === "star" || bMetric.role === "star" || aMetric.role === "bridge" || bMetric.role === "bridge" ? 0.72 : 1.08;
  }
  if (state.cosmosView === "comet") {
    return aMetric.role === "comet" || bMetric.role === "comet" ? 1.35 : 0.95;
  }
  return edge.type === "contains" ? 0.86 : 1;
}

function applyLayoutAnchors(items, anchorPositions) {
  const strength = state.cosmosView === "galaxy" ? 0.018 : state.cosmosView === "meta" ? 0.009 : 0.007;
  for (const item of items) {
    if (item.fixed || !item.metric.anchor) continue;
    const anchor = anchorPositions.get(item.metric.anchor);
    if (!anchor) continue;
    const pull = item.metric.role === "bridge" || item.metric.role === "comet" ? strength * 0.35 : strength;
    item.vx += (anchor.x - item.x) * pull;
    item.vy += (anchor.y - item.y) * pull;
  }
}

function applyLayoutLensGravity(items) {
  for (const item of items) {
    if (item.fixed) continue;
    if (state.cosmosView === "meta") {
      const factor = item.metric.role === "star" ? 0.016 : item.metric.role === "bridge" ? 0.01 : 0.003;
      item.vx += -item.x * factor;
      item.vy += -item.y * factor;
    } else if (state.cosmosView === "comet") {
      const target = roleTargetRadius(item.metric.role);
      const dist = Math.hypot(item.x, item.y) || 1;
      const radial = (target - dist) * (item.metric.role === "comet" ? 0.012 : 0.004);
      item.vx += (item.x / dist) * radial;
      item.vy += (item.y / dist) * radial;
    } else {
      item.vx += -item.x * 0.0018;
      item.vy += -item.y * 0.0018;
    }
  }
}

function integrateLayout(items, step, iterations) {
  const heat = 1 - step / iterations;
  const limit = state.cosmosView === "comet" ? 980 : 820;
  for (const item of items) {
    if (item.fixed) continue;
    item.vx *= 0.68;
    item.vy *= 0.68;
    item.x += clamp(item.vx, -18, 18) * (0.45 + heat * 0.55);
    item.y += clamp(item.vy, -18, 18) * (0.45 + heat * 0.55);
    const dist = Math.hypot(item.x, item.y);
    if (dist > limit) {
      const ratio = limit / dist;
      item.x *= ratio;
      item.y *= ratio;
      item.vx *= 0.4;
      item.vy *= 0.4;
    }
  }
}

function roleTargetRadius(role) {
  if (state.cosmosView === "meta") {
    return role === "star" ? 120 : role === "bridge" ? 280 : role === "galaxy" ? 560 : 460;
  }
  if (state.cosmosView === "comet") {
    return role === "comet" ? 760 : role === "star" ? 260 : role === "galaxy" ? 400 : 520;
  }
  return role === "galaxy" ? 430 : role === "star" ? 220 : role === "bridge" ? 330 : role === "comet" ? 640 : 260;
}

function orbitSizeFor(metric, seed) {
  const jitter = (seed % 53) / 53;
  if (metric.role === "comet") return 150 + metric.cometScore * 32 + jitter * 90;
  if (metric.role === "bridge") return 46 + jitter * 30;
  if (metric.role === "star") return 22 + jitter * 16;
  if (metric.role === "galaxy") return 10 + jitter * 10;
  return 30 + jitter * 28;
}

function orbitSpeedFor(metric, seed) {
  const jitter = (seed % 31) / 31;
  if (metric.role === "comet") return 0.000052 + jitter * 0.000038;
  if (metric.role === "galaxy") return 0.000008 + jitter * 0.000008;
  return 0.000022 + (1 / Math.max(metric.mass, 2)) * 0.000065 + jitter * 0.000014;
}

function numberOrDefault(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function structuredCloneSafe(value) {
  return value ? JSON.parse(JSON.stringify(value)) : {};
}

function edgeIdFor(from, type, to) {
  const clean = (value) => String(value || "").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return `edge:${clean(from)}:${clean(type)}:${clean(to)}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function roleLabel(role) {
  return {
    galaxy: "元认知星系",
    star: "恒星",
    bridge: "星际桥",
    comet: "彗星",
    planet: "行星",
  }[role] || role || "行星";
}

function worldToScreen(x, y, width, height) {
  return {
    x: width / 2 + (x + state.camera.x) * state.camera.scale,
    y: height / 2 + (y + state.camera.y) * state.camera.scale,
  };
}

function isScreenCircleVisible(x, y, radius, width, height, margin = 0) {
  return x + radius >= -margin
    && x - radius <= width + margin
    && y + radius >= -margin
    && y - radius <= height + margin;
}

function isScreenSegmentVisible(from, to, width, height, margin = 0) {
  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);
  const minY = Math.min(from.y, to.y);
  const maxY = Math.max(from.y, to.y);
  return maxX >= -margin
    && minX <= width + margin
    && maxY >= -margin
    && minY <= height + margin;
}

function screenToWorld(x, y, width, height) {
  return {
    x: (x - width / 2) / state.camera.scale - state.camera.x,
    y: (y - height / 2) / state.camera.scale - state.camera.y,
  };
}

function updateCamera() {
  const ease = 0.14;
  state.camera.scale += (state.camera.targetScale - state.camera.scale) * ease;
  state.camera.x += (state.camera.targetX - state.camera.x) * ease;
  state.camera.y += (state.camera.targetY - state.camera.y) * ease;
  syncCameraDebugAttributes();
}

function resetCamera() {
  state.camera.targetX = 0;
  state.camera.targetY = 0;
  state.camera.targetScale = 1;
  state.three.targetSpherical.radius = 980;
  state.three.targetSpherical.theta = 0.25;
  state.three.targetSpherical.phi = 1.15;
  state.three.targetPan.x = 0;
  state.three.targetPan.y = 0;
  state.three.targetPan.z = 0;
}

function maybeRedirectFromFileUrl() {
  if (location.protocol !== "file:") return;
  fetch(localSiteUrl("knowledge/data/graph.json"), { cache: "no-store" })
    .then((response) => {
      if (response.ok) location.replace(localSiteUrl("site/"));
    })
    .catch(() => {
      state.graphError = `当前是 file:// 打开。请启动本地服务后访问 ${localSiteUrl("site/")}`;
    });
}

async function setControlMode(mode) {
  state.controlMode = mode;
  renderControlMode();
  if (mode === "camera") {
    await startGestureCamera();
  } else {
    stopGestureCamera();
  }
}

async function startGestureCamera() {
  if (state.gesture.stream) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    els.gestureStatus.textContent = "当前浏览器不支持摄像头，请用 localhost 打开";
    return;
  }
  try {
    els.gestureStatus.textContent = "加载手指识别模型";
    await loadHandLandmarker();
    els.gestureStatus.textContent = "请求摄像头权限";
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: "user" },
      audio: false,
    });
    state.gesture.stream = stream;
    els.gestureVideo.srcObject = stream;
    await els.gestureVideo.play();
    state.gesture.previous = null;
    state.gesture.areaBase = 0;
    state.gesture.active = true;
    state.gesture.lastVideoTime = -1;
    state.gesture.previousPinchDistance = 0;
    state.gesture.previousTwoHandDistance = 0;
    state.gesture.pinchDown = false;
    state.gesture.lastX = 0;
    state.gesture.lastY = 0;
    els.gestureStatus.textContent = "食指移动旋转，捏合抓取/选择，双手拉开缩放";
  } catch (error) {
    console.warn(error);
    state.controlMode = "touch";
    renderControlMode();
    els.gestureStatus.textContent = "摄像头未启用";
  }
}

function stopGestureCamera() {
  if (state.gesture.stream) {
    state.gesture.stream.getTracks().forEach((track) => track.stop());
  }
  state.gesture.stream = null;
  state.gesture.previous = null;
  state.gesture.active = false;
  state.gesture.hoverId = "";
  state.gesture.previousPinchDistance = 0;
  state.gesture.previousTwoHandDistance = 0;
  state.gesture.pinchDown = false;
  state.gesture.lastX = 0;
  state.gesture.lastY = 0;
  els.gestureVideo.srcObject = null;
}

async function loadHandLandmarker() {
  if (state.gesture.landmarker) return state.gesture.landmarker;
  if (!state.gesture.visionPromise) {
    state.gesture.visionPromise = import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs");
  }
  const vision = await state.gesture.visionPromise;
  const fileset = await vision.FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
  );
  const options = {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  };
  try {
    state.gesture.landmarker = await vision.HandLandmarker.createFromOptions(fileset, options);
  } catch (error) {
    options.baseOptions.delegate = "CPU";
    state.gesture.landmarker = await vision.HandLandmarker.createFromOptions(fileset, options);
  }
  return state.gesture.landmarker;
}

function processGestureFrame(now) {
  if (
    state.controlMode !== "camera" ||
    !state.gesture.stream ||
    !state.gesture.landmarker ||
    state.view !== "cosmos"
  ) {
    return;
  }
  const video = els.gestureVideo;
  if (!video.videoWidth || !video.videoHeight) return;
  if (video.currentTime === state.gesture.lastVideoTime) return;
  state.gesture.lastVideoTime = video.currentTime;

  const result = state.gesture.landmarker.detectForVideo(video, now);
  const hands = result.landmarks || [];
  drawHandOverlay(hands);
  if (!hands.length) {
    state.gesture.active = false;
    state.gesture.previousPinchDistance = 0;
    state.gesture.pinchDown = false;
    state.gesture.lastX = 0;
    state.gesture.lastY = 0;
    els.gestureStatus.textContent = "把手放到摄像头前，露出拇指和食指";
    return;
  }

  if (hands.length >= 2) {
    handleTwoHandGesture(hands, now);
  } else {
    handleOneHandGesture(hands[0], now);
  }
}

function handleOneHandGesture(hand, now) {
  const thumb = hand[4];
  const index = hand[8];
  const indexMcp = hand[5];
  const middleBase = hand[9];
  const wrist = hand[0];
  const palmSize = Math.max(0.05, landmarkDistance(wrist, middleBase));
  const pinchDistance = landmarkDistance(thumb, index) / palmSize;
  const indexExtended = landmarkDistance(index, wrist) > landmarkDistance(indexMcp, wrist) * 1.18;
  const pointerX = clamp(1 - index.x, 0, 1);
  const pointerY = clamp(index.y, 0, 1);

  state.gesture.previousTwoHandDistance = 0;
  updateGesturePointer(pointerX, pointerY);
  const hover = nearestHitAtNormalized(state.gesture.pointerX, state.gesture.pointerY, 34);
  const pinching = state.gesture.pinchDown ? pinchDistance < 0.52 : pinchDistance < 0.34;
  const pointerDelta = Math.hypot(
    state.gesture.pointerX - state.gesture.pinchAnchorX,
    state.gesture.pointerY - state.gesture.pinchAnchorY
  );

  if (pinching && !state.gesture.pinchDown) {
    state.gesture.pinchStartedAt = now;
    state.gesture.pinchAnchorX = state.gesture.pointerX;
    state.gesture.pinchAnchorY = state.gesture.pointerY;
    state.gesture.pinchCandidateId = hover?.id || "";
    state.gesture.pinchMoved = false;
  }

  if (pinching) {
    if (pointerDelta > 0.035) state.gesture.pinchMoved = true;
    if (!state.gesture.pinchCandidateId || state.gesture.pinchMoved) {
      panByGesturePointer(0.82);
    }
  } else if (indexExtended && !hover) {
    rotateByGesturePointer(0.62);
  } else {
    primeGesturePointer();
  }

  if (!pinching && state.gesture.pinchDown) {
    const duration = now - state.gesture.pinchStartedAt;
    const canSelect = state.gesture.pinchCandidateId && duration < 680 && !state.gesture.pinchMoved;
    if (canSelect && now - state.gesture.lastSelectAt > 450) {
      selectNode(state.gesture.pinchCandidateId, true);
      state.pathMode = true;
      state.gesture.lastSelectAt = now;
      renderControlMode();
    }
    state.gesture.pinchCandidateId = "";
  }

  state.gesture.pinchDown = pinching;
  state.gesture.previousPinchDistance = pinchDistance;
  state.gesture.active = true;
  updateGestureHover(hover, now);
  els.gestureStatus.textContent = hover
    ? `指向：${nodeLabel(hover.id)} · 捏合松开查看路径`
    : indexExtended
      ? "移动食指旋转视角 · 捏合空处抓取星空"
      : "伸出食指来指向节点";
}

function handleTwoHandGesture(hands, now) {
  const leftIndex = hands[0][8];
  const rightIndex = hands[1][8];
  const pointerX = clamp(1 - (leftIndex.x + rightIndex.x) / 2, 0, 1);
  const pointerY = clamp((leftIndex.y + rightIndex.y) / 2, 0, 1);
  const distance = landmarkDistance(leftIndex, rightIndex);

  updateGesturePointer(pointerX, pointerY);
  state.gesture.pinchDown = false;
  state.gesture.pinchCandidateId = "";
  if (state.gesture.previousTwoHandDistance) {
    const factor = clamp(distance / state.gesture.previousTwoHandDistance, 0.9, 1.1);
    zoomCameraAt(pointerX * els.cosmosCanvas.width, pointerY * els.cosmosCanvas.height, factor);
  }
  state.gesture.previousTwoHandDistance = distance;
  panByGesturePointer(0.54);
  state.gesture.active = true;
  updateGestureHover(nearestHitAtNormalized(pointerX, pointerY, 34), now);
  els.gestureStatus.textContent = "双手拉开/合拢缩放，移动双手平移";
}

function updateGesturePointer(x, y) {
  state.gesture.pointerX += (x - state.gesture.pointerX) * 0.38;
  state.gesture.pointerY += (y - state.gesture.pointerY) * 0.38;
}

function panByGesturePointer(multiplier = 1) {
  const { dx, dy, active } = consumeGesturePointerDelta();
  if (active) {
    panCamera(-dx * multiplier, -dy * multiplier);
  }
}

function rotateByGesturePointer(multiplier = 1) {
  const { dx, dy, active } = consumeGesturePointerDelta();
  if (!active) return;
  if (!rotateCameraBy(dx, dy, multiplier)) {
    panCamera(-dx * multiplier, -dy * multiplier);
  }
}

function consumeGesturePointerDelta() {
  const dx = (state.gesture.pointerX - state.gesture.lastX) * els.cosmosCanvas.width;
  const dy = (state.gesture.pointerY - state.gesture.lastY) * els.cosmosCanvas.height;
  const active = Boolean(state.gesture.lastX || state.gesture.lastY);
  state.gesture.lastX = state.gesture.pointerX;
  state.gesture.lastY = state.gesture.pointerY;
  return { dx, dy, active };
}

function primeGesturePointer() {
  state.gesture.lastX = state.gesture.pointerX;
  state.gesture.lastY = state.gesture.pointerY;
}

function updateGestureHover(hover, now) {
  if (hover) {
    if (state.gesture.hoverId !== hover.id) {
      state.gesture.hoverId = hover.id;
      state.gesture.hoverSince = now;
    }
  } else {
    state.gesture.hoverId = "";
  }
}

function drawHandOverlay(hands) {
  const canvas = els.gestureCanvas;
  const width = 160;
  const height = 112;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(els.gestureVideo, 0, 0, width, height);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(255, 217, 129, 0.9)";
  ctx.fillStyle = "rgba(255, 217, 129, 0.95)";
  ctx.lineWidth = 2;
  for (const hand of hands) {
    drawLandmarkLine(ctx, hand, [4, 3, 2, 1, 0], width, height);
    drawLandmarkLine(ctx, hand, [8, 7, 6, 5, 0], width, height);
    for (const index of [4, 8]) {
      const point = hand[index];
      ctx.beginPath();
      ctx.arc((1 - point.x) * width, point.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    const thumb = hand[4];
    const index = hand[8];
    ctx.strokeStyle = state.gesture.pinchDown ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 217, 129, 0.75)";
    ctx.beginPath();
    ctx.moveTo((1 - thumb.x) * width, thumb.y * height);
    ctx.lineTo((1 - index.x) * width, index.y * height);
    ctx.stroke();
  }
  ctx.restore();
}

function selectNode(nodeId, focus) {
  if (!state.nodeMap.has(nodeId)) return;
  state.selectedId = nodeId;
  if (focus) focusOnNode(nodeId);
}

function focusOnNode(nodeId) {
  const node = state.nodeMap.get(nodeId);
  if (node && !state.layout.get(node.id)) prepareLayout(filteredNodes());
  const point = node ? state.layout.get(node.id) : null;
  if (!point) return;
  const world3d = currentNodeWorld3D(point);
  state.three.targetPan.x = world3d.x;
  state.three.targetPan.y = world3d.y;
  state.three.targetPan.z = world3d.z;
  state.three.targetSpherical.radius = clamp(state.three.targetSpherical.radius * 0.72, 360, 1200);
  const world = currentNodeWorld(point);
  state.camera.targetX = -world.x;
  state.camera.targetY = -world.y;
  state.camera.targetScale = clamp(state.camera.targetScale < 1.25 ? 1.45 : state.camera.targetScale, 1.2, 2.8);
}

function handleCosmosWheel(event) {
  const { x: px, y: py } = canvasPointFromEvent(event, els.cosmosCanvas);
  const deltaMode = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
  const dx = event.deltaX * deltaMode;
  const dy = event.deltaY * deltaMode;

  if (event.ctrlKey || event.metaKey || event.altKey) {
    const factor = Math.exp(-dy * 0.0024);
    zoomCameraAt(px, py, factor);
    return;
  }

  if (state.three.ready && state.view === "cosmos") {
    if (event.shiftKey) {
      panCamera(-dx, -dy);
    } else {
      rotateCameraBy(dx, dy, 0.76);
    }
    return;
  }

  panCamera(-dx, -dy);
}

function zoomCameraAt(screenX, screenY, factor) {
  if (state.three.ready && state.view === "cosmos") {
    state.three.targetSpherical.radius = clamp(state.three.targetSpherical.radius / factor, 220, 2400);
    return;
  }
  const canvas = els.cosmosCanvas;
  const { width, height } = canvas;
  const before = screenToWorld(screenX, screenY, width, height);
  const nextScale = clamp(state.camera.targetScale * factor, 0.38, 4.2);
  state.camera.targetScale = nextScale;
  state.camera.targetX = (screenX - width / 2) / nextScale - before.x;
  state.camera.targetY = (screenY - height / 2) / nextScale - before.y;
}

function zoomCameraToCenter(scale) {
  if (state.three.ready && state.view === "cosmos") {
    state.three.targetSpherical.radius = clamp(980 / scale, 220, 2400);
    return;
  }
  const canvas = els.cosmosCanvas;
  const nextScale = clamp(scale, 0.38, 4.2);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const before = screenToWorld(centerX, centerY, canvas.width, canvas.height);
  state.camera.targetScale = nextScale;
  state.camera.targetX = (centerX - canvas.width / 2) / nextScale - before.x;
  state.camera.targetY = (centerY - canvas.height / 2) / nextScale - before.y;
}

function panCamera(dx, dy) {
  if (state.three.ready && state.view === "cosmos") {
    const distanceFactor = state.three.targetSpherical.radius / 900;
    state.three.targetPan.x += (dx || 0) * distanceFactor * 0.55;
    state.three.targetPan.y -= (dy || 0) * distanceFactor * 0.55;
    return;
  }
  state.camera.targetX += dx / state.camera.targetScale;
  state.camera.targetY += dy / state.camera.targetScale;
}

function rotateCameraBy(dx, dy, multiplier = 1) {
  if (!state.three.ready || state.view !== "cosmos") return false;
  state.three.targetSpherical.theta -= (dx || 0) * 0.006 * multiplier;
  state.three.targetSpherical.phi = clamp(
    state.three.targetSpherical.phi - (dy || 0) * 0.005 * multiplier,
    0.18,
    Math.PI - 0.18
  );
  return true;
}

function handleThreePointerMove(event) {
  if (!state.three.dragging || state.view !== "cosmos") return;
  const dx = event.clientX - state.three.lastX;
  const dy = event.clientY - state.three.lastY;
  if (Math.abs(dx) + Math.abs(dy) > 2) state.three.moved = true;
  if (!state.three.ready) {
    panCamera(dx * 2, dy * 2);
  } else if (state.three.mode === "pan") {
    panCamera(dx * 2, dy * 2);
  } else {
    rotateCameraBy(dx, dy);
  }
  state.three.lastX = event.clientX;
  state.three.lastY = event.clientY;
}

function drawStarfield(ctx, stars, width, height, now, alpha) {
  ctx.save();
  drawSpaceDust(ctx, width, height, now, alpha);
  for (const star of stars) {
    const parallaxX = state.view === "cosmos" ? state.camera.x * star.depth * state.camera.scale * 0.08 : 0;
    const parallaxY = state.view === "cosmos" ? state.camera.y * star.depth * state.camera.scale * 0.08 : 0;
    const x = wrap(star.x * width + Math.sin(now * 0.00008 + star.phase) * 12 + parallaxX, width);
    const y = wrap(star.y * height + Math.cos(now * 0.00007 + star.phase) * 8 + parallaxY, height);
    ctx.globalAlpha = alpha * (0.35 + star.depth * 0.65);
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(x, y, star.size * star.depth, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSpaceDust(ctx, width, height, now, alpha) {
  const lowPower = performanceProfile().lowPower;
  const bands = lowPower ? 2 : 4;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < bands; i += 1) {
    const seed = hashNumber(`dust:${state.cosmosView}:${i}`);
    const cx = width * (0.18 + ((seed % 700) / 1000));
    const cy = height * (0.18 + (((seed * 37) % 650) / 1000));
    const rx = width * (0.22 + ((seed % 29) / 90));
    const ry = height * (0.08 + ((seed % 17) / 120));
    const drift = Math.sin(now * 0.00003 + seed) * width * 0.012;
    const gradient = ctx.createRadialGradient(cx + drift, cy, 0, cx + drift, cy, Math.max(rx, ry));
    const palette = [
      ["rgba(141, 220, 255, 0.12)", "rgba(141, 220, 255, 0)"],
      ["rgba(200, 188, 255, 0.1)", "rgba(200, 188, 255, 0)"],
      ["rgba(255, 217, 129, 0.08)", "rgba(255, 217, 129, 0)"],
      ["rgba(100, 125, 160, 0.1)", "rgba(100, 125, 160, 0)"],
    ][i % 4];
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(0.58, palette[0].replace(/0\.\d+\)/, "0.035)"));
    gradient.addColorStop(1, palette[1]);
    ctx.globalAlpha = alpha * (lowPower ? 0.35 : 0.52);
    ctx.fillStyle = gradient;
    ctx.translate(cx + drift, cy);
    ctx.rotate((((seed % 200) - 100) / 100) * 0.75);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();
}

function drawNode(ctx, node, x, y, radius, hot, dim, now) {
  const metric = cosmosMetrics().get(node.id) || fallbackMetric(node);
  const color = nodeVisualColor(node, metric);
  const pulse = Math.sin(now * 0.002 + hashNumber(node.id)) * 0.12 + 1;
  const lifecyclePulse = metric.stage === "synthesizing" ? 1 + Math.sin(now * 0.0034 + hashNumber(node.id)) * 0.055 : 1;
  const r = radius * (hot ? pulse : lifecyclePulse);
  const luminosity = metric.luminosity || 0.74;
  const gradient = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r * 1.2);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, color);
  gradient.addColorStop(1, "rgba(5, 7, 13, 0.9)");

  ctx.save();
  ctx.globalAlpha = dim ? 0.22 + luminosity * 0.18 : clamp(0.24 + luminosity * 0.78, 0.24, 1);
  ctx.shadowColor = color;
  ctx.shadowBlur = (hot ? 30 : metric.stage === "theory_star" ? 32 : 14) * luminosity;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  drawNodeSurfaceDetails(ctx, node, metric, x, y, r, now, dim);

  if (metric.stage === "theory_star" || hot) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexToRgba(color, metric.stage === "theory_star" ? 0.48 : 0.38);
    ctx.lineWidth = metric.stage === "theory_star" ? 2 : 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r + 11, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (metric.stage === "remnant" || metric.stage === "synthesizing") {
    ctx.shadowBlur = 0;
    ctx.setLineDash(metric.stage === "remnant" ? [3, 7] : [8, 5]);
    ctx.strokeStyle = hexToRgba(color, metric.stage === "remnant" ? 0.34 : 0.5);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y, r + 8, (r + 8) * 0.48, Math.sin(now * 0.0007 + hashNumber(node.id)) * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (r > 8 || hot) {
    ctx.shadowBlur = 0;
    ctx.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    ctx.fillStyle = dim ? "rgba(244,247,251,0.46)" : "rgba(244,247,251,0.88)";
    ctx.textAlign = "center";
    ctx.fillText(trimText(node.label, hot ? 12 : 8), x, y + r + 18);
  }
  ctx.restore();
}

function drawNodeSurfaceDetails(ctx, node, metric, x, y, r, now, dim) {
  if (r < 5) return;
  const profile = materialProfileForNode(node, metric);
  const seed = textureSeed(node);
  const luminosity = dim ? metric.luminosity * 0.36 : metric.luminosity;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.98, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalCompositeOperation = profile.id === "star" ? "lighter" : "source-over";
  for (let i = 0; i < 7; i += 1) {
    const localSeed = hashNumber(`surface:${seed}:${i}`);
    const angle = ((localSeed % 6283) / 1000) + now * 0.00008;
    const ox = x + Math.cos(angle) * r * (((localSeed % 61) / 100) - 0.2);
    const oy = y + Math.sin(angle * 1.3) * r * (((localSeed % 43) / 120) - 0.12);
    const width = r * (0.45 + (localSeed % 37) / 42);
    const height = r * (0.16 + (localSeed % 29) / 78);
    ctx.globalAlpha = clamp(luminosity * (profile.id === "star" ? 0.3 : 0.18), 0.035, 0.32);
    ctx.fillStyle = i % 3 === 0 ? profile.peak : i % 2 === 0 ? profile.land : profile.accent;
    ctx.beginPath();
    ctx.ellipse(ox, oy, width, height, angle * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!["star", "metallic", "volcanic", "comet"].includes(profile.id)) {
    ctx.globalAlpha = clamp(luminosity * 0.2, 0.025, 0.22);
    ctx.strokeStyle = profile.cloud;
    ctx.lineWidth = Math.max(1, r * 0.08);
    for (let i = 0; i < 3; i += 1) {
      const offset = Math.sin(now * 0.00025 + seed + i) * r * 0.18;
      ctx.beginPath();
      ctx.ellipse(x + offset, y - r * 0.22 + i * r * 0.22, r * 0.72, r * 0.12, -0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function nodeVisualColor(node, metric = cosmosMetrics().get(node.id) || fallbackMetric(node)) {
  if (metric.stage && metric.stage !== "active") return LIFECYCLE_STAGE_COLORS[metric.stage] || (TYPE_COLORS[node.type] || "#67e8f9");
  return TYPE_COLORS[node.type] || "#67e8f9";
}

function drawCometTail(ctx, node, x, y, radius, point, now, scale = 1, dim = false) {
  const color = TYPE_COLORS[node.type] || "#67e8f9";
  const angle = point.baseAngle + now * point.speed * point.direction;
  const length = clamp((point.orbitA || 120) * 0.42 * scale, radius * 1.8, 150);
  const dx = -Math.cos(angle) * length;
  const dy = -Math.sin(angle) * length * 0.46;
  const gradient = ctx.createLinearGradient(x, y, x + dx, y + dy);
  gradient.addColorStop(0, hexToRgba(color, dim ? 0.18 : 0.48));
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = gradient;
  ctx.lineWidth = Math.max(2, radius * 0.22);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + dx * 0.48, y + dy * 0.72 - radius * 0.2, x + dx, y + dy);
  ctx.stroke();
  ctx.restore();
}

function drawOrbitDot(ctx, x, y, r, color) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLandmarkLine(ctx, hand, indexes, width, height) {
  ctx.beginPath();
  indexes.forEach((index, offset) => {
    const point = hand[index];
    const x = (1 - point.x) * width;
    const y = point.y * height;
    if (offset === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function landmarkDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function drawGesturePointer(ctx, width, height) {
  if (state.controlMode !== "camera" || !state.gesture.active) return;
  const x = state.gesture.pointerX * width;
  const y = state.gesture.pointerY * height;
  const hot = Boolean(state.gesture.hoverId);
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = hot ? "rgba(255, 217, 129, 0.9)" : "rgba(245, 245, 247, 0.72)";
  ctx.fillStyle = hot ? "rgba(255, 217, 129, 0.12)" : "rgba(141, 220, 255, 0.1)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, hot ? 24 : 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 30, y);
  ctx.lineTo(x - 10, y);
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + 30, y);
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x, y - 10);
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x, y + 30);
  ctx.stroke();
  ctx.restore();
}

function drawEmptyCosmosMessage(ctx, width, height, text) {
  ctx.save();
  ctx.fillStyle = "rgba(245, 245, 247, 0.78)";
  ctx.font = "16px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, width / 2, height / 2);
  if (location.protocol === "file:") {
    ctx.fillStyle = "rgba(245, 245, 247, 0.52)";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    ctx.fillText(localSiteUrl("site/"), width / 2, height / 2 + 26);
  }
  ctx.restore();
}

async function handlePackageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const pkg = JSON.parse(text);
    state.packageResult = validateKnowledgePackage(pkg, file.name);
  } catch (error) {
    state.packageResult = {
      pkg: null,
      errors: [`JSON 解析失败：${error.message}`],
      warnings: [],
      fileName: file.name,
    };
  }
  renderImport();
}

async function mergeUploadedPackage(dryRun) {
  const result = state.packageResult;
  if (!result?.pkg || result.errors.length) {
    if (result) result.errors.push("请先上传并通过预检。");
    renderImport();
    return;
  }
  try {
    const response = await apiRequest("/knowledge-package/merge", {
      method: "POST",
      body: JSON.stringify({ package: result.pkg, dry_run: dryRun }),
    });
    const text = [response.stdout, response.stderr].filter(Boolean).join("\n").trim();
    state.packageResult.warnings = [
      ...(state.packageResult.warnings || []),
      dryRun ? `本地 dry-run 完成：${text || "可以合并"}` : `合并完成：${text || "已写入知识库"}`,
    ];
    if (!dryRun) await reloadKnowledgeData();
    else renderImport();
  } catch (error) {
    state.packageResult.errors = [...(state.packageResult.errors || []), `本地服务合并失败：${error.message}`];
    renderImport();
  }
}

function validateKnowledgePackage(pkg, fileName = "") {
  const errors = [];
  const warnings = [];
  const currentNodeIds = new Set(state.graph.nodes.map((node) => node.id));
  const currentEdgeIds = new Set(state.graph.edges.map((edge) => edge.id));
  const packageNodeIds = new Set();
  const packageEdgeIds = new Set();

  if (!isObject(pkg)) {
    return { pkg, errors: ["知识包必须是 JSON 对象。"], warnings, fileName };
  }

  if (pkg.package_version !== 1) errors.push("package_version 必须是 1。");
  if (!nonEmptyString(pkg.package_id)) errors.push("package_id 必须填写。");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pkg.created_at || "")) errors.push("created_at 必须使用 YYYY-MM-DD。");
  if (!isObject(pkg.source)) {
    errors.push("缺少 source 对象。");
  } else {
    if (pkg.source.skill !== "personal-knowledge-growth") errors.push("source.skill 必须是 personal-knowledge-growth。");
    if (!ALLOWED_SCENARIOS.has(pkg.source.scenario)) errors.push("source.scenario 不在允许范围内。");
    if (!nonEmptyString(pkg.source.language)) errors.push("source.language 必须填写。");
    if (!nonEmptyString(pkg.source.origin)) errors.push("source.origin 必须说明材料来源。");
    if (!nonEmptyString(pkg.source.description)) errors.push("source.description 必须说明知识包目的。");
  }

  const documents = Array.isArray(pkg.documents) ? pkg.documents : null;
  if (!documents) errors.push("documents 必须是数组。");
  if (documents && !documents.length) errors.push("documents 至少要包含一个 Markdown 文档。");
  const graphPatch = isObject(pkg.graph_patch) ? pkg.graph_patch : null;
  if (!graphPatch) errors.push("graph_patch 必须是对象。");
  const nodes = graphPatch && Array.isArray(graphPatch.nodes) ? graphPatch.nodes : null;
  const edges = graphPatch && Array.isArray(graphPatch.edges) ? graphPatch.edges : null;
  if (!nodes) errors.push("graph_patch.nodes 必须是数组。");
  if (!edges) errors.push("graph_patch.edges 必须是数组。");

  if (documents) {
    const docPaths = new Set();
    documents.forEach((doc, index) => {
      if (!isObject(doc)) {
        errors.push(`documents[${index}] 必须是对象。`);
        return;
      }
      if (!nonEmptyString(doc.path)) errors.push(`documents[${index}].path 必须填写。`);
      if (doc.path && !isSafeKnowledgePath(doc.path)) errors.push(`documents[${index}].path 路径非法：${doc.path}`);
      if (doc.path && docPaths.has(doc.path)) errors.push(`重复文档路径：${doc.path}`);
      if (doc.path) docPaths.add(doc.path);
      if (!nonEmptyString(doc.kind)) errors.push(`documents[${index}].kind 必须填写。`);
      if (doc.kind && !["book", "card", "import"].includes(doc.kind)) errors.push(`documents[${index}].kind 非法：${doc.kind}`);
      if (doc.kind === "book" && doc.path && !doc.path.startsWith("knowledge/books/")) errors.push(`documents[${index}] book 必须写入 knowledge/books/。`);
      if (doc.kind === "card" && doc.path && !doc.path.startsWith("knowledge/cards/")) errors.push(`documents[${index}] card 必须写入 knowledge/cards/。`);
      if (doc.kind === "import" && doc.path && !doc.path.startsWith("knowledge/imports/")) errors.push(`documents[${index}] import 必须写入 knowledge/imports/。`);
      if (!nonEmptyString(doc.title)) errors.push(`documents[${index}].title 必须填写。`);
      if (!nonEmptyString(doc.content_markdown)) errors.push(`documents[${index}].content_markdown 必须填写。`);
    });
  }

  if (nodes) {
    nodes.forEach((node, index) => {
      if (!isObject(node)) {
        errors.push(`graph_patch.nodes[${index}] 必须是对象。`);
        return;
      }
      validateRequiredString(node, "id", `nodes[${index}]`, errors);
      validateRequiredString(node, "type", `nodes[${index}]`, errors);
      validateRequiredString(node, "label", `nodes[${index}]`, errors);
      validateRequiredString(node, "summary", `nodes[${index}]`, errors);
      validateRequiredString(node, "confidence", `nodes[${index}]`, errors);
      if (node.type && !ALLOWED_NODE_TYPES.has(node.type)) errors.push(`nodes[${index}] 类型非法：${node.type}`);
      if (node.confidence && !ALLOWED_CONFIDENCE.has(node.confidence)) errors.push(`nodes[${index}] confidence 非法：${node.confidence}`);
      if (node.id && node.type && !node.id.startsWith(`${node.type}:`)) errors.push(`nodes[${index}].id 应以 ${node.type}: 开头。`);
      if (node.id && packageNodeIds.has(node.id)) errors.push(`知识包内重复节点 ID：${node.id}`);
      if (node.id && currentNodeIds.has(node.id)) errors.push(`节点 ID 已存在于当前知识库：${node.id}`);
      if (node.id) packageNodeIds.add(node.id);
      const cosmos = isObject(node.metadata?.cosmos) ? node.metadata.cosmos : {};
      if (cosmos.role !== undefined && !ALLOWED_COSMOS_ROLES.has(cosmos.role)) errors.push(`nodes[${index}].metadata.cosmos.role 非法：${cosmos.role}`);
      if (cosmos.role === "galaxy" && node.type !== "theme") errors.push(`nodes[${index}].metadata.cosmos.role: galaxy 只用于 theme 元认知节点。`);
      if (cosmos.source_anchor !== undefined && !nonEmptyString(cosmos.source_anchor)) errors.push(`nodes[${index}].metadata.cosmos.source_anchor 必须是非空字符串。`);
      if (!hasNodeSource(node)) errors.push(`nodes[${index}] 缺少来源字段：${node.id || node.label || "未命名节点"}`);
      if (node.tags !== undefined && !(Array.isArray(node.tags) && node.tags.every((tag) => typeof tag === "string"))) {
        errors.push(`nodes[${index}].tags 必须是字符串数组。`);
      }
    });
  }

  const endpointIds = new Set([...currentNodeIds, ...packageNodeIds]);
  if (edges) {
    edges.forEach((edge, index) => {
      if (!isObject(edge)) {
        errors.push(`graph_patch.edges[${index}] 必须是对象。`);
        return;
      }
      validateRequiredString(edge, "id", `edges[${index}]`, errors);
      validateRequiredString(edge, "type", `edges[${index}]`, errors);
      validateRequiredString(edge, "from", `edges[${index}]`, errors);
      validateRequiredString(edge, "to", `edges[${index}]`, errors);
      validateRequiredString(edge, "confidence", `edges[${index}]`, errors);
      if (edge.type && !ALLOWED_EDGE_TYPES.has(edge.type)) errors.push(`edges[${index}] 类型非法：${edge.type}`);
      if (edge.confidence && !ALLOWED_CONFIDENCE.has(edge.confidence)) errors.push(`edges[${index}] confidence 非法：${edge.confidence}`);
      if (edge.id && !edge.id.startsWith("edge:")) errors.push(`edges[${index}].id 应以 edge: 开头。`);
      if (edge.id && packageEdgeIds.has(edge.id)) errors.push(`知识包内重复关系 ID：${edge.id}`);
      if (edge.id && currentEdgeIds.has(edge.id)) errors.push(`关系 ID 已存在于当前知识库：${edge.id}`);
      if (edge.id) packageEdgeIds.add(edge.id);
      if (edge.from && !endpointIds.has(edge.from)) errors.push(`edges[${index}].from 缺失端点：${edge.from}`);
      if (edge.to && !endpointIds.has(edge.to)) errors.push(`edges[${index}].to 缺失端点：${edge.to}`);
    });
  }

  if (pkg.lifecycle_patch !== undefined) validateLifecyclePatchClient(pkg.lifecycle_patch, endpointIds, errors);
  if (nodes && !nodes.length && edges && !edges.length && pkg.lifecycle_patch === undefined) {
    errors.push("知识包至少要包含一个新增节点、关系或生命周期补丁。");
  }
  return { pkg, errors, warnings, fileName };
}

function validateLifecyclePatchClient(patch, endpointIds, errors) {
  if (!isObject(patch)) {
    errors.push("lifecycle_patch 必须是对象。");
    return;
  }
  const records = patch.records ?? {};
  if (!isObject(records)) {
    errors.push("lifecycle_patch.records 必须是对象。");
  } else {
    Object.entries(records).forEach(([nodeId, record]) => {
      if (!endpointIds.has(nodeId)) errors.push(`lifecycle_patch.records 缺失节点：${nodeId}`);
      if (!isObject(record)) {
        errors.push(`lifecycle_patch.records[${nodeId}] 必须是对象。`);
        return;
      }
      ["last_reviewed_at", "last_practiced_at"].forEach((key) => {
        if (record[key] && !/^\d{4}-\d{2}-\d{2}$/.test(record[key])) errors.push(`lifecycle_patch.records[${nodeId}].${key} 必须使用 YYYY-MM-DD。`);
      });
      ["review_count", "practice_count"].forEach((key) => {
        if (record[key] !== undefined && !Number.isInteger(record[key])) errors.push(`lifecycle_patch.records[${nodeId}].${key} 必须是整数。`);
      });
      if (record.mastery !== undefined && (typeof record.mastery !== "number" || record.mastery < 0 || record.mastery > 1)) {
        errors.push(`lifecycle_patch.records[${nodeId}].mastery 必须是 0 到 1。`);
      }
      if (record.stage !== undefined && !ALLOWED_LIFECYCLE_STAGES.has(record.stage)) {
        errors.push(`lifecycle_patch.records[${nodeId}].stage 非法：${record.stage}`);
      }
      if (record.synthesized_into && !endpointIds.has(record.synthesized_into)) {
        errors.push(`lifecycle_patch.records[${nodeId}].synthesized_into 缺失节点：${record.synthesized_into}`);
      }
    });
  }
  const syntheses = patch.syntheses ?? [];
  if (!Array.isArray(syntheses)) {
    errors.push("lifecycle_patch.syntheses 必须是数组。");
    return;
  }
  const ids = new Set();
  syntheses.forEach((synthesis, index) => {
    const label = `lifecycle_patch.syntheses[${index}]`;
    if (!isObject(synthesis)) {
      errors.push(`${label} 必须是对象。`);
      return;
    }
    ["id", "theory_node_id", "created_at", "summary", "mode"].forEach((key) => validateRequiredString(synthesis, key, label, errors));
    if (synthesis.id && ids.has(synthesis.id)) errors.push(`重复 synthesis id：${synthesis.id}`);
    if (synthesis.id) ids.add(synthesis.id);
    if (synthesis.theory_node_id && !endpointIds.has(synthesis.theory_node_id)) errors.push(`${label}.theory_node_id 缺失节点：${synthesis.theory_node_id}`);
    if (synthesis.created_at && !/^\d{4}-\d{2}-\d{2}$/.test(synthesis.created_at)) errors.push(`${label}.created_at 必须使用 YYYY-MM-DD。`);
    if (!Array.isArray(synthesis.predecessor_node_ids) || !synthesis.predecessor_node_ids.length) {
      errors.push(`${label}.predecessor_node_ids 必须是非空数组。`);
    } else {
      synthesis.predecessor_node_ids.forEach((nodeId) => {
        if (!endpointIds.has(nodeId)) errors.push(`${label}.predecessor_node_ids 缺失节点：${nodeId}`);
      });
    }
    if (synthesis.mode !== "accretion") errors.push(`${label}.mode 必须是 accretion。`);
  });
}

function mergeInstruction(pkg, nodes, edges, docs, lifecycleRecords = 0, lifecycleSyntheses = 0) {
  return [
    "请使用 personal-knowledge-growth skill 合并这个标准 Knowledge Package。",
    "",
    `Package: ${pkg.package_id || "未命名"}`,
    `来源场景: ${pkg.source?.scenario || "unknown"}`,
    `新增文档: ${docs.length} 个`,
    `新增节点: ${nodes.length} 个`,
    `新增关系: ${edges.length} 条`,
    `生命周期记录: ${lifecycleRecords} 条`,
    `理论凝聚记录: ${lifecycleSyntheses} 条`,
    "",
    "执行要求：",
    "1. 把这个 JSON 保存为 knowledge/imports/<topic-slug>/package.json。",
    "2. 运行 python3 -B scripts/validate_knowledge_package.py knowledge/imports/<topic-slug>/package.json。",
    "3. 运行 python3 -B scripts/ingest_knowledge_package.py knowledge/imports/<topic-slug>/package.json --dry-run。",
    "4. 运行 python3 -B scripts/ingest_knowledge_package.py knowledge/imports/<topic-slug>/package.json。",
    "5. 合并成功后打开本地知识星球网站。",
  ].join("\n");
}

function filteredNodes() {
  const query = state.filters.query.toLowerCase();
  const base = state.graph.nodes.filter((node) => {
    if (state.filters.type && node.type !== state.filters.type) return false;
    if (state.filters.confidence && node.confidence !== state.filters.confidence) return false;
    if (state.filters.tag && !nodeThemes(node).includes(state.filters.tag)) return false;
    if (!query) return true;
    const haystack = [
      node.id,
      node.type,
      node.label,
      node.summary,
      node.source,
      ...nodeThemes(node),
      ...Object.values(node.metadata || {}).map(String),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
  if (state.cosmosView !== "comet") return base;
  const metrics = cosmosMetrics();
  const cometIds = new Set(state.graph.nodes.filter((node) => (metrics.get(node.id) || fallbackMetric(node)).role === "comet").map((node) => node.id));
  if (!cometIds.size) return base;
  const contextIds = new Set(cometIds);
  for (const edge of state.graph.edges) {
    if (cometIds.has(edge.from)) contextIds.add(edge.to);
    if (cometIds.has(edge.to)) contextIds.add(edge.from);
  }
  for (const id of [...contextIds]) {
    const anchor = (metrics.get(id) || {}).anchor;
    if (anchor) contextIds.add(anchor);
  }
  if (state.selectedId) collectPathNodeIds(state.selectedId, 1).forEach((id) => contextIds.add(id));
  return base.filter((node) => contextIds.has(node.id));
}

function nearestHit(event, padding) {
  const { x, y } = canvasPointFromEvent(event, els.cosmosCanvas);
  return nearestHitAtPoint(x, y, padding);
}

function nearestHitAtNormalized(nx, ny, padding) {
  return nearestHitAtPoint(nx * els.cosmosCanvas.width, ny * els.cosmosCanvas.height, padding);
}

function nearestHitAtPoint(x, y, padding) {
  let best = null;
  let bestDist = Infinity;
  for (const hit of state.hitboxes) {
    const dist = Math.hypot(hit.x - x, hit.y - y);
    if (dist < hit.r + padding && dist < bestDist) {
      best = hit;
      bestDist = dist;
    }
  }
  return best;
}

function healthCheck() {
  const degree = nodeDegrees();
  const nodeIds = new Set(state.graph.nodes.map((node) => node.id));
  const orphans = state.graph.nodes.filter((node) => (degree.get(node.id) || 0) === 0);
  const missingSources = state.graph.nodes.filter((node) => {
    if (node.type === "book" || node.type === "theme") return false;
    return !hasNodeSource(node);
  });
  const missingEndpoints = state.graph.edges.filter((edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to));
  return { orphans, missingSources, missingEndpoints };
}

function buildFallbackDailyBrief() {
  const questions = state.graph.nodes.filter((node) => node.type === "question" && node.metadata?.status !== "done");
  const focusNode = questions[0] || state.graph.nodes.find((node) => node.confidence === "low" || node.confidence === "medium") || state.graph.nodes[0];
  const focus = focusNode
    ? {
        text: focusNode.label,
        source: focusNode.id,
        reason: focusNode.type === "question" ? "开放问题，适合今天和 AI 深聊" : "本地推导的优先节点",
      }
    : {
        text: "今天用一个真实场景检验最近最重要的知识节点。",
        source: "fallback",
        reason: "暂无图谱数据。",
      };
  const fuzzy = buildFallbackFuzzyPoints();
  const supplements = buildFallbackSupplements();
  const actionNode = state.graph.nodes.find((node) => node.type === "action" && node.metadata?.status === "active")
    || state.graph.nodes.find((node) => node.type === "action");
  const action = actionNode
    ? {
        text: actionNode.label,
        source: actionNode.id,
        status: actionNode.metadata?.status || "open",
        prompt: `过去 24 小时里，「${actionNode.label}」有没有真实发生？有效信号是什么？`,
      }
    : {
        text: "今天从一个知识点设计最小行动实验。",
        source: "fallback",
        status: "missing",
        prompt: "选择一个最近最常出现的知识点，设计一个一周内能尝试的最小行动。",
      };
  const recommendation = state.bookRecommendations[0] || {
    title: "示例：提问的艺术",
    author: "Demo",
    why_read: "当前知识库还没有推荐书单；先用一本提问方法示例来补足追问质量。",
    domain: ["提问", "学习方法", "知识管理"],
  };
  return {
    date: "",
    focus_question: focus,
    fuzzy_points: fuzzy,
    supplements,
    action_review: action,
    recommendation,
    ai_prompt: fallbackAiPrompt(focus, fuzzy, supplements, action),
  };
}

function buildFallbackFuzzyPoints() {
  const points = [];
  for (const node of state.graph.nodes) {
    if (node.type !== "book" && node.type !== "theme" && (node.confidence === "low" || node.confidence === "medium")) {
      points.push({
        text: `${node.label}：置信度是 ${node.confidence}`,
        source: node.id,
        reason: "置信度仍需追问",
      });
    }
    if (points.length >= 3) break;
  }
  for (const item of state.extracted.pending) {
    if (points.length >= 3) break;
    points.push({ text: item.text, source: item.source, reason: "Markdown 待追问" });
  }
  return points;
}

function buildFallbackSupplements() {
  const supplements = [];
  for (const item of state.extracted.review) {
    supplements.push({ text: `回答复习问题：${item.text}`, source: item.source });
    if (supplements.length >= 2) break;
  }
  if (!supplements.length) {
    supplements.push({ text: "给一个高连接节点补充现实案例和反例边界。", source: "graph" });
  }
  return supplements;
}

function fallbackAiPrompt(focus, fuzzy, supplements, action) {
  const fuzzyLines = fuzzy.length ? fuzzy.map((item) => `- ${item.text}`).join("\n") : "- 暂无明确模糊点，请从今天的主问题开始。";
  const supplementLines = supplements.length ? supplements.map((item) => `- ${item.text}`).join("\n") : "- 补一个现实案例和反例边界。";
  return [
    "请使用 personal-knowledge-growth skill 和我进行今日认知成长对话。",
    `今天最该聊的问题：${focus?.text || "从一个真实场景检验最近最重要的知识节点。"}`,
    "",
    "请围绕下面的模糊点追问：",
    fuzzyLines,
    "",
    "需要补充的知识：",
    supplementLines,
    "",
    `行动回访：${action?.prompt || "选择一个知识点设计最小行动实验。"}`,
  ].join("\n");
}

function sourceRecords() {
  const records = [];
  for (const node of state.graph.nodes) {
    for (const path of nodePaths(node)) {
      records.push({ path, label: node.label, nodeId: node.id });
    }
    if (node.source && state.nodeMap.has(node.source)) {
      records.push({ path: `source: ${node.source}`, label: node.label, nodeId: node.id });
    }
  }
  return uniqueBy(records, (item) => `${item.path}:${item.nodeId}`);
}

function extractMarkdownSignals() {
  const review = [];
  const pending = [];
  for (const [path, markdown] of state.markdown.entries()) {
    const lines = markdown.split(/\r?\n/);
    let inPending = false;
    for (const line of lines) {
      const text = line.trim();
      if (!text) continue;
      if (/^#+\s*待追问/.test(text)) {
        inPending = true;
        continue;
      }
      if (/^#+\s*/.test(text) && !/^#+\s*待追问/.test(text)) inPending = false;
      const reviewMatch = text.match(/复习问题[:：]\s*(.+)$/);
      if (reviewMatch) review.push({ text: reviewMatch[1], source: path });
      const pendingMatch = text.match(/^\d+[.、]\s*(.+)$/);
      if (inPending && pendingMatch) pending.push({ text: pendingMatch[1], source: path });
      const todoMatch = text.match(/待确认问题[:：]\s*(.+)$/);
      if (todoMatch) pending.push({ text: todoMatch[1], source: path });
    }
  }
  return { review, pending };
}

function relationsFor(nodeId) {
  return state.graph.edges
    .filter((edge) => edge.from === nodeId || edge.to === nodeId)
    .map((edge) => {
      const otherId = edge.from === nodeId ? edge.to : edge.from;
      return {
        edge,
        other: state.nodeMap.get(otherId) || { id: otherId, label: otherId, type: "concept", summary: "" },
        direction: edge.from === nodeId ? "指向" : "来自",
      };
    });
}

function collectPathNodeIds(rootId, depth) {
  const result = new Set([rootId]);
  let frontier = new Set([rootId]);
  for (let step = 0; step < depth; step += 1) {
    const next = new Set();
    for (const edge of state.graph.edges) {
      if (frontier.has(edge.from) && !result.has(edge.to)) next.add(edge.to);
      if (frontier.has(edge.to) && !result.has(edge.from)) next.add(edge.from);
    }
    for (const id of next) result.add(id);
    frontier = next;
    if (!frontier.size) break;
  }
  return result;
}

function nodeDegrees() {
  const degree = new Map();
  for (const node of state.graph.nodes) degree.set(node.id, 0);
  for (const edge of state.graph.edges) {
    degree.set(edge.from, (degree.get(edge.from) || 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) || 0) + 1);
  }
  return degree;
}

function nodePaths(node) {
  const metadata = node.metadata || {};
  return [metadata.book_note, metadata.card_path, metadata.source_path, metadata.import_path]
    .filter((path) => typeof path === "string" && path.trim())
    .filter((path, index, arr) => arr.indexOf(path) === index);
}

function allTags() {
  return unique(state.graph.nodes.flatMap((node) => nodeThemes(node))).sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function allThemes() {
  const counts = new Map();
  for (const node of state.graph.nodes) {
    for (const theme of nodeThemes(node)) counts.set(theme, (counts.get(theme) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

function nodeTags(node) {
  return Array.isArray(node.tags) ? node.tags.filter((tag) => typeof tag === "string") : [];
}

function nodeThemes(node) {
  const metadata = node.metadata || {};
  return unique([...nodeTags(node), ...normalizeTextValues(metadata.discipline)]).filter(Boolean);
}

function normalizeTextValues(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(normalizeTextValues);
  if (typeof value === "string") return [value.trim()].filter(Boolean);
  return [String(value).trim()].filter(Boolean);
}

function hasNodeSource(node) {
  const metadata = node.metadata || {};
  return Boolean(
    nonEmptyString(node.source) ||
      nonEmptyString(metadata.source_path) ||
      nonEmptyString(metadata.card_path) ||
      nonEmptyString(metadata.book_note) ||
      nonEmptyString(metadata.import_path) ||
      nonEmptyString(metadata.source_url)
  );
}

function sourceText(node, paths) {
  const parts = [];
  if (node.source) parts.push(`source: ${node.source}`);
  if (paths.length) parts.push(...paths);
  if (!parts.length) return "暂无来源。";
  return parts.join(" · ");
}

function cosmosExplanation(node, metric) {
  if (metric.role === "galaxy") {
    return "这是元认知星系：它不是单一本书或一次导入，而是长期反复出现的认知母题，负责组织书籍恒星、概念行星和行动轨道。";
  }
  if (metric.role === "star") {
    if (metric.stage === "theory_star") {
      return "这是个人理论恒星：多个前身知识经过复习、实践和综合后，在生命周期档案中凝聚成新的稳定判断。";
    }
    if (node.type === "book") {
      const anchor = metric.anchor ? nodeLabel(metric.anchor) : "未归档元认知星系";
      return `这是书籍恒星：它提供稳定来源和思想光源，当前归属于「${anchor}」。书内概念、观点和方法会围绕它形成行星轨道。`;
    }
    const attractors = metric.attractors.map((item) => item.label).slice(0, 3).join("、");
    return `这是显式标记的恒星：质量来自类型、连接数、跨元认知关系、复现度和置信度。主要吸引：${attractors || "暂无明显行星"}。`;
  }
  if (metric.role === "comet") {
    return `这是由弱关系、远关系、开放问题或周期复现合力推出的彗星轨道，暂时不完全归属于单一元认知星系。彗星分 ${metric.cometScore.toFixed(1)}。`;
  }
  if (metric.role === "bridge") {
    return "这是星际桥：它连接多个元认知星系、书籍来源或学科，比普通行星更适合观察跨主题暗线。";
  }
  return "这是行星节点：它通常是书内或主题下的具体概念、观点、方法、行动或问题，适合沿着直接来源和轨道关系继续追问。";
}

function lifecycleHtml(node, metric) {
  const lifecycle = metric.lifecycle || fallbackLifecycle(node);
  const synthesis = metric.synthesis || synthesisForNode(node.id);
  const nextReview = lifecycle.nextReviewAt
    ? lifecycle.daysUntilReview <= 0
      ? `${lifecycle.nextReviewAt} · 已到期`
      : `${lifecycle.nextReviewAt} · ${lifecycle.daysUntilReview} 天后`
    : "待记录首次复习";
  const theoryLine = synthesis.asTheory
    ? `由 ${synthesis.asTheory.predecessor_node_ids.map(nodeLabel).join("、")} 凝聚而来。${synthesis.asTheory.summary || ""}`
    : "";
  const predecessorTargets = unique([
    lifecycle.synthesizedInto,
    ...synthesis.asPredecessor.map((item) => item.theory_node_id),
  ]).filter(Boolean);
  const predecessorLine = predecessorTargets.length
    ? `已成为 ${predecessorTargets.map((id) => `「${nodeLabel(id)}」`).join("、")} 的前身/燃料。`
    : "";
  return `
    <div class="detail-section">
      <h4>生命史</h4>
      <div class="cosmos-meta-grid">
        ${healthItem("阶段", lifecycle.stageLabel, lifecycle.stage === "dormant" || lifecycle.reviewDue ? "warn" : lifecycle.stage === "theory_star" ? "ok" : "")}
        ${healthItem("亮度", percentText(lifecycle.luminosity), lifecycle.luminosity < 0.5 ? "warn" : "ok")}
        ${healthItem("记忆留存", percentText(lifecycle.freshness), lifecycle.freshness < 0.5 ? "warn" : "ok")}
        ${healthItem("掌握度", percentText(lifecycle.mastery), lifecycle.mastery >= 0.7 ? "ok" : "")}
        ${healthItem("复习", `${lifecycle.reviewCount} 次 · ${formatLifecycleDate(lifecycle.lastReviewedAt)}`, lifecycle.reviewDue ? "warn" : "")}
        ${healthItem("实践", `${lifecycle.practiceCount} 次 · ${formatLifecycleDate(lifecycle.lastPracticedAt)}`, lifecycle.practiceCount ? "ok" : "")}
        ${healthItem("半衰期", `${Math.round(lifecycle.halfLifeDays)} 天`, lifecycle.halfLifeDays > lifecycle.baseHalfLifeDays ? "ok" : "")}
        ${healthItem("下次复习", nextReview, lifecycle.reviewDue ? "warn" : "")}
      </div>
      <p class="detail-meta">${escapeHtml(lifecycle.reason)}</p>
      <p class="detail-meta">${escapeHtml(`艾宾浩斯留存 R=e^(-t/S)：基础半衰期 ${Math.round(lifecycle.baseHalfLifeDays)} 天，复习/实践/掌握度把当前半衰期提升到 ${Math.round(lifecycle.halfLifeDays)} 天。`)}</p>
      ${theoryLine ? `<p class="detail-meta">${escapeHtml(theoryLine)}</p>` : ""}
      ${predecessorLine ? `<p class="detail-meta">${escapeHtml(predecessorLine)}</p>` : ""}
    </div>
  `;
}

function sourceTraceHtml(node) {
  const trace = node.metadata?.source_trace;
  if (!isObject(trace)) return "";
  const items = [
    trace.work ? `出处：${trace.work}` : "",
    trace.passage ? `原文：${trace.passage}` : "",
    trace.source_confidence ? `查证置信度：${trace.source_confidence}` : "",
    trace.verified_at ? `查证日期：${trace.verified_at}` : "",
  ].filter(Boolean);
  const url = trace.source_url ? `<a href="${escapeAttr(trace.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(trace.source_url)}</a>` : "";
  return `
    <div class="detail-section">
      <h4>出处查证</h4>
      <p class="detail-meta">${escapeHtml(items.join(" · ") || "已有出处查证。")}</p>
      ${url ? `<p class="detail-meta">${url}</p>` : ""}
    </div>
  `;
}

function metric(label, value) {
  return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></article>`;
}

function nodeButton(node, meta) {
  return `
    <button class="item-button" data-node-id="${escapeAttr(node.id)}">
      <span class="item-head">
        <span class="item-label">${escapeHtml(node.label)}</span>
        <span class="item-type">${escapeHtml(meta || typeLabel(node.type))}</span>
      </span>
      <p class="item-summary">${escapeHtml(node.summary || "")}</p>
    </button>
  `;
}

function textItem(text, source, nodeId) {
  const attr = nodeId ? ` data-node-id="${escapeAttr(nodeId)}"` : "";
  const tag = nodeId ? "button" : "div";
  const className = nodeId ? "item-button" : "text-item";
  return `
    <${tag} class="${className}"${attr}>
      <span class="item-label">${escapeHtml(text)}</span>
      ${source ? `<p class="item-summary">${escapeHtml(source)}</p>` : ""}
    </${tag}>
  `;
}

function healthItem(label, value, status) {
  return `
    <div class="health-item package-item ${escapeAttr(status || "")}">
      <span class="item-head">
        <span class="item-label">${escapeHtml(label)}</span>
        <span class="status-pill">${escapeHtml(value)}</span>
      </span>
    </div>
  `;
}

function packageItem(text, status) {
  return `<div class="package-item ${escapeAttr(status)}">${escapeHtml(text)}</div>`;
}

function empty(text) {
  return `<p class="empty">${escapeHtml(text)}</p>`;
}

function tagsHtml(node) {
  const tags = nodeTags(node);
  if (!tags.length) return "";
  return `<div class="theme-grid">${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function bindNodeButtons(container) {
  container.querySelectorAll("[data-node-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.nodeId;
      renderDetail();
    });
  });
}

function setOptions(select, options, selected) {
  select.innerHTML = options.map(([value, label]) => `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`).join("");
  select.value = selected || "";
}

function typeLabel(type) {
  return TYPE_LABELS[type] || type || "未知";
}

function nodeLabel(id) {
  return state.nodeMap.get(id)?.label || id;
}

function percentText(value) {
  return `${Math.round(clamp(numberOrDefault(value, 0), 0, 1.2) * 100)}%`;
}

function formatLifecycleDate(value) {
  return nonEmptyString(value) ? value : "未记录";
}

function nodeRadius(node) {
  const metric = cosmosMetrics().get(node.id) || fallbackMetric(node);
  return nodeRadiusForMetric(metric);
}

function nodeRadiusForMetric(metric) {
  const base = metric.stage === "theory_star" ? 15 : metric.role === "galaxy" ? 13 : metric.role === "star" ? 12 : metric.role === "comet" ? 7 : metric.role === "bridge" ? 9 : 8;
  return clamp(base + Math.sqrt(metric.mass) * 3.1 + metric.mass * 0.34, 8, metric.role === "galaxy" || metric.role === "star" ? 34 : 26);
}

function nodeImportance(node) {
  return relationsFor(node.id).length;
}

function shouldShowNodeLabel(node, screenScale, hot, metric = cosmosMetrics().get(node.id) || fallbackMetric(node)) {
  if (hot) return true;
  if (metric.stage === "theory_star") return true;
  if (state.cosmosView === "meta" && ["star", "bridge", "galaxy"].includes(metric.role)) return true;
  if (state.cosmosView === "comet" && metric.role === "comet") return true;
  const degree = nodeImportance(node);
  if (degree >= 4) return true;
  if (degree >= 2 && screenScale > 0.32) return true;
  return screenScale > 0.66;
}

function typeRingIndex(type) {
  return {
    book: 0,
    theme: 1,
    concept: 2,
    method: 2,
    claim: 3,
    value: 3,
    belief: 3,
    reflection: 3,
    action: 4,
    question: 4,
    decision: 4,
    emotion: 4,
    example: 4,
  }[type] || 3;
}

function createStars(count, speedScale) {
  const colors = ["#ffffff", "#67e8f9", "#8ee8b6", "#f4c76b", "#b9a7ff"];
  return Array.from({ length: count }, (_, index) => {
    const seed = hashNumber(`star-${index}-${count}`);
    return {
      x: ((seed * 9301) % 10000) / 10000,
      y: ((seed * 49297) % 10000) / 10000,
      depth: 0.35 + ((seed % 100) / 100) * 0.75,
      size: 0.7 + ((seed % 17) / 17) * 1.9,
      speed: (0.2 + ((seed % 31) / 31) * 0.7) * speedScale,
      phase: seed % 628,
      color: colors[seed % colors.length],
    };
  });
}

let stableStars = null;
function createStableStars() {
  if (!stableStars) stableStars = createStars(240, 1.2);
  return stableStars;
}

function performanceProfile() {
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const adaptiveLowPower = Boolean(state.three?.adaptiveLowPower);
  const lowPower = adaptiveLowPower || cores <= 4 || memory <= 4 || matchMedia("(max-width: 720px)").matches;
  return {
    lowPower,
    adaptiveLowPower,
    maxFps: lowPower ? 30 : 60,
    pixelRatio: lowPower ? 1.15 : 1.55,
    ambientPixelRatio: lowPower ? 1.1 : 1.4,
    threeStars: lowPower ? 360 : 560,
    nebulaClouds: lowPower ? 5 : 9,
    planetTextureSize: lowPower ? 160 : 256,
    cloudTextureSize: lowPower ? 96 : 160,
    starTextureSize: lowPower ? 192 : 320,
    assetSurfaceTextureWidth: lowPower ? 256 : 512,
    assetDetailTextureWidth: lowPower ? 160 : 256,
    assetSeedBuckets: lowPower ? 5 : 9,
    proceduralSeedBuckets: lowPower ? 7 : 13,
    maxTextureCache: lowPower ? 48 : 96,
    cullRadiusMultiplier: lowPower ? 2.05 : 2.55,
    sphereSegments: (role) => {
      if (lowPower) return role === "star" || role === "galaxy" ? 28 : 22;
      return role === "planet" || role === "comet" ? 32 : 40;
    },
  };
}

function canvasPixelRatio(canvas) {
  const profile = performanceProfile();
  const limit = canvas === els.cosmosCanvas || canvas === els.cosmos3dCanvas
    ? profile.pixelRatio
    : profile.ambientPixelRatio;
  return Math.min(window.devicePixelRatio || 1, limit);
}

function canvasPointFromEvent(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width ? canvas.width / rect.width : 1;
  const scaleY = rect.height ? canvas.height / rect.height : 1;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function sizeCanvas(canvas) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = canvasPixelRatio(canvas);
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    resetLayout();
  }
}

function projectUrl(path) {
  const clean = path.replace(/^\/+/, "");
  return `/${clean}`;
}

function projectUrls(path) {
  const clean = path.replace(/^\/+/, "");
  if (location.protocol === "file:") {
    return [localSiteUrl(clean), "http://127.0.0.1:8765/" + clean, "../" + clean];
  }
  return ["/" + clean, "../" + clean, location.origin + "/" + clean];
}

async function fetchFirst(urls) {
  let lastError = new Error("No URL candidates");
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response;
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function localSiteUrl(path = "") {
  const clean = path.replace(/^\/+/, "");
  return `http://localhost:8765/${clean}`;
}

function isSafeKnowledgePath(path) {
  if (!nonEmptyString(path)) return false;
  if (path.startsWith("/") || path.includes("..") || path.includes("\\") || path.includes("//")) return false;
  if (!path.endsWith(".md")) return false;
  if (!ALLOWED_DOCUMENT_PREFIXES.some((prefix) => path.startsWith(prefix))) return false;
  return /^[A-Za-z0-9_\-./]+$/.test(path);
}

function validateRequiredString(item, key, label, errors) {
  if (!nonEmptyString(item[key])) errors.push(`${label}.${key} 必须填写。`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function trimText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(1, maxLength - 1))}…`;
}

function hashNumber(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrap(value, size) {
  return ((value % size) + size) % size;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
