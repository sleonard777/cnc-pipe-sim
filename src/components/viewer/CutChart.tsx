import { useJobStore } from '../../state/jobStore';
import { buildPathPoints } from '../../scene/cutPath/pathMath';
import { saddleX, miterX, toRad } from '../../utils/math';

const row: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  padding: '0.25rem 0', borderBottom: '1px solid #1a1a2e',
};

const label: React.CSSProperties = { color: '#888', fontSize: '0.75rem' };
const value: React.CSSProperties = { color: '#e0e0e0', fontSize: '0.75rem', fontWeight: 'bold' };

const sectionHead: React.CSSProperties = {
  color: '#4a9eff', fontSize: '0.75rem', letterSpacing: '0.08em',
  margin: '0.75rem 0 0.25rem', borderBottom: '1px solid #333', paddingBottom: '0.15rem',
};

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div style={row}>
      <span style={label}>{l}</span>
      <span style={value}>{v}</span>
    </div>
  );
}

export function CutChart() {
  const job = useJobStore((s) => s.jobState);
  const { machine, pipe, cut } = job;

  // Build path to get stats
  const points = buildPathPoints(job);
  const plasmaPoints = points.filter((p) => p.plasma);
  const totalPoints = points.length;

  // A-axis range
  const aVals = points.map((p) => p.a);
  const aMin = Math.min(...aVals).toFixed(1);
  const aMax = Math.max(...aVals).toFixed(1);

  // X range during cut
  const cutXVals = plasmaPoints.map((p) => p.x);
  const xMin = cutXVals.length ? Math.min(...cutXVals).toFixed(3) : '--';
  const xMax = cutXVals.length ? Math.max(...cutXVals).toFixed(3) : '--';

  // Saddle-specific stats
  let saddleDepth = '--';
  if (cut.cutType === 'saddle' && cut.branchOD) {
    const rBranch = cut.branchOD / 2;
    const rMain = pipe.od / 2;
    const xAt0 = saddleX(cut.xOffset, rMain, rBranch, 0);
    const xAt180 = saddleX(cut.xOffset, rMain, rBranch, Math.PI);
    saddleDepth = `${Math.abs(xAt0 - cut.xOffset).toFixed(3)}" / ${Math.abs(xAt180 - cut.xOffset).toFixed(3)}"`;
  }

  // Miter offset
  let miterOffset = '--';
  if (cut.cutType === 'miter') {
    const xTop = miterX(cut.xOffset, pipe.od, cut.miterAngle, toRad(0));
    const xBot = miterX(cut.xOffset, pipe.od, cut.miterAngle, toRad(180));
    miterOffset = `${Math.abs(xTop - xBot).toFixed(3)}"`;
  }

  // Estimated cut arc length (rough)
  let arcLen = 0;
  for (let i = 1; i < plasmaPoints.length; i++) {
    const dx = plasmaPoints[i].x - plasmaPoints[i - 1].x;
    const db = ((plasmaPoints[i].b - plasmaPoints[i - 1].b + 540) % 360) - 180;
    const dbRad = db * Math.PI / 180;
    const arcArc = (pipe.od / 2) * Math.abs(dbRad);
    arcLen += Math.sqrt(dx * dx + arcArc * arcArc);
  }

  // Estimated cut time at feed rate
  const cutTimeSec = arcLen / (cut.feedRate / 60);
  const cutTimeStr = cutTimeSec < 60
    ? `${cutTimeSec.toFixed(1)} s`
    : `${Math.floor(cutTimeSec / 60)}m ${(cutTimeSec % 60).toFixed(0)}s`;

  // Kerf area estimate
  const kerfArea = (arcLen * machine.kerfWidth).toFixed(3);

  return (
    <div style={{ padding: '0.75rem', overflowY: 'auto', fontSize: '0.75rem', height: '100%' }}>
      <p style={sectionHead}>MACHINE</p>
      <Row l="Model" v={machine.model} />
      <Row l="Amperage" v={`${machine.amperage} A`} />
      <Row l="Kerf Width" v={`${machine.kerfWidth.toFixed(4)}"`} />

      <p style={sectionHead}>PIPE</p>
      <Row l="Shape" v={pipe.shape} />
      <Row l="OD" v={`${pipe.od.toFixed(3)}"`} />
      <Row l="Wall" v={`${pipe.wallThickness.toFixed(3)}"`} />
      <Row l="ID" v={`${(pipe.od - 2 * pipe.wallThickness).toFixed(3)}"`} />
      <Row l="Length" v={`${pipe.length.toFixed(3)}"`} />
      <Row l="Material" v={pipe.material} />

      <p style={sectionHead}>CUT</p>
      <Row l="Cut Type" v={cut.cutType.toUpperCase()} />
      <Row l="X Offset" v={`${cut.xOffset.toFixed(3)}"`} />
      <Row l="Feed Rate" v={`${cut.feedRate} IPM`} />
      <Row l="Pierce Height" v={`${cut.pierceHeight.toFixed(3)}"`} />
      <Row l="Cut Height" v={`${cut.cutHeight.toFixed(3)}"`} />

      {cut.cutType === 'miter' && (
        <>
          <Row l="Miter Angle" v={`${cut.miterAngle}°`} />
          <Row l="Miter X Spread" v={miterOffset} />
        </>
      )}
      {cut.cutType === 'bevel' && <Row l="Bevel Angle" v={`${cut.bevelAngle}°`} />}
      {cut.cutType === 'saddle' && (
        <>
          <Row l="Branch OD" v={`${(cut.branchOD ?? '--')}`} />
          <Row l="Saddle Depth (top/bot)" v={saddleDepth} />
        </>
      )}
      {(cut.cutType === 'hole' || cut.cutType === 'slot') && (
        <>
          <Row l="Hole Width" v={`${(cut.holeWidth ?? '--')}`} />
          {cut.cutType === 'slot' && <Row l="Slot Height" v={`${(cut.holeHeight ?? '--')}`} />}
        </>
      )}

      <p style={sectionHead}>TOOLPATH STATS</p>
      <Row l="Total Path Points" v={`${totalPoints}`} />
      <Row l="Plasma-On Points" v={`${plasmaPoints.length}`} />
      <Row l="A-Axis Range" v={`${aMin}° → ${aMax}°`} />
      <Row l="X During Cut" v={`${xMin}" → ${xMax}"`} />
      <Row l="B-Axis Rotation" v={cut.cutType === 'straight' ? `${cut.bRotation}°` : '360°'} />
      <Row l="Est. Cut Length" v={`${arcLen.toFixed(2)}"`} />
      <Row l="Est. Cut Time" v={cutTimeStr} />
      <Row l="Est. Kerf Area" v={`${kerfArea} in²`} />
    </div>
  );
}
