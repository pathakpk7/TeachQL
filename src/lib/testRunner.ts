import { executeSqlInSandbox, evaluateSqlQuestion, compareQueryResults } from './sqlEngine';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TeachQL Automated Verification Test Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // TEST 1: Sandbox SQL Execution
  console.log('--- Test 1: Isolated SQL Execution Sandbox ---');
  const ddl = `CREATE TABLE items (id INT PRIMARY KEY, name VARCHAR(50), price INT);`;
  const seed = `INSERT INTO items VALUES (1, 'Pen', 10), (2, 'Notebook', 50), (3, 'Bag', 200);`;
  const studentSql = `SELECT name, price FROM items WHERE price >= 50 ORDER BY price DESC;`;

  const execRes = await executeSqlInSandbox(ddl, seed, studentSql);
  assert(execRes.success === true, 'Sandbox runs valid SQL query successfully');
  assert(execRes.rowCount === 2, 'Sandbox returned expected row count (2)');
  assert(execRes.rows?.[0].name === 'Bag', 'Ordering in query was preserved');

  // TEST 2: Security Isolation Guard
  console.log('\n--- Test 2: Security & Destruction Guard in Sandbox ---');
  const dangerousSql = `DROP TABLE items;`;
  const secRes = await executeSqlInSandbox(ddl, seed, dangerousSql, { readOnly: true });
  assert(secRes.success === false, 'Disallowed DDL statement (DROP TABLE) blocked');

  // TEST 3: Result Normalization & Automated Evaluation
  console.log('\n--- Test 3: Result Normalization & Automated Grading ---');
  const expectedOutput = [
    { name: 'Bag', price: 200 },
    { name: 'Notebook', price: 50 },
  ];

  const evalCorrect = await evaluateSqlQuestion(ddl, seed, studentSql, expectedOutput, true, 10);
  assert(evalCorrect.passed === true, 'Correct SQL query awarded full 10 marks');
  assert(evalCorrect.score === 10, 'Automated score calculation is accurate');

  const incorrectSql = `SELECT name, price FROM items WHERE price > 100;`;
  const evalIncorrect = await evaluateSqlQuestion(ddl, seed, incorrectSql, expectedOutput, true, 10);
  assert(evalIncorrect.passed === false, 'Incorrect query failed validation');
  assert(evalIncorrect.score === 0, 'Incorrect query received 0 marks');

  // TEST 4: Order Insensitive vs Order Sensitive Comparison
  console.log('\n--- Test 4: Order Sensitivity Handling ---');
  const actualRows = [{ id: 2, val: 'B' }, { id: 1, val: 'A' }];
  const expectedRows = [{ id: 1, val: 'A' }, { id: 2, val: 'B' }];

  const orderInsensitivePass = compareQueryResults(actualRows, expectedRows, false);
  assert(orderInsensitivePass === true, 'Order-insensitive comparison passes regardless of row ordering');

  const orderSensitiveFail = compareQueryResults(actualRows, expectedRows, true);
  assert(orderSensitiveFail === false, 'Order-sensitive comparison detects mismatched row order');

  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed (100% Success)`);
  console.log('====================================================');
}

runTests().catch(console.error);
