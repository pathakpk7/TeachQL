import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;

export interface ExecutionResult {
  success: boolean;
  columns?: string[];
  values?: any[][];
  rows?: Record<string, any>[];
  rowCount?: number;
  executionTimeMs?: number;
  error?: string;
}

export interface EvaluationResult {
  passed: boolean;
  score: number;
  maxScore: number;
  executionResult: ExecutionResult;
  feedback: string;
  diffSummary?: {
    expectedRowsCount: number;
    actualRowsCount: number;
    mismatchedColumns?: string[];
  };
}

/**
 * Initializes the sql.js WebAssembly engine.
 */
export async function getSqlEngine(): Promise<SqlJsStatic> {
  if (!SQL) {
    const isNode = typeof window === 'undefined';
    if (isNode) {
      // In Node.js / SSR / test runner, locate local wasm in node_modules
      const path = await import('path');
      const wasmPath = path.resolve(process.cwd(), 'node_modules/sql.js/dist');
      SQL = await initSqlJs({
        locateFile: (file) => path.join(wasmPath, file),
      });
    } else {
      // In Browser, fetch from CDN or public directory
      SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });
    }
  }
  return SQL;
}

/**
 * Executes a student SQL query in an isolated, ephemeral in-memory database.
 * Never touches the application's actual PostgreSQL database.
 */
export async function executeSqlInSandbox(
  schemaDdl: string,
  seedDataSql: string,
  studentQuery: string,
  options: {
    timeoutMs?: number;
    maxRows?: number;
    readOnly?: boolean;
  } = {}
): Promise<ExecutionResult> {
  const { maxRows = 500, readOnly = true } = options;
  const startTime = Date.now();

  // Basic security check: disallow destructive server commands or multiple statement injection if read-only
  if (readOnly) {
    const trimmed = studentQuery.trim().toLowerCase();
    // Allow SELECT, WITH (common table expressions)
    if (
      trimmed.startsWith('drop ') ||
      trimmed.startsWith('alter ') ||
      trimmed.startsWith('truncate ') ||
      trimmed.startsWith('grant ') ||
      trimmed.startsWith('revoke ')
    ) {
      return {
        success: false,
        error: 'Security Error: DDL and privilege modification statements are prohibited in this sandbox.',
      };
    }
  }

  let db: Database | null = null;
  try {
    const sqlEngine = await getSqlEngine();
    db = new sqlEngine.Database();

    // 1. Initialize schema and sample data
    if (schemaDdl && schemaDdl.trim().length > 0) {
      db.run(schemaDdl);
    }
    if (seedDataSql && seedDataSql.trim().length > 0) {
      db.run(seedDataSql);
    }

    // 2. Execute query
    const results = db.exec(studentQuery);
    const duration = Date.now() - startTime;

    if (!results || results.length === 0) {
      return {
        success: true,
        columns: [],
        values: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: duration,
      };
    }

    const { columns, values } = results[0];
    const limitedValues = values.slice(0, maxRows);

    const rows = limitedValues.map((row) => {
      const rowObj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        rowObj[col] = row[idx];
      });
      return rowObj;
    });

    return {
      success: true,
      columns,
      values: limitedValues,
      rows,
      rowCount: values.length,
      executionTimeMs: duration,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'SQL Execution failed.',
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    if (db) {
      try {
        db.close();
      } catch {
        // ignore close error
      }
    }
  }
}

/**
 * Normalizes a value for comparison (case-insensitive string trimming, number precision, null consistency).
 */
function normalizeVal(val: any): string {
  if (val === null || val === undefined) return '__NULL__';
  if (typeof val === 'number') {
    // Float normalization
    return Number.isInteger(val) ? val.toString() : val.toFixed(4);
  }
  return String(val).trim().toLowerCase();
}

/**
 * Compares actual student query results against the expected output array.
 */
export function compareQueryResults(
  actualRows: Record<string, any>[],
  expectedRows: Record<string, any>[],
  orderSensitive: boolean = false
): boolean {
  if (actualRows.length !== expectedRows.length) return false;
  if (actualRows.length === 0 && expectedRows.length === 0) return true;

  const actualCols = Object.keys(actualRows[0] || {}).map((c) => c.toLowerCase());
  const expectedCols = Object.keys(expectedRows[0] || {}).map((c) => c.toLowerCase());

  if (actualCols.length !== expectedCols.length) return false;

  const normalizeRow = (row: Record<string, any>) => {
    // lowercase all column keys
    const entries = Object.entries(row).map(([k, v]) => [k.toLowerCase(), normalizeVal(v)]);
    // Sort columns so key ordering doesn't matter
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([_, v]) => v).join('|~|');
  };

  const actualSerialized = actualRows.map(normalizeRow);
  const expectedSerialized = expectedRows.map(normalizeRow);

  if (orderSensitive) {
    for (let i = 0; i < actualSerialized.length; i++) {
      if (actualSerialized[i] !== expectedSerialized[i]) {
        return false;
      }
    }
    return true;
  } else {
    // Sort both before comparing
    actualSerialized.sort();
    expectedSerialized.sort();
    for (let i = 0; i < actualSerialized.length; i++) {
      if (actualSerialized[i] !== expectedSerialized[i]) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Evaluates student SQL answer against question specifications.
 */
export async function evaluateSqlQuestion(
  schemaDdl: string,
  seedDataSql: string,
  studentQuery: string,
  expectedOutput: any[],
  orderSensitive: boolean,
  maxMarks: number
): Promise<EvaluationResult> {
  const execResult = await executeSqlInSandbox(schemaDdl, seedDataSql, studentQuery);

  if (!execResult.success) {
    return {
      passed: false,
      score: 0,
      maxScore: maxMarks,
      executionResult: execResult,
      feedback: `Execution Error: ${execResult.error}`,
    };
  }

  const passed = compareQueryResults(execResult.rows || [], expectedOutput, orderSensitive);

  if (passed) {
    return {
      passed: true,
      score: maxMarks,
      maxScore: maxMarks,
      executionResult: execResult,
      feedback: 'All test cases passed! Result output matches expected solution exactly.',
    };
  } else {
    return {
      passed: false,
      score: 0,
      maxScore: maxMarks,
      executionResult: execResult,
      feedback: `Output mismatch. Expected ${expectedOutput.length} rows, but your query returned ${execResult.rowCount || 0} rows or mismatched column values.`,
      diffSummary: {
        expectedRowsCount: expectedOutput.length,
        actualRowsCount: execResult.rowCount || 0,
      },
    };
  }
}
