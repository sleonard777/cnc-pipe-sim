import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { JobState } from '../types/job';
import { MACHINE_ENVELOPE } from '../types/machine';
import { createMachineFrame } from './objects/MachineFrame';
import { createPipeObject } from './objects/PipeObject';
import { createChuckStation } from './objects/ChuckStation';
import { createPipeSupportWall } from './objects/PipeSupportWall';
import { createDriveChuck } from './objects/DriveChuck';
import { createPlasmaTorch, TorchGroup, TORCH_PIVOT_Y } from './objects/PlasmaTorch';
import { createAxisTriad } from './helpers/AxisTriad';
import { CutPathTracer } from './cutPath/CutPathTracer';
import { buildPathPoints } from './cutPath/pathMath';
import { AnimationController } from './animation/AnimationController';
import { useJobStore, AnimationState, AnimationSpeed } from '../state/jobStore';
import { toRad } from '../utils/math';

// ── Layout constants (world units = inches) ───────────────────────────────────
const TORCH_FRACTION  = 0.25;  // torch X as fraction of machine length from front

// Support roller steady-rest X positions (fractions of space behind torch)
const CHUCK_FRACTIONS: number[] = [];  // no support chucks shown — only the drive chuck

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private clock: THREE.Clock;
  private animFrameId = 0;

  // Scene groups
  private machineGroup    = new THREE.Group();
  private pipeGroup       = new THREE.Group();
  private driveChuckGroup = new THREE.Group();
  private torchMount      = new THREE.Group();   // A-axis: position.y
  private supportChucks: THREE.Group[] = [];
  private pipeSupportWall: THREE.Group | null = null;

  private torchObj: TorchGroup;
  private cutTracer: CutPathTracer;
  private animController: AnimationController;
  private sparkDummy = new THREE.Object3D();

  private currentJob: JobState | null = null;
  private torchWorldX = 30;          // recalculated in rebuild()
  private pathPointCount = 0;
  private animationState: AnimationState = 'idle';
  private animationSpeed: AnimationSpeed = 1;

  // Falling-piece physics state (null when not active)
  private fallingPiece: THREE.Group | null = null;
  private remainingPipe: THREE.Group | null = null;
  private fallingVelY = 0;
  private fallingLanded = false;
  private fallingLandTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    // ── Renderer ──────────────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x1a1a2e);

    // ── Scene ─────────────────────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a1a2e, 200, 600);

    // ── Camera ────────────────────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

    // ── Controls ──────────────────────────────────────────────────────────────
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 600;

    // ── Clock ─────────────────────────────────────────────────────────────────
    this.clock = new THREE.Clock();

    // ── Lighting ──────────────────────────────────────────────────────────────
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(60, 120, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left   = -200;
    sun.shadow.camera.right  =  200;
    sun.shadow.camera.top    =  100;
    sun.shadow.camera.bottom = -20;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x4466aa, 0.3);
    fill.position.set(-80, 40, -60);
    this.scene.add(fill);

    // ── Grid & Triad ──────────────────────────────────────────────────────────
    const grid = new THREE.GridHelper(800, 80, 0x333344, 0x222233);
    grid.position.y = -32;           // below table legs
    this.scene.add(grid);
    this.scene.add(createAxisTriad());

    // ── Static scene groups ───────────────────────────────────────────────────
    this.scene.add(this.machineGroup);
    this.scene.add(this.driveChuckGroup);
    this.scene.add(this.torchMount);

    // pipeGroup: translates along X, rotates around X
    this.scene.add(this.pipeGroup);

    // ── CutPathTracer (child of pipeGroup — rotates with pipe) ───────────────
    this.cutTracer = new CutPathTracer();
    this.pipeGroup.add(this.cutTracer.getMesh());

    // ── Torch ─────────────────────────────────────────────────────────────────
    this.torchObj = createPlasmaTorch();
    this.torchMount.add(this.torchObj.group);

    // ── Animation controller ──────────────────────────────────────────────────
    this.animController = new AnimationController();

    this.startRenderLoop();
  }

  // ── Render loop ─────────────────────────────────────────────────────────────
  private startRenderLoop(): void {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      const delta = this.clock.getDelta();
      if (this.animationState === 'playing') this.tickAnimation(delta);
      this.tickFalling(delta);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  // ── Animation tick ──────────────────────────────────────────────────────────
  private tickAnimation(delta: number): void {
    this.animController.setFeedOverride(useJobStore.getState().feedOverride);
    const s = this.animController.tick(delta);
    if (!s) return;

    const job = this.currentJob!;
    const radius = job.pipe.od / 2;

    // Pipe translates so the cut position aligns with the fixed torch X
    this.pipeGroup.position.x = this.torchWorldX - s.x;
    // Pipe rotates around its own axis (B-axis)
    this.pipeGroup.rotation.x = toRad(s.b);

    // Drive chuck follows pipe input end
    this.driveChuckGroup.position.x = this.pipeGroup.position.x + job.pipe.length;

    // Torch A-axis: torch TIP is the group origin, so group.y = pipe surface + cut clearance.
    // For square/rectangular pipe the surface distance varies with B rotation.
    let surfaceRadius = radius;
    if (job.pipe.shape === 'square' || job.pipe.shape === 'rectangular') {
      const halfH = job.pipe.shape === 'rectangular' ? (job.pipe.height ?? job.pipe.od) / 2 : radius;
      const halfW = radius;
      const bRad2 = toRad(s.b);
      const norm = Math.max(Math.abs(Math.cos(bRad2)) / halfH, Math.abs(Math.sin(bRad2)) / halfW);
      if (norm > 0) surfaceRadius = 1 / norm;
    } else if (job.pipe.shape === 'channel') {
      const halfH = radius; // od/2 = web half-height
      const halfW = (job.pipe.flangeWidth ?? Math.max(1, job.pipe.od * 0.5)) / 2;
      const bRad2 = toRad(s.b);
      const norm = Math.max(Math.abs(Math.cos(bRad2)) / halfH, Math.abs(Math.sin(bRad2)) / halfW);
      if (norm > 0) surfaceRadius = 1 / norm;
    }

    // Torch A-axis (bevel tilt): tilt toward chuck (world-Z axis) by angle A.
    // The torch stays at this fixed angle for the entire cut; B-rotation of the
    // pipe brings each surface point under the tilted torch.
    const aRad = toRad(s.a);
    this.torchObj.pivot.rotation.z = -aRad;

    // Compensate torchMount X and Y so the pivot-offset keeps the cutting TIP
    // at the correct world position regardless of bevel angle.
    // With pivot at TORCH_PIVOT_Y above the group origin, tilting by aRad shifts
    // the tip by: ΔX = +PIVOT_Y·sin(a),  ΔY = -PIVOT_Y·(1−cos(a))
    const pivotSin = TORCH_PIVOT_Y * Math.sin(aRad);
    const pivotCos = TORCH_PIVOT_Y * (1 - Math.cos(aRad));
    this.torchMount.position.x = this.torchWorldX + pivotSin;
    this.torchMount.position.y = this.pipeGroup.position.y + surfaceRadius + s.z - pivotCos;

    // Torch lateral (world-Z): used for flat-face hole/slot cuts on square pipe
    this.torchMount.position.z = s.tz;

    this.torchObj.setPlasmaOn(s.plasma);

    // Scatter sparks each frame during cutting
    if (s.plasma) this.scatterSparks();

    // Progressive cut reveal
    this.cutTracer.advance(s.pointIndex);

    // DRO update (60fps direct write, no immer)
    useJobStore.getState().setDroPosition({ x: s.x, y: s.tz, z: s.z, a: s.a, b: s.b });
    const gcLines = (useJobStore.getState().gcode ?? '').split('\n').length;
    useJobStore.getState().setCurrentGcodeLine(
      Math.floor((s.pointIndex / Math.max(1, this.pathPointCount - 1)) * gcLines)
    );

    if (s.done) this.onCutDone();
  }

  private onCutDone(): void {
    this.torchObj.setPlasmaOn(false);
    this.animationState = 'idle';   // stop tickAnimation; don't full-reset yet

    const job = this.currentJob!;
    const isSevering = ['straight', 'miter', 'bevel'].includes(job.cut.cutType);
    const pierceLen  = job.cut.xOffset;

    if (isSevering && pierceLen > 0.5 && pierceLen < job.pipe.length - 0.5) {
      this.startFallAnimation(job, pierceLen);
    } else {
      this.setAnimationState('idle');
    }
  }

  private startFallAnimation(job: JobState, pierceLen: number): void {
    const remainLen = job.pipe.length - pierceLen;
    const px = this.pipeGroup.position.x;
    const py = this.pipeGroup.position.y;
    const rx = this.pipeGroup.rotation.x;

    // Falling piece: the unsupported end (pipe local x: 0 → pierceLen)
    this.fallingPiece = new THREE.Group();
    this.fallingPiece.add(createPipeObject({ ...job.pipe, length: pierceLen }));
    this.fallingPiece.position.set(px, py, 0);
    this.fallingPiece.rotation.x = rx;
    this.scene.add(this.fallingPiece);

    // Remaining pipe: the chuck-side section (pipe local x: pierceLen → pipe.length)
    this.remainingPipe = new THREE.Group();
    this.remainingPipe.add(createPipeObject({ ...job.pipe, length: remainLen }));
    this.remainingPipe.position.set(px + pierceLen, py, 0);
    this.remainingPipe.rotation.x = rx;
    this.scene.add(this.remainingPipe);

    // Hide the original combined pipe mesh
    this.pipeGroup.visible = false;
    this.fallingVelY = 0;
  }

  private tickFalling(delta: number): void {
    if (!this.fallingPiece) return;

    const job = this.currentJob!;
    // Half-height of the cross-section bounding box (for landing on table)
    const halfSize = (job.pipe.shape === 'rectangular'
      ? (job.pipe.height ?? job.pipe.od)
      : job.pipe.shape === 'channel'
        ? Math.max(job.pipe.od, job.pipe.flangeWidth ?? job.pipe.od * 0.5)
        : job.pipe.od) / 2;
    const TABLE_Y  = -6;              // table surface world-Y (matches MachineFrame TABLE_DROP)
    const landingY = TABLE_Y + halfSize;

    if (!this.fallingLanded) {
      const GRAVITY = 90; // in/sec²
      this.fallingVelY -= GRAVITY * delta;
      this.fallingPiece.position.y += this.fallingVelY * delta;
      this.fallingPiece.rotation.z += 0.6 * delta; // gentle tumble

      if (this.fallingPiece.position.y <= landingY) {
        // Piece lands on table — clamp and come to rest
        this.fallingPiece.position.y = landingY;
        this.fallingVelY  = 0;
        this.fallingLanded = true;
        this.fallingLandTimer = 0;
      }
    } else {
      // Rest on table for 2 s, then auto-reset
      this.fallingLandTimer += delta;
      if (this.fallingLandTimer >= 2.0) {
        this.scene.remove(this.fallingPiece);
        this.scene.remove(this.remainingPipe!);
        this.fallingPiece  = null;
        this.remainingPipe = null;
        this.fallingLanded = false;
        this.pipeGroup.visible = true;
        this.setAnimationState('idle');
        useJobStore.getState().setAnimationState('idle');
      }
    }
  }

  private scatterSparks(): void {
    // Torch tip = group origin (y=0 in local space), world Y = torchMount.position.y
    const tipY = this.torchMount.position.y;
    const { sparksMesh } = this.torchObj;
    const SPREAD = 2.5;
    for (let i = 0; i < sparksMesh.count; i++) {
      this.sparkDummy.position.set(
        this.torchWorldX + (Math.random() - 0.5) * SPREAD,
        tipY             - Math.random() * SPREAD * 1.2,  // sparks fall down
        (Math.random() - 0.5) * SPREAD,
      );
      // Convert world → torchObj.pivot local space
      this.torchObj.pivot.worldToLocal(this.sparkDummy.position);
      this.sparkDummy.updateMatrix();
      sparksMesh.setMatrixAt(i, this.sparkDummy.matrix);
    }
    sparksMesh.instanceMatrix.needsUpdate = true;
  }

  // ── Job rebuild ──────────────────────────────────────────────────────────────
  updateJob(job: JobState): void {
    this.currentJob = job;
    this.rebuild(job);
  }

  private rebuild(job: JobState): void {
    // Clean up any in-flight fall from a previous cut
    if (this.fallingPiece)  { this.scene.remove(this.fallingPiece);  this.fallingPiece  = null; }
    if (this.remainingPipe) { this.scene.remove(this.remainingPipe); this.remainingPipe = null; }
    this.fallingLanded    = false;
    this.fallingLandTimer = 0;
    this.pipeGroup.visible = true;

    const envelope = MACHINE_ENVELOPE[job.machine.model];
    const L        = envelope.maxLength;
    const radius   = job.pipe.od / 2;

    this.torchWorldX = L * TORCH_FRACTION;

    // ── Machine frame ────────────────────────────────────────────────────────
    this.machineGroup.clear();
    this.machineGroup.add(
      createMachineFrame(L, this.torchWorldX)
    );

    // ── Support chucks (fixed world X, pipe slides through) ──────────────────
    // Remove old chuck groups from scene
    this.supportChucks.forEach((g) => this.scene.remove(g));
    this.supportChucks = [];

    CHUCK_FRACTIONS.forEach((frac) => {
      const wx = this.torchWorldX + frac * (L - this.torchWorldX);
      const g = new THREE.Group();
      g.add(createChuckStation(job.pipe.od, true));
      g.position.set(wx, radius, 0);
      this.scene.add(g);
      this.supportChucks.push(g);
    });

    // ── Pipe support steady-rest wall (midway between torch and chuck end) ───
    if (this.pipeSupportWall) this.scene.remove(this.pipeSupportWall);
    const supportX = this.torchWorldX + 5;   // 5" toward chuck side of torch
    this.pipeSupportWall = new THREE.Group();
    // bedDepth = distance from pipe centre down to table surface (TABLE_DROP=6 + pipe radius)
    this.pipeSupportWall.add(createPipeSupportWall(job.pipe.od, radius + 6));
    this.pipeSupportWall.position.set(supportX, radius, 0);
    this.scene.add(this.pipeSupportWall);

    // ── Pipe group ────────────────────────────────────────────────────────────
    // Remove old cut tracer first (it's a child of pipeGroup)
    this.pipeGroup.clear();
    const pipeObj = createPipeObject(job.pipe);
    this.pipeGroup.add(pipeObj);
    this.pipeGroup.add(this.cutTracer.getMesh()); // re-add after clear

    // Initial position: pipe xOffset position aligns with torch; bRotation sets start angle
    this.pipeGroup.position.set(
      this.torchWorldX - job.cut.xOffset,
      radius,
      0,
    );
    this.pipeGroup.rotation.x = toRad(job.cut.bRotation);

    // ── Drive chuck ───────────────────────────────────────────────────────────
    this.driveChuckGroup.clear();
    this.driveChuckGroup.add(createDriveChuck(job.pipe.od));
    this.driveChuckGroup.position.set(
      this.pipeGroup.position.x + job.pipe.length,
      radius,
      0,
    );

    // ── Build cut path and initialise tracer ──────────────────────────────────
    const points = buildPathPoints(job);
    this.pathPointCount = points.length;
    this.cutTracer.reset();
    // For channel: CutPathTracer uses flangeWidth/2 as halfW, od/2 as halfH
    const channelFW = job.pipe.shape === 'channel'
      ? (job.pipe.flangeWidth ?? Math.max(1, job.pipe.od * 0.5)) : 0;
    const tracerRadius = job.pipe.shape === 'channel' ? channelFW / 2 : radius;
    const tracerHalfH  = job.pipe.shape === 'channel' ? radius
      : job.pipe.shape === 'rectangular' ? (job.pipe.height ?? job.pipe.od) / 2
      : undefined;
    this.cutTracer.initPath(
      points, tracerRadius, Math.max(0.09, job.machine.kerfWidth * 0.8),
      job.pipe.shape, tracerHalfH,
    );

    this.animController.load(points, job.cut.feedRate, radius);
    this.animController.setSpeed(this.animationSpeed);

    // ── Torch mount: group origin = torch tip; Y = pipe surface + pierce height; Z = 0 ─
    let initSurfaceRadius = radius;
    if (job.pipe.shape === 'square' || job.pipe.shape === 'rectangular') {
      const halfH = job.pipe.shape === 'rectangular' ? (job.pipe.height ?? job.pipe.od) / 2 : radius;
      const halfW = radius;
      const bRad0 = toRad(job.cut.bRotation);
      const norm0 = Math.max(Math.abs(Math.cos(bRad0)) / halfH, Math.abs(Math.sin(bRad0)) / halfW);
      if (norm0 > 0) initSurfaceRadius = 1 / norm0;
    } else if (job.pipe.shape === 'channel') {
      const halfW = channelFW / 2;
      const bRad0 = toRad(job.cut.bRotation);
      const norm0 = Math.max(Math.abs(Math.cos(bRad0)) / radius, Math.abs(Math.sin(bRad0)) / halfW);
      if (norm0 > 0) initSurfaceRadius = 1 / norm0;
    }
    this.torchMount.position.set(
      this.torchWorldX,
      radius + initSurfaceRadius + job.cut.pierceHeight,
      0,
    );
    this.torchObj.pivot.rotation.z = 0;
    this.torchObj.setPlasmaOn(false);

    // ── Seed DRO ─────────────────────────────────────────────────────────────
    useJobStore.getState().setDroPosition({
      x: job.cut.xOffset, y: 0, z: job.cut.pierceHeight, a: 0, b: 0,
    });

    this.frameCameraTo(L, job.pipe.od);
  }

  private frameCameraTo(length: number, od: number): void {
    const cx = length * 0.45;
    const cy = od * 2;
    this.controls.target.set(cx, cy, 0);
    this.camera.position.set(cx - length * 0.05, cy + od * 6 + 30, length * 0.55);
    this.controls.update();
  }

  // ── Animation state ──────────────────────────────────────────────────────────
  setAnimationState(state: AnimationState): void {
    this.animationState = state;
    if (state === 'idle') {
      // Abort any in-flight fall animation
      if (this.fallingPiece)  { this.scene.remove(this.fallingPiece);  this.fallingPiece  = null; }
      if (this.remainingPipe) { this.scene.remove(this.remainingPipe); this.remainingPipe = null; }
      this.fallingLanded    = false;
      this.fallingLandTimer = 0;
      this.pipeGroup.visible = true;

      this.animController.reset();
      this.cutTracer.reset();
      this.torchObj.setPlasmaOn(false);
      if (this.currentJob) {
        const job = this.currentJob;
        const radius = job.pipe.od / 2;
        // Reset pipe and torch to start position (bRotation = initial B angle)
        this.pipeGroup.position.x = this.torchWorldX - job.cut.xOffset;
        this.pipeGroup.rotation.x = toRad(job.cut.bRotation);
        this.driveChuckGroup.position.x = this.pipeGroup.position.x + job.pipe.length;
        this.torchMount.position.y = radius + radius + job.cut.pierceHeight;
        this.torchMount.position.x = this.torchWorldX;
        this.torchMount.position.z = 0;
        this.torchObj.pivot.rotation.z = 0;
        useJobStore.getState().setDroPosition({
          x: job.cut.xOffset, y: 0, z: job.cut.pierceHeight, a: 0, b: 0,
        });
        useJobStore.getState().setCurrentGcodeLine(0);
      }
    }
  }

  setAnimationSpeed(speed: AnimationSpeed): void {
    this.animationSpeed = speed;
    this.animController.setSpeed(speed);
  }

  resize(width: number, height: number): void {
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    cancelAnimationFrame(this.animFrameId);
    this.controls.dispose();
    this.cutTracer.dispose();
    this.renderer.dispose();
    this.supportChucks.forEach((g) => this.scene.remove(g));
    if (this.pipeSupportWall) this.scene.remove(this.pipeSupportWall);
  }
}
