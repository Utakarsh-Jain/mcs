export const ROOMS = [
  {
    id: 1,
    badge: "Room 01 - Authentication Breach",
    title: "Weak Credentials Detected",
    context:
      "The MySQL server at db-prod-01 is using insecure credentials. The attacker is actively brute-forcing the root account.",
    terminal: [
      { type: "prompt", text: "mysql -u root -p" },
      { type: "output", text: "Enter password: ______" },
      { type: "error", text: "[WARN] Root account has weak password." },
      { type: "output", text: "Attacker attempts: 1,482 / brute force ongoing..." }
    ],
    questions: [
      {
        text: "The MySQL root password is password123. Which replacement is the most secure?",
        options: [
          { text: "admin2024", correct: false },
          { text: "Tr0ub4dor&3#kL9!", correct: true },
          { text: "mysqlroot", correct: false },
          { text: "P@ssword1", correct: false }
        ],
        correctFeedback:
          "Strong passwords combine length with mixed character types. This option is much harder to brute-force and avoids common patterns.",
        wrongFeedback:
          "That option is still predictable. The safer choice is long, random-looking, and uses mixed character classes."
      },
      {
        text: "Which MySQL approach follows least privilege instead of giving the application root access?",
        options: [
          { text: "Use root because it avoids permission issues", correct: false },
          { text: "Create an app user with only SELECT on the required database", correct: true },
          { text: "Share one admin user across all services", correct: false },
          { text: "Grant ALL PRIVILEGES to every team member", correct: false }
        ],
        correctFeedback:
          "Least privilege reduces blast radius. A dedicated user with only the permissions it needs is the safer design.",
        wrongFeedback:
          "Broad access makes any compromise much worse. Limit each service account to exactly what it needs."
      }
    ],
    hints: [
      "Think about resisting brute-force attacks, not just making the password look familiar with symbols.",
      "The answer should reduce privileges, not make administration convenient."
    ]
  },
  {
    id: 2,
    badge: "Room 02 - Injection Attack",
    title: "SQL Injection in Progress",
    context:
      "The login endpoint is concatenating user input into SQL queries. Suspicious payloads are already reaching PostgreSQL.",
    terminal: [
      { type: "error", text: "[ALERT] Payload detected: ' OR '1'='1" },
      { type: "sys", text: "Auth service is building SQL with string concatenation" },
      { type: "prompt", text: "Inspecting request logs..." }
    ],
    questions: [
      {
        text: "What is the most reliable way to stop SQL injection in the login query?",
        options: [
          { text: "Remove quotes from the user input with string replace", correct: false },
          { text: "Use parameterized queries / prepared statements", correct: true },
          { text: "Convert all input to uppercase first", correct: false },
          { text: "Limit the username field to 20 characters", correct: false }
        ],
        correctFeedback:
          "Prepared statements keep data separate from SQL syntax, so attacker input is treated as data instead of executable query logic.",
        wrongFeedback:
          "String cleanup and length checks are not enough. The durable fix is to stop mixing raw input into query text."
      },
      {
        text: "Which PostgreSQL security feature helps you audit suspicious query activity in detail?",
        options: [
          { text: "VACUUM ANALYZE", correct: false },
          { text: "pgaudit", correct: true },
          { text: "ALTER TABLE", correct: false },
          { text: "pg_dump", correct: false }
        ],
        correctFeedback:
          "pgaudit records detailed database activity so you can trace who ran what and when.",
        wrongFeedback:
          "Those tools matter for maintenance or schema work, but not for full security auditing."
      }
    ],
    hints: [
      "The safest pattern changes how queries are built, not how strings are cleaned afterward.",
      "Look for the PostgreSQL feature specifically built for audit logging."
    ]
  },
  {
    id: 3,
    badge: "Room 03 - Database Selection",
    title: "Choose the Right Engine",
    context:
      "Two systems need secure database choices right now: one for financial records and one for fast transient session data.",
    terminal: [
      { type: "sys", text: "System A: financial ledger, strict ACID, heavy reporting" },
      { type: "sys", text: "System B: session cache, simple key-value lookups" },
      { type: "prompt", text: "Awaiting architecture decision..." }
    ],
    questions: [
      {
        text: "Which choice fits a financial system that needs strict ACID guarantees and advanced relational queries?",
        options: [
          { text: "MySQL only because it is popular", correct: false },
          { text: "PostgreSQL for advanced SQL and strong transactional behavior", correct: true },
          { text: "MongoDB for flexible schemas", correct: false },
          { text: "SQLite for lightweight embedded storage", correct: false }
        ],
        correctFeedback:
          "PostgreSQL is a strong fit for complex relational workloads, advanced queries, and transaction-heavy systems.",
        wrongFeedback:
          "Popularity or flexibility alone is not enough here. The workload needs strong transactional and analytical capabilities."
      },
      {
        text: "Which statement about MVCC is correct?",
        options: [
          { text: "Only MySQL supports MVCC", correct: false },
          { text: "Both MySQL and PostgreSQL support MVCC with different internal implementations", correct: true },
          { text: "Neither MySQL nor PostgreSQL supports MVCC", correct: false },
          { text: "PostgreSQL needs table locks for every concurrent write", correct: false }
        ],
        correctFeedback:
          "Both engines support MVCC, but they store version history differently under the hood.",
        wrongFeedback:
          "This is a subtle architecture question. Both systems support MVCC; the difference is in the implementation details."
      }
    ],
    hints: [
      "Think about the database you would trust with money movement and complex reporting.",
      "The right answer is not whether MVCC exists, but how both systems implement it."
    ]
  },
  {
    id: 4,
    badge: "Room 04 - Cloud SQL Misconfiguration",
    title: "Cloud SQL Instance Exposed",
    context:
      "A Google Cloud SQL instance is reachable from the public internet with loose network rules and weak connection security.",
    terminal: [
      { type: "error", text: "[ALERT] Public IP enabled" },
      { type: "error", text: "[ALERT] Authorized networks: 0.0.0.0/0" },
      { type: "error", text: "[ALERT] SSL enforcement disabled" },
      { type: "prompt", text: "Remediate configuration now..." }
    ],
    questions: [
      {
        text: "Authorized networks is set to 0.0.0.0/0. What is the best fix?",
        options: [
          { text: "Keep it public but use a stronger password", correct: false },
          { text: "Remove public exposure and connect through Private IP or Cloud SQL Auth Proxy", correct: true },
          { text: "Replace it with 255.255.255.0", correct: false },
          { text: "Use Cloud Armor on the database port", correct: false }
        ],
        correctFeedback:
          "The strongest fix is to stop exposing the database publicly. Private connectivity sharply reduces attack surface.",
        wrongFeedback:
          "Network exposure is the core problem here. Password changes alone do not fix an internet-facing database."
      },
      {
        text: "Which Cloud SQL setup is the most secure overall?",
        options: [
          { text: "Public IP plus username/password plus backups", correct: false },
          { text: "Private IP plus TLS plus IAM auth plus backups plus deletion protection", correct: true },
          { text: "Public IP plus TLS plus office IP allowlist", correct: false },
          { text: "Private IP plus shared root credentials", correct: false }
        ],
        correctFeedback:
          "That answer layers network isolation, encrypted transport, stronger identity, recoverability, and operational safety.",
        wrongFeedback:
          "The strongest option uses multiple defensive layers together, not a single control."
      }
    ],
    hints: [
      "The best answer removes internet reachability instead of trying to harden an exposed path.",
      "Pick the option that combines several defensive controls, not only one."
    ]
  },
  {
    id: 5,
    badge: "Room 05 - Final Vault",
    title: "Seal the Database",
    context:
      "The attacker is close to full compromise. Final controls must protect backups and preserve a complete investigation trail.",
    terminal: [
      { type: "error", text: "[CRITICAL] Hacker progress at 90 percent" },
      { type: "prompt", text: "Emergency lockdown protocol engaged..." },
      { type: "sys", text: "Final security checks loading..." }
    ],
    questions: [
      {
        text: "Which feature protects backup data at rest so stolen backups cannot be read?",
        options: [
          { text: "Customer-managed encryption keys with Cloud KMS", correct: true },
          { text: "Read replicas in another region", correct: false },
          { text: "Point-in-time recovery", correct: false },
          { text: "Longer retention periods", correct: false }
        ],
        correctFeedback:
          "Encryption at rest with customer-managed keys protects the contents of backups even if the raw files are exposed.",
        wrongFeedback:
          "Recovery and replication improve resilience, but they do not encrypt stolen backup data."
      },
      {
        text: "Which feature gives the best forensic trail of every database access event in Cloud SQL?",
        options: [
          { text: "Cloud SQL Insights", correct: false },
          { text: "Cloud Audit Logs data access logging", correct: true },
          { text: "CPU dashboards", correct: false },
          { text: "slow_query_log only", correct: false }
        ],
        correctFeedback:
          "Audit logs are what you need for a trustworthy security trail of who accessed what and when.",
        wrongFeedback:
          "Performance tools help operations, but incident investigation needs detailed audit logging."
      }
    ],
    hints: [
      "The right control makes stolen data unreadable without the key.",
      "Think about security investigation rather than performance monitoring."
    ]
  }
];

export const GAME_CONFIG = {
  totalTimeSeconds: 300,
  hintPenaltySeconds: 20,
  wrongAnswerHackerPenalty: 15,
  scorePerCorrect: 100
};
