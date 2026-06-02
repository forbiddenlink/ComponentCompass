import { describe, it, expect } from 'vitest';
import {
  A11Y_CONSOLE_MARKER,
  A11Y_ENTRY_SOURCE,
  A11Y_RUNNER_SOURCE,
  computeA11yScore,
  formatA11yViolations,
  normalizeAxeViolations,
  parseA11yConsoleLog,
  scoreBand,
  type A11yViolation,
} from './a11y';

const v = (impact: A11yViolation['impact'], nodeCount = 1, id = 'rule'): A11yViolation => ({
  id,
  impact,
  help: `${id} help`,
  nodeCount,
});

describe('a11y scoring', () => {
  describe('computeA11yScore', () => {
    it('returns 100 with no violations', () => {
      expect(computeA11yScore([])).toBe(100);
    });

    it('subtracts impact-weighted penalties', () => {
      // critical 15 + serious 10 + moderate 5 + minor 2 = 32 → 68
      expect(computeA11yScore([v('critical'), v('serious'), v('moderate'), v('minor')])).toBe(68);
    });

    it('counts a violation once regardless of affected node count', () => {
      expect(computeA11yScore([v('serious', 9)])).toBe(90);
    });

    it('treats null impact as minor', () => {
      expect(computeA11yScore([v(null)])).toBe(98);
    });

    it('floors at 0 instead of going negative', () => {
      const many = Array.from({ length: 20 }, () => v('critical'));
      expect(computeA11yScore(many)).toBe(0);
    });
  });

  describe('scoreBand', () => {
    it('maps high scores to good', () => {
      expect(scoreBand(100)).toBe('good');
      expect(scoreBand(90)).toBe('good');
    });

    it('maps mid scores to mid', () => {
      expect(scoreBand(89)).toBe('mid');
      expect(scoreBand(70)).toBe('mid');
    });

    it('maps low scores to poor', () => {
      expect(scoreBand(69)).toBe('poor');
      expect(scoreBand(0)).toBe('poor');
    });
  });

  describe('formatA11yViolations', () => {
    it('handles the empty case', () => {
      expect(formatA11yViolations([])).toBe('No accessibility issues detected.');
    });

    it('produces a numbered, impact-tagged list', () => {
      const out = formatA11yViolations([v('critical', 2, 'image-alt'), v('serious', 1, 'button-name')]);
      expect(out).toContain('1) [critical] image-alt: image-alt help (2 nodes)');
      expect(out).toContain('2) [serious] button-name: button-name help (1 node)');
    });
  });

  describe('normalizeAxeViolations', () => {
    it('returns [] for non-arrays', () => {
      expect(normalizeAxeViolations(null)).toEqual([]);
      expect(normalizeAxeViolations({})).toEqual([]);
    });

    it('trims raw axe output and counts nodes', () => {
      const raw = [
        { id: 'image-alt', impact: 'critical', help: 'Images need alt', helpUrl: 'x', nodes: [{}, {}] },
        { id: 'bad-impact', impact: 'nonsense', help: 'h', nodes: [{}] },
      ];
      const out = normalizeAxeViolations(raw);
      expect(out).toEqual([
        { id: 'image-alt', impact: 'critical', help: 'Images need alt', helpUrl: 'x', nodeCount: 2 },
        { id: 'bad-impact', impact: null, help: 'h', helpUrl: undefined, nodeCount: 1 },
      ]);
    });
  });

  describe('A11Y_RUNNER_SOURCE', () => {
    it('imports axe-core, audits the DOM, and reports via the console marker', () => {
      expect(A11Y_RUNNER_SOURCE).toContain("import axe from 'axe-core'");
      expect(A11Y_RUNNER_SOURCE).toContain('axe.run(document.body');
      expect(A11Y_RUNNER_SOURCE).toContain(A11Y_CONSOLE_MARKER);
      expect(A11Y_RUNNER_SOURCE).toContain("type: 'trace-a11y'");
    });

    it('entry imports the App and the runner side-effect', () => {
      expect(A11Y_ENTRY_SOURCE).toContain("import App from './App'");
      expect(A11Y_ENTRY_SOURCE).toContain("import './a11y'");
      expect(A11Y_ENTRY_SOURCE).toContain('createRoot');
    });
  });

  describe('parseA11yConsoleLog', () => {
    it('returns null for non-arrays and non-marker logs', () => {
      expect(parseA11yConsoleLog(null)).toBeNull();
      expect(parseA11yConsoleLog(['just a log'])).toBeNull();
    });

    it('parses a result marker line', () => {
      const payload = {
        type: 'trace-a11y',
        violations: [{ id: 'image-alt', impact: 'critical', help: 'h', nodes: [{}, {}] }],
        passes: 5,
      };
      const parsed = parseA11yConsoleLog([A11Y_CONSOLE_MARKER + JSON.stringify(payload)]);
      expect(parsed).toEqual({
        kind: 'result',
        passes: 5,
        violations: [
          { id: 'image-alt', impact: 'critical', help: 'h', helpUrl: undefined, nodeCount: 2 },
        ],
      });
    });

    it('parses an error marker line', () => {
      const parsed = parseA11yConsoleLog([
        A11Y_CONSOLE_MARKER + JSON.stringify({ type: 'trace-a11y-error', message: 'boom' }),
      ]);
      expect(parsed).toEqual({ kind: 'error', message: 'boom' });
    });
  });
});
