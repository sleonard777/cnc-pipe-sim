import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { JobState } from '../types/job';
import { MACHINE_ENVELOPE } from '../types/machine';
import { createMachineFrame } from './objects/MachineFrame';
import { createPipeObject } from './objects/PipeObject';
import { createChuckGroup } from './objects/ChuckJaws';
import { createPlasmaTorch, TorchGroup } from './objects/PlasmaTorch';
import { createAxisTriad } from './helpers/AxisTriad';
import { CutPathTracer } from './cutPath/CutPathTracer';
import { buildPathPoints } from './cutPath/pathMath';
import { AnimationController } from './animation/AnimationController';
import { AnimationState, AnimationSpeed } from '../state/jobStore';

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private clock: THREE.Clock;
  private animFrameId = 0;

  private machineGroup = new THREE.Group();
  private pipeGroup = new THREE.Group();
  private torchGroupWrapper = new THREE.Group(); // A-axis rotation
  private torchObj: TorchGroup;
  private chuckGroup = new THREE.Group();
  private cutTracer: CutPathTracer;
  private animController: AnimationController;

  private currentJob: JobState | null = null;
  private animationState: AnimationState = 'idle';
  private animationSpeed: AnimationSpeed = 1;

  constructor(canvas: HTMLCanvasElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x1a1a2e);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    this.camera.position.set(60, 50, 80);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Clock
    this.clock = new THREE.Clock();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 60);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(400, 40, 0x444444, 0x333333);
    grid.position.y = -2;
    this.scene.add(grid);

    // Axis triad
    const triad = createAxisTriad();
    triad.position.set(0, 0, 0);
    triad.scale.setScalar(0.5);
    this.scene.add(triad);

    // Scene groups
    this.scene.add(this.machineGroup);
    this.scene.add(this.pipeGroup);
    this.scene.add(this.chuckGroup);

    // Torch
    this.torchObj = createPlasmaTorch();
    this.torchGroupWrapper.add(this.torchObj.group);
    this.scene.add(this.torchGroupWrapper);

    // Cut path tracer
    this.cutTracer = new CutPathTracer(4000);
    this.pipeGroup.add(this.cutTracer.getMesh());

    // Animation controller
    this.animController = new AnimationController();

    this.startRenderLoop();
  }

  private startRenderLoop(): void {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      const delta = this.clock.getDelta();

      if (this.animationState === 'playing') {
        this.tickAnimation(delta);
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private tickAnimation(delta: number): void {
    const state = this.animController.tick(delta);
    if (!state) return;

    // Update torch world position
    // X axis = pipe axis, torch moves along X at current x offset
    const od = this.currentJob?.pipe.od ?? 4;
    const radius = od / 2;

    const bRad = (state.b * Math.PI) / 180;
    // Torch sits above pipe surface at z height, rotated around pipe axis
    this.torchGroupWrapper.position.set(
      state.x,
      (radius + state.z) * Math.cos(bRad),
      (radius + state.z) * Math.sin(bRad)
    );
    this.torchGroupWrapper.rotation.x = bRad;
    // A-axis tilt
    this.torchObj.group.rotation.z = (state.a * Math.PI) / 180;

    this.torchObj.setPlasmaOn(state.plasma);
    this.cutTracer.advance(state.pointIndex);

    if (state.done) {
      this.setAnimationState('idle');
    }
  }

  updateJob(job: JobState): void {
    this.currentJob = job;
    this.rebuild(job);
  }

  private rebuild(job: JobState): void {
    const envelope = MACHINE_ENVELOPE[job.machine.model];

    // Machine frame
    this.machineGroup.clear();
    this.machineGroup.add(createMachineFrame(envelope.maxLength));

    // Chuck
    this.chuckGroup.clear();
    this.chuckGroup.add(createChuckGroup(job.pipe.od));
    this.chuckGroup.position.set(0, job.pipe.od / 2, 0);

    // Pipe
    this.pipeGroup.clear();
    const pipeObj = createPipeObject(job.pipe);
    this.pipeGroup.add(pipeObj);
    this.pipeGroup.position.set(0, job.pipe.od / 2, 0);

    // Re-add cut tracer to pipeGroup
    this.cutTracer.reset();
    this.pipeGroup.add(this.cutTracer.getMesh());

    // Build path and init tracer
    const points = buildPathPoints(job);
    this.cutTracer.initPath(points, job.pipe.od / 2);

    // Load animation
    this.animController.load(points, job.cut.feedRate);
    this.animController.setSpeed(this.animationSpeed);

    // Torch start position
    this.torchGroupWrapper.position.set(
      job.cut.xOffset,
      job.pipe.od / 2 + job.cut.pierceHeight,
      0
    );
    this.torchObj.setPlasmaOn(false);

    // Frame camera to machine
    this.frameCameraTo(envelope.maxLength, job.pipe.od);
  }

  private frameCameraTo(length: number, od: number): void {
    const cx = length / 2;
    const cy = od + 10;
    this.controls.target.set(cx, cy, 0);
    this.camera.position.set(cx, cy + length * 0.4, length * 0.7);
    this.controls.update();
  }

  setAnimationState(state: AnimationState): void {
    this.animationState = state;
    if (state === 'idle') {
      this.animController.reset();
      this.cutTracer.reset();
      this.torchObj.setPlasmaOn(false);
    }
  }

  setAnimationSpeed(speed: AnimationSpeed): void {
    this.animationSpeed = speed;
    this.animController.setSpeed(speed);
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    cancelAnimationFrame(this.animFrameId);
    this.controls.dispose();
    this.cutTracer.dispose();
    this.renderer.dispose();
  }
}
