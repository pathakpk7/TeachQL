import { UserProfile, Classroom, Question, Assessment, AssessmentAttempt, StudyMaterial, Announcement } from '@/types';

// Initial faculty user
export const DEMO_TEACHER: UserProfile = {
  id: 'usr-teach-001',
  email: 'prof.sharma@teachql.edu',
  full_name: 'Dr. Rajesh Sharma',
  role: 'teacher',
  department: 'Computer Science & Engineering',
  course: 'B.Tech',
  academic_year: 4,
  section: 'Faculty',
};

// Demo students
export const DEMO_STUDENT_A: UserProfile = {
  id: 'usr-stud-001',
  email: 'aravind.k@student.teachql.edu',
  full_name: 'Aravind Kumar',
  role: 'student',
  roll_number: '21CS101',
  department: 'Computer Science & Engineering',
  course: 'B.Tech CSE',
  academic_year: 3,
  semester: 5,
  section: 'A',
};

export const DEMO_STUDENT_B: UserProfile = {
  id: 'usr-stud-002',
  email: 'sneha.p@student.teachql.edu',
  full_name: 'Sneha Patel',
  role: 'student',
  roll_number: '21CS102',
  department: 'Computer Science & Engineering',
  course: 'B.Tech CSE',
  academic_year: 3,
  semester: 5,
  section: 'B',
};

export const ROSTER_STUDENTS: UserProfile[] = [
  DEMO_STUDENT_A,
  {
    id: 'usr-stud-003',
    email: 'pooja.s@student.teachql.edu',
    full_name: 'Pooja Sundaram',
    role: 'student',
    roll_number: '21CS108',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academic_year: 3,
    semester: 5,
    section: 'A',
  },
  {
    id: 'usr-stud-004',
    email: 'rohan.m@student.teachql.edu',
    full_name: 'Rohan Mehra',
    role: 'student',
    roll_number: '21CS115',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academic_year: 3,
    semester: 5,
    section: 'A',
  },
  {
    id: 'usr-stud-005',
    email: 'kavita.r@student.teachql.edu',
    full_name: 'Kavita Reddy',
    role: 'student',
    roll_number: '21CS120',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academic_year: 3,
    semester: 5,
    section: 'A',
  },
  {
    id: 'usr-stud-006',
    email: 'aditya.j@student.teachql.edu',
    full_name: 'Aditya Joshi',
    role: 'student',
    roll_number: '21CS124',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academic_year: 3,
    semester: 5,
    section: 'A',
  },
];

// Classrooms
export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'room-cse3-a',
    teacher_id: 'usr-teach-001',
    name: 'B.Tech CSE - 3rd Year - Section A',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academic_year: 3,
    semester: 5,
    section: 'A',
    academic_session: '2026-2027',
    description: 'Advanced Database Systems, Relational Algebra, Query Optimization, and Analytics.',
    invitation_code: 'TQL-CSE3-A7K9',
    join_policy: 'open_code',
    status: 'active',
    created_at: new Date('2026-08-01').toISOString(),
    student_count: 42,
    active_tests_count: 2,
    pending_eval_count: 5,
  },
  {
    id: 'room-cse3-b',
    teacher_id: 'usr-teach-001',
    name: 'B.Tech CSE - 3rd Year - Section B',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academic_year: 3,
    semester: 5,
    section: 'B',
    academic_session: '2026-2027',
    description: 'DBMS Laboratory and practical SQL query formulation.',
    invitation_code: 'TQL-CSE3-B4M2',
    join_policy: 'open_code',
    status: 'active',
    created_at: new Date('2026-08-01').toISOString(),
    student_count: 38,
    active_tests_count: 1,
    pending_eval_count: 0,
  },
  {
    id: 'room-bca2-a',
    teacher_id: 'usr-teach-001',
    name: 'BCA - 2nd Year - Section A',
    department: 'Information Technology',
    course: 'BCA',
    academic_year: 2,
    semester: 3,
    section: 'A',
    academic_session: '2026-2027',
    description: 'Foundations of Relational Databases & Structured Query Language.',
    invitation_code: 'TQL-BCA2-X9P1',
    join_policy: 'open_code',
    status: 'active',
    created_at: new Date('2026-08-10').toISOString(),
    student_count: 35,
    active_tests_count: 0,
    pending_eval_count: 0,
  },
];

// Seed Questions
export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-sql-001',
    created_by: 'usr-teach-001',
    title: 'Find the Second Highest Salary',
    problem_statement: 'Write a SQL query to find the second highest salary from the Employees table. If there is no second highest salary, return NULL (or an empty result). The column in output must be named `second_highest_salary`.',
    difficulty: 'medium',
    question_type: 'query_writing',
    marks: 10,
    estimated_minutes: 10,
    tags: ['Subqueries', 'Aggregate Functions'],
    schema_ddl: `
      CREATE TABLE Employees (
        employee_id INT PRIMARY KEY,
        name VARCHAR(50),
        department VARCHAR(50),
        salary INT
      );
    `,
    seed_data_sql: `
      INSERT INTO Employees (employee_id, name, department, salary) VALUES
      (1, 'Aman Verma', 'Engineering', 30000),
      (2, 'Priya Nair', 'Engineering', 45000),
      (3, 'Rahul Sharma', 'Management', 60000),
      (4, 'Neha Gupta', 'Marketing', 45000),
      (5, 'Vikram Rao', 'Management', 60000);
    `,
    expected_output_json: [
      { second_highest_salary: 45000 }
    ],
    order_sensitive: false,
    reference_query: `
      SELECT MAX(salary) AS second_highest_salary
      FROM Employees
      WHERE salary < (SELECT MAX(salary) FROM Employees);
    `,
    hints: [
      'Use the MAX aggregate function combined with a subquery in the WHERE clause.',
      'Check how to filter out the maximum salary so the next maximum is picked.'
    ],
    explanation: 'Filtering where salary < (SELECT MAX(salary) FROM Employees) discards the top tier (60,000), leaving 45,000 as the new maximum.',
    attachments: [
      {
        id: 'att-seed-001',
        name: 'Employee_Department_ER_Diagram.svg',
        size: 14200,
        type: 'image/svg+xml',
        category: 'image',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 400 180"><rect width="400" height="180" fill="%23f8fafc" rx="12" stroke="%23cbd5e1" stroke-width="2"/><text x="20" y="32" font-family="sans-serif" font-size="13" font-weight="bold" fill="%230f172a">RELATIONAL SCHEMA: Employees</text><line x1="20" y1="42" x2="380" y2="42" stroke="%23cbd5e1" stroke-width="1.5"/><text x="25" y="65" font-family="monospace" font-size="11" font-weight="bold" fill="%234338ca">🔑 employee_id : INT [PRIMARY KEY]</text><text x="25" y="90" font-family="monospace" font-size="11" fill="%23334155">   name        : VARCHAR(50)</text><text x="25" y="115" font-family="monospace" font-size="11" fill="%23334155">   department  : VARCHAR(50)</text><text x="25" y="140" font-family="monospace" font-size="11" font-weight="bold" fill="%2316a34a">   salary      : INT</text><rect x="250" y="60" width="125" height="90" fill="%23e0e7ff" rx="6"/><text x="260" y="80" font-family="sans-serif" font-size="11" font-weight="bold" fill="%233730a3">ER Note:</text><text x="260" y="100" font-family="sans-serif" font-size="10" fill="%233730a3">Nested subquery</text><text x="260" y="118" font-family="sans-serif" font-size="10" fill="%233730a3">filters top max</text><text x="260" y="136" font-family="sans-serif" font-size="10" fill="%233730a3">to yield 2nd tier</text></svg>',
        uploaded_at: new Date('2026-08-01').toISOString(),
      },
      {
        id: 'att-seed-002',
        name: 'DBMS_Subqueries_Problem_Sheet.pdf',
        size: 154000,
        type: 'application/pdf',
        category: 'pdf',
        uploaded_at: new Date('2026-08-01').toISOString(),
      }
    ],
  },
  {
    id: 'q-sql-002',
    created_by: 'usr-teach-001',
    title: 'Department Highest Spender',
    problem_statement: 'Write a query to find the department name and total salary spent on each department that spends more than 50,000 in total salaries. Output columns: `department`, `total_spent`. Sort by `total_spent` DESC.',
    difficulty: 'easy',
    question_type: 'query_writing',
    marks: 10,
    estimated_minutes: 8,
    tags: ['GROUP BY', 'HAVING', 'Aggregate Functions'],
    schema_ddl: `
      CREATE TABLE Employees (
        employee_id INT PRIMARY KEY,
        name VARCHAR(50),
        department VARCHAR(50),
        salary INT
      );
    `,
    seed_data_sql: `
      INSERT INTO Employees (employee_id, name, department, salary) VALUES
      (1, 'Aman Verma', 'Engineering', 30000),
      (2, 'Priya Nair', 'Engineering', 45000),
      (3, 'Rahul Sharma', 'Management', 60000),
      (4, 'Neha Gupta', 'Marketing', 45000),
      (5, 'Vikram Rao', 'Management', 60000);
    `,
    expected_output_json: [
      { department: 'Management', total_spent: 120000 },
      { department: 'Engineering', total_spent: 75000 }
    ],
    order_sensitive: true,
    reference_query: `
      SELECT department, SUM(salary) AS total_spent
      FROM Employees
      GROUP BY department
      HAVING SUM(salary) > 50000
      ORDER BY total_spent DESC;
    `,
    hints: ['Remember that HAVING filters groups after GROUP BY, whereas WHERE filters individual rows.'],
  },
  {
    id: 'q-sql-003',
    created_by: 'usr-teach-001',
    title: 'Customer Orders without Shipment',
    problem_statement: 'Identify all customer names who placed at least one order where status is "Pending". Return `customer_name` alphabetically without duplicates.',
    difficulty: 'easy',
    question_type: 'query_writing',
    marks: 10,
    estimated_minutes: 10,
    tags: ['Joins', 'DISTINCT'],
    schema_ddl: `
      CREATE TABLE Customers (
        customer_id INT PRIMARY KEY,
        customer_name VARCHAR(50)
      );
      CREATE TABLE Orders (
        order_id INT PRIMARY KEY,
        customer_id INT,
        status VARCHAR(20)
      );
    `,
    seed_data_sql: `
      INSERT INTO Customers (customer_id, customer_name) VALUES
      (1, 'Alice Smith'),
      (2, 'Bob Jones'),
      (3, 'Charlie Brown');

      INSERT INTO Orders (order_id, customer_id, status) VALUES
      (101, 1, 'Completed'),
      (102, 2, 'Pending'),
      (103, 3, 'Pending'),
      (104, 2, 'Shipped');
    `,
    expected_output_json: [
      { customer_name: 'Bob Jones' },
      { customer_name: 'Charlie Brown' }
    ],
    order_sensitive: true,
    reference_query: `
      SELECT DISTINCT c.customer_name
      FROM Customers c
      JOIN Orders o ON c.customer_id = o.customer_id
      WHERE o.status = 'Pending'
      ORDER BY c.customer_name ASC;
    `,
    hints: ['Use an INNER JOIN between Customers and Orders, then apply DISTINCT and ORDER BY.'],
  },
  {
    id: 'q-sql-004',
    created_by: 'usr-teach-001',
    title: 'Difference between WHERE and HAVING clause',
    problem_statement: 'Explain the fundamental difference between the WHERE clause and the HAVING clause in SQL. Detail when each is executed in query logical processing order and give an example.',
    difficulty: 'easy',
    question_type: 'theory',
    marks: 5,
    estimated_minutes: 5,
    tags: ['Database Theory', 'SQL Fundamentals'],
    schema_ddl: '',
    seed_data_sql: '',
    expected_output_json: [],
    order_sensitive: false,
    reference_query: 'WHERE filters rows before aggregation; HAVING filters aggregated groups created by GROUP BY.',
  }
];

// Seed Assessments
export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'test-cse3a-01',
    classroom_id: 'room-cse3-a',
    created_by: 'usr-teach-001',
    title: 'Mid-Term SQL Assessment: Subqueries & Joins',
    description: 'Comprehensive test covering aggregate queries, multi-table joins, subqueries, and grouping.',
    instructions: '1. Time allowed is 45 minutes.\n2. Write syntactically valid queries.\n3. Make sure column names in output match instructions.',
    assessment_type: 'timed_exam',
    start_time: new Date('2026-10-15T09:00:00Z').toISOString(),
    end_time: new Date('2026-10-30T18:00:00Z').toISOString(),
    duration_minutes: 45,
    total_marks: 25,
    passing_marks: 12,
    status: 'published',
    settings: {
      randomize_questions: false,
      allow_late: false,
      immediate_feedback: false,
      release_solutions: false,
      max_attempts: 1,
    },
    created_at: new Date('2026-10-14').toISOString(),
  },
  {
    id: 'test-cse3a-02',
    classroom_id: 'room-cse3-a',
    created_by: 'usr-teach-001',
    title: 'Weekly Practice Set: Group By & Having',
    description: 'Practice exercise for mastering group calculations and filtering conditions.',
    instructions: 'Unlimited practice attempts. You can see execution results and feedback immediately.',
    assessment_type: 'practice',
    start_time: new Date('2026-10-10T00:00:00Z').toISOString(),
    end_time: new Date('2026-11-10T23:59:59Z').toISOString(),
    duration_minutes: 60,
    total_marks: 10,
    passing_marks: 5,
    status: 'published',
    settings: {
      randomize_questions: false,
      allow_late: true,
      immediate_feedback: true,
      release_solutions: true,
      max_attempts: 10,
    },
    created_at: new Date('2026-10-09').toISOString(),
  },
  {
    id: 'test-cse3b-01',
    classroom_id: 'room-cse3-b',
    created_by: 'usr-teach-001',
    title: 'Section B: Introductory SQL Quiz',
    description: 'Basic SQL SELECT and WHERE condition evaluation.',
    instructions: 'Solve within 30 minutes.',
    assessment_type: 'topic_test',
    start_time: new Date('2026-10-16T10:00:00Z').toISOString(),
    end_time: new Date('2026-10-25T17:00:00Z').toISOString(),
    duration_minutes: 30,
    total_marks: 20,
    status: 'published',
    settings: {
      randomize_questions: false,
      allow_late: false,
      immediate_feedback: false,
      release_solutions: false,
      max_attempts: 1,
    },
    created_at: new Date('2026-10-15').toISOString(),
  }
];

export const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-001',
    classroom_id: 'room-cse3-a',
    title: 'Comprehensive SQL Cheat Sheet & Query Order',
    description: 'Detailed PDF reference covering SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY logical processing sequence.',
    resource_type: 'pdf',
    external_url: 'https://en.wikipedia.org/wiki/SQL',
    is_published: true,
    created_at: new Date('2026-09-01').toISOString(),
  },
  {
    id: 'mat-002',
    classroom_id: 'room-cse3-a',
    title: 'Sample E-Commerce Dataset Schema (.sql)',
    description: 'Schema and seed data for practicing complex analytical queries and window functions locally.',
    resource_type: 'sql',
    content: `
      -- E-Commerce practice schema
      CREATE TABLE products (id INT, name TEXT, price NUMERIC);
      CREATE TABLE orders (id INT, product_id INT, quantity INT);
    `,
    is_published: true,
    created_at: new Date('2026-09-15').toISOString(),
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    classroom_id: 'room-cse3-a',
    title: 'Mid-Term Assessment is now live!',
    content: 'The Mid-Term SQL Assessment covering Subqueries and Joins has been published. Please ensure you have a stable connection and complete it before the deadline.',
    is_pinned: true,
    created_at: new Date('2026-10-16').toISOString(),
  },
  {
    id: 'ann-002',
    classroom_id: 'room-cse3-a',
    title: 'Lab Session on Window Functions this Friday',
    content: 'We will be covering ROW_NUMBER(), RANK(), DENSE_RANK(), and PARTITION BY clauses. Review the practice materials before joining.',
    is_pinned: false,
    created_at: new Date('2026-10-12').toISOString(),
  }
];
