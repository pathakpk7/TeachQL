-- =========================================================================
-- TeachQL Seed Script: Initial Topics, Questions, and Demo Classroom Data
-- =========================================================================

-- Insert SQL Topics
INSERT INTO public.sql_topics (title, slug, description, order_index) VALUES
('SQL Fundamentals', 'sql-fundamentals', 'Introduction to relational databases, tables, and basic queries', 1),
('SELECT Statements', 'select-statements', 'Retrieving columns, expressions, aliases, and constant values', 2),
('WHERE Conditions', 'where-conditions', 'Filtering rows using comparison operators, AND, OR, NOT, IN, BETWEEN, LIKE', 3),
('ORDER BY & LIMIT', 'order-by-limit', 'Sorting result sets in ASC/DESC order and pagination', 4),
('Aggregate Functions', 'aggregate-functions', 'Computing summary statistics using COUNT, SUM, AVG, MIN, MAX', 5),
('GROUP BY & HAVING', 'group-by-having', 'Categorizing data into buckets and filtering groups', 6),
('Joins (INNER, LEFT, RIGHT, FULL)', 'joins', 'Combining records from two or more tables using keys', 7),
('Subqueries & Correlated Queries', 'subqueries', 'Nested queries in WHERE, SELECT, and FROM clauses', 8),
('Common Table Expressions (CTEs)', 'ctes', 'Readable and recursive queries using WITH clauses', 9),
('Window Functions', 'window-functions', 'Analytical queries using ROW_NUMBER, RANK, DENSE_RANK, OVER, PARTITION BY', 10),
('CASE Expressions', 'case-expressions', 'Conditional branching logic in queries', 11),
('String & Date Functions', 'string-date-functions', 'Manipulating textual strings, date parts, intervals, and formats', 12),
('NULL Handling', 'null-handling', 'COALESCE, NULLIF, and tri-valued boolean logic', 13),
('Set Operations (UNION, INTERSECT, EXCEPT)', 'set-operations', 'Combining query result sets', 14),
('Database Normalization & Constraints', 'normalization-constraints', '1NF, 2NF, 3NF, BCNF, Primary Keys, Foreign Keys, Integrity rules', 15)
ON CONFLICT (slug) DO NOTHING;
