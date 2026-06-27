export type GlossaryCategory =
  | "fundamentals"
  | "test-design"
  | "test-management"
  | "test-tools-automation"
  | "performance-testing"
  | "security-testing"
  | "agile-testing";

export interface GlossaryTerm {
  id: string;
  term: string;
  abbreviation: string | null;
  definition: string;
  category: GlossaryCategory;
  relatedTerms: string[];
  seeAlso: string[];
}

export interface GlossaryCategoryInfo {
  id: GlossaryCategory;
  label: string;
  badgeClasses: string;
  activeClasses: string;
}

export const CATEGORIES: GlossaryCategoryInfo[] = [
  {
    id: "fundamentals",
    label: "Fundamentals",
    badgeClasses: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    activeClasses: "bg-blue-600 text-white",
  },
  {
    id: "test-design",
    label: "Test Design",
    badgeClasses: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    activeClasses: "bg-purple-600 text-white",
  },
  {
    id: "test-management",
    label: "Test Management",
    badgeClasses: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    activeClasses: "bg-emerald-600 text-white",
  },
  {
    id: "test-tools-automation",
    label: "Test Tools & Automation",
    badgeClasses: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    activeClasses: "bg-amber-600 text-white",
  },
  {
    id: "performance-testing",
    label: "Performance Testing",
    badgeClasses: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    activeClasses: "bg-rose-600 text-white",
  },
  {
    id: "security-testing",
    label: "Security Testing",
    badgeClasses: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    activeClasses: "bg-red-600 text-white",
  },
  {
    id: "agile-testing",
    label: "Agile Testing",
    badgeClasses: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    activeClasses: "bg-teal-600 text-white",
  },
];

export function getCategoryInfo(id: GlossaryCategory): GlossaryCategoryInfo {
  return CATEGORIES.find((c) => c.id === id)!;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ── Fundamentals ──
  {
    id: "testing",
    term: "Testing",
    abbreviation: null,
    definition:
      "The process consisting of all lifecycle activities, both static and dynamic, concerned with planning, preparation and evaluation of a component or system and related work products to determine that they satisfy specified requirements, to demonstrate that they are fit for purpose and to detect defects.",
    category: "fundamentals",
    relatedTerms: ["quality", "verification", "validation"],
    seeAlso: ["static-testing", "dynamic-testing"],
  },
  {
    id: "quality",
    term: "Quality",
    abbreviation: null,
    definition:
      "The degree to which a component or system satisfies the stated and implied needs of its various stakeholders.",
    category: "fundamentals",
    relatedTerms: ["quality-assurance", "quality-control"],
    seeAlso: ["testing"],
  },
  {
    id: "quality-assurance",
    term: "Quality Assurance",
    abbreviation: "QA",
    definition:
      "Part of quality management focused on providing confidence that quality requirements will be fulfilled. Quality assurance addresses the processes and standards used to create work products.",
    category: "fundamentals",
    relatedTerms: ["quality", "quality-control"],
    seeAlso: ["testing", "verification"],
  },
  {
    id: "quality-control",
    term: "Quality Control",
    abbreviation: "QC",
    definition:
      "Part of quality management focused on fulfilling quality requirements. Quality control includes the testing activities that verify that the software meets its requirements.",
    category: "fundamentals",
    relatedTerms: ["quality", "quality-assurance"],
    seeAlso: ["testing"],
  },
  {
    id: "verification",
    term: "Verification",
    abbreviation: null,
    definition:
      "Confirmation by examination and through provision of objective evidence that specified requirements have been fulfilled. Verification answers the question: are we building the product right?",
    category: "fundamentals",
    relatedTerms: ["validation", "testing"],
    seeAlso: ["static-testing", "review"],
  },
  {
    id: "validation",
    term: "Validation",
    abbreviation: null,
    definition:
      "Confirmation by examination and through provision of objective evidence that the requirements for a specific intended use or application have been fulfilled. Validation answers the question: are we building the right product?",
    category: "fundamentals",
    relatedTerms: ["verification", "acceptance-testing"],
    seeAlso: ["user-acceptance-testing"],
  },
  {
    id: "defect",
    term: "Defect",
    abbreviation: null,
    definition:
      "An imperfection or deficiency in a work product where it does not meet its requirements or specifications. A defect may also be referred to as a bug or fault.",
    category: "fundamentals",
    relatedTerms: ["error", "failure", "bug"],
    seeAlso: ["root-cause-analysis", "defect-management"],
  },
  {
    id: "error",
    term: "Error",
    abbreviation: null,
    definition:
      "A human action that produces an incorrect result. An error can lead to the introduction of a defect in code or a document.",
    category: "fundamentals",
    relatedTerms: ["defect", "failure"],
    seeAlso: ["root-cause-analysis"],
  },
  {
    id: "failure",
    term: "Failure",
    abbreviation: null,
    definition:
      "An event in which a component or system does not perform a required function within specified limits. A failure is caused by a defect.",
    category: "fundamentals",
    relatedTerms: ["defect", "error"],
    seeAlso: ["incident"],
  },
  {
    id: "bug",
    term: "Bug",
    abbreviation: null,
    definition:
      "A synonym for defect. An imperfection in a component or system that can cause the component or system to fail to perform its required function.",
    category: "fundamentals",
    relatedTerms: ["defect", "error", "failure"],
    seeAlso: ["defect-management"],
  },
  {
    id: "root-cause-analysis",
    term: "Root Cause Analysis",
    abbreviation: "RCA",
    definition:
      "An analysis technique aimed at identifying the root causes of defects. By addressing the root causes, the occurrence of similar defects can be minimized or prevented.",
    category: "fundamentals",
    relatedTerms: ["defect", "error"],
    seeAlso: ["defect-management"],
  },
  {
    id: "static-testing",
    term: "Static Testing",
    abbreviation: null,
    definition:
      "Testing of a work product without executing the software. Static testing includes reviews, walkthroughs, and static analysis.",
    category: "fundamentals",
    relatedTerms: ["dynamic-testing", "review"],
    seeAlso: ["static-analysis", "verification"],
  },
  {
    id: "dynamic-testing",
    term: "Dynamic Testing",
    abbreviation: null,
    definition:
      "Testing that involves the execution of the test item. Dynamic testing uses test cases to exercise the software and compare actual results with expected results.",
    category: "fundamentals",
    relatedTerms: ["static-testing", "test-case"],
    seeAlso: ["test-execution"],
  },
  {
    id: "review",
    term: "Review",
    abbreviation: null,
    definition:
      "A type of static testing during which a work product or process is evaluated by one or more individuals to detect defects or to provide improvements.",
    category: "fundamentals",
    relatedTerms: ["static-testing", "inspection"],
    seeAlso: ["walkthrough", "verification"],
  },
  {
    id: "inspection",
    term: "Inspection",
    abbreviation: null,
    definition:
      "A type of formal review that follows a defined process with formally documented output, using roles such as moderator, author, and inspector to find defects.",
    category: "fundamentals",
    relatedTerms: ["review", "static-testing"],
    seeAlso: ["walkthrough"],
  },
  {
    id: "walkthrough",
    term: "Walkthrough",
    abbreviation: null,
    definition:
      "A type of review in which an author leads members of the review through a work product and the members ask questions and make comments about possible issues.",
    category: "fundamentals",
    relatedTerms: ["review", "inspection"],
    seeAlso: ["static-testing"],
  },
  {
    id: "static-analysis",
    term: "Static Analysis",
    abbreviation: null,
    definition:
      "The process of evaluating a component or system without executing it, based on its form, structure, content, or documentation. Static analysis can detect coding standards violations and potential defects.",
    category: "fundamentals",
    relatedTerms: ["static-testing"],
    seeAlso: ["dynamic-testing"],
  },

  // ── Test Levels ──
  {
    id: "unit-testing",
    term: "Unit Testing",
    abbreviation: null,
    definition:
      "The testing of individual software components in isolation. Unit testing is typically performed by the developer and focuses on verifying the correctness of individual units of source code.",
    category: "fundamentals",
    relatedTerms: ["integration-testing", "component-testing"],
    seeAlso: ["test-driven-development"],
  },
  {
    id: "component-testing",
    term: "Component Testing",
    abbreviation: null,
    definition:
      "The testing of individual hardware or software components. Component testing is often done in isolation from the rest of the system, using stubs and drivers as needed.",
    category: "fundamentals",
    relatedTerms: ["unit-testing", "integration-testing"],
    seeAlso: [],
  },
  {
    id: "integration-testing",
    term: "Integration Testing",
    abbreviation: null,
    definition:
      "Testing performed to expose defects in the interfaces and interactions between integrated components or systems. Integration testing verifies that combined parts work together correctly.",
    category: "fundamentals",
    relatedTerms: ["unit-testing", "system-testing"],
    seeAlso: ["api-testing"],
  },
  {
    id: "system-testing",
    term: "System Testing",
    abbreviation: null,
    definition:
      "The process of testing an integrated system to verify that it meets specified requirements. System testing is performed on a complete, integrated system to evaluate compliance with its specified requirements.",
    category: "fundamentals",
    relatedTerms: ["integration-testing", "acceptance-testing"],
    seeAlso: ["end-to-end-testing"],
  },
  {
    id: "acceptance-testing",
    term: "Acceptance Testing",
    abbreviation: null,
    definition:
      "Formal testing with respect to user needs, requirements, and business processes, conducted to determine whether a system satisfies the acceptance criteria and to enable the user, customer, or other authorized entity to determine whether to accept the system.",
    category: "fundamentals",
    relatedTerms: ["system-testing", "user-acceptance-testing"],
    seeAlso: ["validation"],
  },
  {
    id: "user-acceptance-testing",
    term: "User Acceptance Testing",
    abbreviation: "UAT",
    definition:
      "Acceptance testing performed by intended users in a production-like environment to determine if the system meets their needs and expectations. UAT is the final phase of testing before deployment.",
    category: "fundamentals",
    relatedTerms: ["acceptance-testing", "validation"],
    seeAlso: ["alpha-testing", "beta-testing"],
  },
  {
    id: "alpha-testing",
    term: "Alpha Testing",
    abbreviation: null,
    definition:
      "Simulated or actual operational testing by potential users/customers or an independent test team at the developer's site. Alpha testing is performed before the software is released to external users.",
    category: "fundamentals",
    relatedTerms: ["beta-testing", "user-acceptance-testing"],
    seeAlso: ["acceptance-testing"],
  },
  {
    id: "beta-testing",
    term: "Beta Testing",
    abbreviation: null,
    definition:
      "Operational testing by potential and/or existing users/customers at an external site not otherwise involved with the developers, to determine whether a component or system satisfies the user/customer needs.",
    category: "fundamentals",
    relatedTerms: ["alpha-testing", "user-acceptance-testing"],
    seeAlso: ["acceptance-testing"],
  },

  // ── Test Types ──
  {
    id: "functional-testing",
    term: "Functional Testing",
    abbreviation: null,
    definition:
      "Testing based on the analysis of the specification of the functionality of a component or system. Functional testing evaluates what the system does.",
    category: "test-design",
    relatedTerms: ["non-functional-testing", "black-box-testing"],
    seeAlso: ["system-testing"],
  },
  {
    id: "non-functional-testing",
    term: "Non-functional Testing",
    abbreviation: null,
    definition:
      "Testing the attributes of a component or system that do not relate to functionality, e.g., reliability, efficiency, usability, maintainability and portability.",
    category: "test-design",
    relatedTerms: ["functional-testing", "performance-testing-type"],
    seeAlso: ["usability-testing", "load-testing"],
  },
  {
    id: "regression-testing",
    term: "Regression Testing",
    abbreviation: null,
    definition:
      "Testing of a previously tested program following modification to ensure that defects have not been introduced or uncovered as a result of changes made. Regression testing is performed when the software or its environment is changed.",
    category: "test-design",
    relatedTerms: ["confirmation-testing", "impact-analysis"],
    seeAlso: ["test-automation", "continuous-integration"],
  },
  {
    id: "confirmation-testing",
    term: "Confirmation Testing",
    abbreviation: null,
    definition:
      "Testing that runs test cases that failed the last time they were run, in order to verify the success of corrective actions. Also known as re-testing.",
    category: "test-design",
    relatedTerms: ["regression-testing", "defect"],
    seeAlso: [],
  },
  {
    id: "smoke-testing",
    term: "Smoke Testing",
    abbreviation: null,
    definition:
      "A subset of all defined/planned test cases that cover the main functionality of a component or system, to ascertain that the most crucial functions of a program work but not bothering with finer details. Also known as build verification testing.",
    category: "test-design",
    relatedTerms: ["sanity-testing", "regression-testing"],
    seeAlso: ["continuous-integration"],
  },
  {
    id: "sanity-testing",
    term: "Sanity Testing",
    abbreviation: null,
    definition:
      "A narrow regression test focused on one or a few areas of functionality. Sanity testing determines that a specific function works as expected after a minor change or bug fix.",
    category: "test-design",
    relatedTerms: ["smoke-testing", "regression-testing"],
    seeAlso: [],
  },
  {
    id: "exploratory-testing",
    term: "Exploratory Testing",
    abbreviation: null,
    definition:
      "An approach to testing whereby the testers dynamically design and execute tests based on their knowledge, exploration of the test item, and the results of previous tests. Exploratory testing simultaneously involves test design, test execution, and learning.",
    category: "test-design",
    relatedTerms: ["session-based-test-management"],
    seeAlso: ["agile-testing-type"],
  },
  {
    id: "end-to-end-testing",
    term: "End-to-End Testing",
    abbreviation: "E2E",
    definition:
      "Testing a complete application flow from start to finish, simulating real user scenarios. End-to-end testing verifies the system and its components work together in a production-like environment.",
    category: "test-design",
    relatedTerms: ["system-testing", "integration-testing"],
    seeAlso: ["user-acceptance-testing"],
  },
  {
    id: "usability-testing",
    term: "Usability Testing",
    abbreviation: null,
    definition:
      "Testing to determine the extent to which the software product is understood, easy to learn, easy to operate and attractive to the users under specified conditions.",
    category: "test-design",
    relatedTerms: ["non-functional-testing", "accessibility-testing"],
    seeAlso: ["user-acceptance-testing"],
  },
  {
    id: "accessibility-testing",
    term: "Accessibility Testing",
    abbreviation: null,
    definition:
      "Testing that determines the ease by which users with disabilities can use the system. Accessibility testing is based on guidelines such as WCAG (Web Content Accessibility Guidelines).",
    category: "test-design",
    relatedTerms: ["usability-testing", "non-functional-testing"],
    seeAlso: [],
  },

  // ── Test Design Techniques ──
  {
    id: "black-box-testing",
    term: "Black-box Testing",
    abbreviation: null,
    definition:
      "Testing, either functional or non-functional, without reference to the internal structure of the component or system. Black-box testing is based on the analysis of the specification of a component or system.",
    category: "test-design",
    relatedTerms: ["white-box-testing", "equivalence-partitioning", "boundary-value-analysis"],
    seeAlso: ["functional-testing"],
  },
  {
    id: "white-box-testing",
    term: "White-box Testing",
    abbreviation: null,
    definition:
      "Testing based on an analysis of the internal structure of the component or system. White-box testing uses knowledge of the code to design test cases that exercise specific paths, branches, or statements.",
    category: "test-design",
    relatedTerms: ["black-box-testing", "code-coverage", "statement-coverage", "branch-coverage"],
    seeAlso: ["structural-testing"],
  },
  {
    id: "equivalence-partitioning",
    term: "Equivalence Partitioning",
    abbreviation: "EP",
    definition:
      "A black-box test design technique in which test cases are designed to execute representatives from equivalence partitions. Each partition consists of a set of values that are expected to be treated the same way by the component or system.",
    category: "test-design",
    relatedTerms: ["boundary-value-analysis", "black-box-testing"],
    seeAlso: ["decision-table-testing"],
  },
  {
    id: "boundary-value-analysis",
    term: "Boundary Value Analysis",
    abbreviation: "BVA",
    definition:
      "A black-box test design technique in which test cases are designed based on boundary values. Boundary values are the minimum and maximum values at the edges of an equivalence partition.",
    category: "test-design",
    relatedTerms: ["equivalence-partitioning", "black-box-testing"],
    seeAlso: [],
  },
  {
    id: "decision-table-testing",
    term: "Decision Table Testing",
    abbreviation: null,
    definition:
      "A black-box test design technique in which test cases are designed to exercise the combinations of conditions and resulting actions shown in a decision table.",
    category: "test-design",
    relatedTerms: ["black-box-testing", "equivalence-partitioning"],
    seeAlso: ["state-transition-testing"],
  },
  {
    id: "state-transition-testing",
    term: "State Transition Testing",
    abbreviation: null,
    definition:
      "A black-box test design technique in which test cases are designed to exercise valid and invalid state transitions. States, transitions, events, and actions are modeled in a state diagram.",
    category: "test-design",
    relatedTerms: ["black-box-testing", "decision-table-testing"],
    seeAlso: [],
  },
  {
    id: "statement-coverage",
    term: "Statement Coverage",
    abbreviation: null,
    definition:
      "The percentage of executable statements in the source code that have been exercised by a test suite. 100% statement coverage means every line of code has been executed at least once.",
    category: "test-design",
    relatedTerms: ["branch-coverage", "code-coverage", "white-box-testing"],
    seeAlso: [],
  },
  {
    id: "branch-coverage",
    term: "Branch Coverage",
    abbreviation: null,
    definition:
      "The percentage of branches of the control flow that have been exercised by a test suite. A branch is an outcome of a decision point (e.g., if/else, switch). Also known as decision coverage.",
    category: "test-design",
    relatedTerms: ["statement-coverage", "code-coverage", "white-box-testing"],
    seeAlso: [],
  },
  {
    id: "code-coverage",
    term: "Code Coverage",
    abbreviation: null,
    definition:
      "An analysis method that determines which parts of the software have been executed by a test suite and which parts have not. Code coverage is a measure of test thoroughness.",
    category: "test-design",
    relatedTerms: ["statement-coverage", "branch-coverage", "white-box-testing"],
    seeAlso: [],
  },
  {
    id: "structural-testing",
    term: "Structural Testing",
    abbreviation: null,
    definition:
      "Testing based on an analysis of the internal structure of the component or system. A synonym for white-box testing.",
    category: "test-design",
    relatedTerms: ["white-box-testing", "code-coverage"],
    seeAlso: ["black-box-testing"],
  },
  {
    id: "pairwise-testing",
    term: "Pairwise Testing",
    abbreviation: null,
    definition:
      "A black-box test design technique in which test cases are designed to execute all possible discrete combinations of each pair of input parameters. This provides good coverage with fewer test cases than exhaustive testing.",
    category: "test-design",
    relatedTerms: ["black-box-testing", "equivalence-partitioning"],
    seeAlso: [],
  },

  // ── Test Management ──
  {
    id: "test-plan",
    term: "Test Plan",
    abbreviation: null,
    definition:
      "A document describing the scope, approach, resources and schedule of intended test activities. A test plan identifies the items to be tested, the testing tasks, who will do each task, and the criteria for success.",
    category: "test-management",
    relatedTerms: ["test-strategy", "test-case"],
    seeAlso: ["test-management-type"],
  },
  {
    id: "test-strategy",
    term: "Test Strategy",
    abbreviation: null,
    definition:
      "A high-level document that defines the test levels to be performed and the testing within those levels for an organization or program. A test strategy provides the overall testing approach.",
    category: "test-management",
    relatedTerms: ["test-plan", "risk-based-testing"],
    seeAlso: [],
  },
  {
    id: "test-case",
    term: "Test Case",
    abbreviation: null,
    definition:
      "A set of preconditions, inputs, actions, expected results and postconditions, developed based on test conditions. A test case is the smallest unit of testing.",
    category: "test-management",
    relatedTerms: ["test-suite", "test-procedure"],
    seeAlso: ["test-plan", "test-execution"],
  },
  {
    id: "test-suite",
    term: "Test Suite",
    abbreviation: null,
    definition:
      "A set of test cases or test procedures to be executed in a specific test cycle. A test suite groups related test cases for organized execution.",
    category: "test-management",
    relatedTerms: ["test-case", "test-execution"],
    seeAlso: ["regression-testing"],
  },
  {
    id: "test-procedure",
    term: "Test Procedure",
    abbreviation: null,
    definition:
      "A sequence of actions for the execution of a test. A test procedure specifies the exact steps a tester must follow to execute one or more test cases.",
    category: "test-management",
    relatedTerms: ["test-case", "test-execution"],
    seeAlso: [],
  },
  {
    id: "test-execution",
    term: "Test Execution",
    abbreviation: null,
    definition:
      "The process of running a test on the component or system under test, producing actual results. Test execution compares actual outcomes against expected results.",
    category: "test-management",
    relatedTerms: ["test-case", "dynamic-testing"],
    seeAlso: ["defect"],
  },
  {
    id: "traceability",
    term: "Traceability",
    abbreviation: null,
    definition:
      "The degree to which a relationship can be established between two or more work products. Requirements traceability links test cases to requirements to ensure complete coverage.",
    category: "test-management",
    relatedTerms: ["test-case", "requirements-based-testing"],
    seeAlso: ["test-plan"],
  },
  {
    id: "risk-based-testing",
    term: "Risk-based Testing",
    abbreviation: "RBT",
    definition:
      "Testing in which the management, selection, prioritization, and use of testing activities and resources are based on corresponding risk types and risk levels. Higher-risk areas receive more testing effort.",
    category: "test-management",
    relatedTerms: ["test-strategy", "impact-analysis"],
    seeAlso: ["test-plan"],
  },
  {
    id: "impact-analysis",
    term: "Impact Analysis",
    abbreviation: null,
    definition:
      "The assessment of change to the layers of development documentation, test documentation and components, in order to implement a given change to specified requirements. Impact analysis helps determine the scope of regression testing.",
    category: "test-management",
    relatedTerms: ["regression-testing", "risk-based-testing"],
    seeAlso: [],
  },
  {
    id: "defect-management",
    term: "Defect Management",
    abbreviation: null,
    definition:
      "The process of recognizing, recording, classifying, investigating, resolving and disposing of defects. Defect management tracks bugs from discovery through resolution.",
    category: "test-management",
    relatedTerms: ["defect", "incident"],
    seeAlso: ["root-cause-analysis"],
  },
  {
    id: "incident",
    term: "Incident",
    abbreviation: null,
    definition:
      "Any event occurring that requires investigation. An incident may be a deviation from expected behavior, a defect, or a failure that needs to be reported and tracked.",
    category: "test-management",
    relatedTerms: ["defect", "failure", "defect-management"],
    seeAlso: [],
  },
  {
    id: "test-management-type",
    term: "Test Management",
    abbreviation: null,
    definition:
      "The planning, estimating, monitoring, and control of test activities, typically carried out by a test manager. Test management ensures testing is performed efficiently and effectively.",
    category: "test-management",
    relatedTerms: ["test-plan", "test-strategy"],
    seeAlso: ["defect-management"],
  },
  {
    id: "requirements-based-testing",
    term: "Requirements-based Testing",
    abbreviation: null,
    definition:
      "An approach to testing in which test cases are designed based on test objectives and test conditions derived from requirements. Requirements-based testing ensures each requirement has corresponding test coverage.",
    category: "test-management",
    relatedTerms: ["traceability", "test-case"],
    seeAlso: ["risk-based-testing"],
  },
  {
    id: "exit-criteria",
    term: "Exit Criteria",
    abbreviation: null,
    definition:
      "The set of conditions for officially completing a defined task. Exit criteria are the conditions that must be met to declare a testing phase complete, such as achieving a target defect density or code coverage percentage.",
    category: "test-management",
    relatedTerms: ["test-plan", "test-management-type"],
    seeAlso: [],
  },
  {
    id: "test-environment",
    term: "Test Environment",
    abbreviation: null,
    definition:
      "An environment containing hardware, instrumentation, simulators, software tools, and other support elements needed to conduct a test. The test environment should closely resemble the production environment.",
    category: "test-management",
    relatedTerms: ["system-under-test"],
    seeAlso: ["test-execution"],
  },
  {
    id: "system-under-test",
    term: "System Under Test",
    abbreviation: "SUT",
    definition:
      "The system or component that is being tested. Also referred to as the application under test (AUT) or test object.",
    category: "test-management",
    relatedTerms: ["test-environment", "application-under-test"],
    seeAlso: ["testing"],
  },
  {
    id: "application-under-test",
    term: "Application Under Test",
    abbreviation: "AUT",
    definition:
      "The application that is being tested. A synonym for system under test (SUT) when the test object is an application.",
    category: "test-management",
    relatedTerms: ["system-under-test"],
    seeAlso: ["testing"],
  },
  {
    id: "test-oracle",
    term: "Test Oracle",
    abbreviation: null,
    definition:
      "A source to determine expected results to compare with the actual result of the software under test. A test oracle may be an existing system, a user manual, or an individual's specialized knowledge.",
    category: "test-management",
    relatedTerms: ["test-case", "test-execution"],
    seeAlso: [],
  },
  {
    id: "test-basis",
    term: "Test Basis",
    abbreviation: null,
    definition:
      "The body of knowledge used as the basis for test analysis and design. The test basis may include requirements, design specifications, code, risk analysis reports, and user manuals.",
    category: "test-management",
    relatedTerms: ["test-case", "traceability"],
    seeAlso: ["requirements-based-testing"],
  },

  // ── Test Tools & Automation ──
  {
    id: "test-automation",
    term: "Test Automation",
    abbreviation: null,
    definition:
      "The use of software to perform or support test activities, e.g., test management, test design, test execution and results checking. Test automation increases efficiency and repeatability of testing.",
    category: "test-tools-automation",
    relatedTerms: ["test-framework", "continuous-integration"],
    seeAlso: ["regression-testing", "keyword-driven-testing"],
  },
  {
    id: "test-framework",
    term: "Test Framework",
    abbreviation: null,
    definition:
      "A set of abstract and concrete classes and interfaces that provide a reusable structure for designing and implementing automated tests. Examples include xUnit frameworks, BDD frameworks, and keyword-driven frameworks.",
    category: "test-tools-automation",
    relatedTerms: ["test-automation", "keyword-driven-testing", "data-driven-testing"],
    seeAlso: [],
  },
  {
    id: "continuous-integration",
    term: "Continuous Integration",
    abbreviation: "CI",
    definition:
      "A development practice where developers integrate code into a shared repository frequently. Each integration is verified by an automated build and automated tests to detect integration errors as quickly as possible.",
    category: "test-tools-automation",
    relatedTerms: ["continuous-delivery", "continuous-deployment", "test-automation"],
    seeAlso: ["smoke-testing", "regression-testing"],
  },
  {
    id: "continuous-delivery",
    term: "Continuous Delivery",
    abbreviation: "CD",
    definition:
      "A software engineering approach in which teams produce software in short cycles, ensuring that the software can be reliably released at any time. Continuous delivery extends continuous integration by automating the release process.",
    category: "test-tools-automation",
    relatedTerms: ["continuous-integration", "continuous-deployment"],
    seeAlso: ["devops"],
  },
  {
    id: "continuous-deployment",
    term: "Continuous Deployment",
    abbreviation: null,
    definition:
      "A software release process that uses automated testing to validate if changes to a codebase are correct and stable for immediate autonomous deployment to a production environment.",
    category: "test-tools-automation",
    relatedTerms: ["continuous-delivery", "continuous-integration"],
    seeAlso: ["devops"],
  },
  {
    id: "ci-cd",
    term: "CI/CD",
    abbreviation: "CI/CD",
    definition:
      "The combined practices of continuous integration and continuous delivery/deployment. CI/CD is a method to frequently deliver apps to customers by introducing automation into the stages of app development.",
    category: "test-tools-automation",
    relatedTerms: ["continuous-integration", "continuous-delivery", "continuous-deployment"],
    seeAlso: ["devops", "test-automation"],
  },
  {
    id: "keyword-driven-testing",
    term: "Keyword-driven Testing",
    abbreviation: null,
    definition:
      "A scripting technique that uses data files to contain the keywords related to the application being tested. Keywords represent actions to be performed on the system, making tests readable by non-technical stakeholders.",
    category: "test-tools-automation",
    relatedTerms: ["data-driven-testing", "test-framework"],
    seeAlso: ["test-automation"],
  },
  {
    id: "data-driven-testing",
    term: "Data-driven Testing",
    abbreviation: null,
    definition:
      "A scripting technique that stores test input and expected results in a table or spreadsheet, so that a single control script can execute all the test cases in the table. This separates test logic from test data.",
    category: "test-tools-automation",
    relatedTerms: ["keyword-driven-testing", "test-framework"],
    seeAlso: ["test-automation"],
  },
  {
    id: "devops",
    term: "DevOps",
    abbreviation: null,
    definition:
      "An organizational approach aiming to create synergy by getting development and operations to work together to achieve a common goal. DevOps emphasizes automation, monitoring, and collaboration across the software delivery lifecycle.",
    category: "test-tools-automation",
    relatedTerms: ["ci-cd", "continuous-integration"],
    seeAlso: ["agile-testing-type"],
  },
  {
    id: "test-harness",
    term: "Test Harness",
    abbreviation: null,
    definition:
      "A test environment comprised of stubs and drivers needed to execute a test. A test harness provides the supporting code and data needed to test a unit or component in isolation.",
    category: "test-tools-automation",
    relatedTerms: ["test-framework", "unit-testing"],
    seeAlso: ["test-environment"],
  },
  {
    id: "mock-object",
    term: "Mock Object",
    abbreviation: null,
    definition:
      "A simulated object that mimics the behavior of a real object in a controlled way. Mocks are used in unit testing to isolate the component under test from its dependencies.",
    category: "test-tools-automation",
    relatedTerms: ["test-harness", "unit-testing"],
    seeAlso: ["integration-testing"],
  },
  {
    id: "test-stub",
    term: "Test Stub",
    abbreviation: null,
    definition:
      "A skeletal or special-purpose implementation of a software component, used to develop or test a component that calls or is otherwise dependent on it. Stubs replace called components.",
    category: "test-tools-automation",
    relatedTerms: ["mock-object", "test-harness"],
    seeAlso: ["unit-testing"],
  },

  // ── Performance Testing ──
  {
    id: "performance-testing-type",
    term: "Performance Testing",
    abbreviation: null,
    definition:
      "Testing to determine the performance of a software product. Performance testing measures response times, throughput, and resource utilization under various conditions.",
    category: "performance-testing",
    relatedTerms: ["load-testing", "stress-testing", "non-functional-testing"],
    seeAlso: ["endurance-testing", "scalability-testing"],
  },
  {
    id: "load-testing",
    term: "Load Testing",
    abbreviation: null,
    definition:
      "A type of performance testing conducted to evaluate the behavior of a component or system under expected load conditions. Load testing determines a system's behavior under normal and peak load conditions.",
    category: "performance-testing",
    relatedTerms: ["stress-testing", "performance-testing-type"],
    seeAlso: ["endurance-testing", "scalability-testing"],
  },
  {
    id: "stress-testing",
    term: "Stress Testing",
    abbreviation: null,
    definition:
      "A type of performance testing conducted to evaluate a system or component at or beyond the limits of its anticipated or specified workloads. Stress testing determines how a system handles extreme conditions.",
    category: "performance-testing",
    relatedTerms: ["load-testing", "performance-testing-type"],
    seeAlso: ["spike-testing"],
  },
  {
    id: "endurance-testing",
    term: "Endurance Testing",
    abbreviation: null,
    definition:
      "A type of performance testing conducted to evaluate the behavior of a system when a significant workload is given continuously over a long period of time. Also known as soak testing.",
    category: "performance-testing",
    relatedTerms: ["load-testing", "performance-testing-type"],
    seeAlso: ["stress-testing"],
  },
  {
    id: "scalability-testing",
    term: "Scalability Testing",
    abbreviation: null,
    definition:
      "Testing to determine the scalability of the software product. Scalability testing evaluates a system's ability to handle increasing amounts of work by adding resources.",
    category: "performance-testing",
    relatedTerms: ["load-testing", "performance-testing-type"],
    seeAlso: [],
  },
  {
    id: "spike-testing",
    term: "Spike Testing",
    abbreviation: null,
    definition:
      "Testing to determine the reaction of a system to sudden bursts of peak loads. Spike testing evaluates performance when the load is suddenly and substantially increased.",
    category: "performance-testing",
    relatedTerms: ["stress-testing", "load-testing"],
    seeAlso: ["performance-testing-type"],
  },
  {
    id: "volume-testing",
    term: "Volume Testing",
    abbreviation: null,
    definition:
      "Testing where the system is subjected to large volumes of data to determine if the system can handle the required data volume. Volume testing evaluates system behavior when database sizes grow.",
    category: "performance-testing",
    relatedTerms: ["load-testing", "performance-testing-type"],
    seeAlso: [],
  },
  {
    id: "response-time",
    term: "Response Time",
    abbreviation: null,
    definition:
      "The elapsed time between the end of an inquiry or demand on a computer system and the beginning of a response. Response time is a key performance metric in performance testing.",
    category: "performance-testing",
    relatedTerms: ["performance-testing-type", "service-level-agreement"],
    seeAlso: ["load-testing"],
  },
  {
    id: "throughput",
    term: "Throughput",
    abbreviation: null,
    definition:
      "The amount of data or number of transactions processed per unit of time. Throughput is a key metric for measuring system performance under load.",
    category: "performance-testing",
    relatedTerms: ["performance-testing-type", "response-time"],
    seeAlso: ["load-testing"],
  },
  {
    id: "service-level-agreement",
    term: "Service Level Agreement",
    abbreviation: "SLA",
    definition:
      "A contract between a service provider and a customer that defines the expected level of service, including performance metrics such as uptime, response time, and resolution time.",
    category: "performance-testing",
    relatedTerms: ["response-time", "performance-testing-type"],
    seeAlso: [],
  },

  // ── Security Testing ──
  {
    id: "security-testing-type",
    term: "Security Testing",
    abbreviation: null,
    definition:
      "Testing to determine the security of the software product. Security testing evaluates a system's ability to protect data and maintain functionality as intended against unauthorized access.",
    category: "security-testing",
    relatedTerms: ["penetration-testing", "vulnerability-scanning"],
    seeAlso: ["non-functional-testing"],
  },
  {
    id: "penetration-testing",
    term: "Penetration Testing",
    abbreviation: "Pentest",
    definition:
      "A testing technique aiming to exploit vulnerabilities in a system to determine whether unauthorized access or other malicious activity is possible. Penetration testing simulates real-world attacks.",
    category: "security-testing",
    relatedTerms: ["security-testing-type", "vulnerability-scanning"],
    seeAlso: ["ethical-hacking"],
  },
  {
    id: "vulnerability-scanning",
    term: "Vulnerability Scanning",
    abbreviation: null,
    definition:
      "An automated process of proactively identifying security vulnerabilities of computing systems in a network. Vulnerability scanning tools compare system configurations against known vulnerability databases.",
    category: "security-testing",
    relatedTerms: ["penetration-testing", "security-testing-type"],
    seeAlso: [],
  },
  {
    id: "ethical-hacking",
    term: "Ethical Hacking",
    abbreviation: null,
    definition:
      "The practice of employing computer and network skills to test and improve an organization's security by attempting to identify and exploit vulnerabilities, with the organization's permission.",
    category: "security-testing",
    relatedTerms: ["penetration-testing", "security-testing-type"],
    seeAlso: [],
  },
  {
    id: "owasp",
    term: "OWASP",
    abbreviation: "OWASP",
    definition:
      "The Open Web Application Security Project is an international non-profit organization dedicated to web application security. OWASP produces the well-known Top 10 list of web application security risks.",
    category: "security-testing",
    relatedTerms: ["security-testing-type", "penetration-testing"],
    seeAlso: [],
  },
  {
    id: "sql-injection",
    term: "SQL Injection",
    abbreviation: "SQLi",
    definition:
      "A code injection technique that exploits a security vulnerability occurring in the database layer of an application. SQL injection allows attackers to execute malicious SQL statements that control a web application's database server.",
    category: "security-testing",
    relatedTerms: ["security-testing-type", "owasp"],
    seeAlso: ["cross-site-scripting"],
  },
  {
    id: "cross-site-scripting",
    term: "Cross-site Scripting",
    abbreviation: "XSS",
    definition:
      "A type of security vulnerability typically found in web applications. XSS enables attackers to inject client-side scripts into web pages viewed by other users, potentially stealing session tokens or defacing websites.",
    category: "security-testing",
    relatedTerms: ["security-testing-type", "owasp", "sql-injection"],
    seeAlso: [],
  },

  // ── Agile Testing ──
  {
    id: "agile-testing-type",
    term: "Agile Testing",
    abbreviation: null,
    definition:
      "Testing practice for a project using agile methodologies, incorporating techniques and methods such as extreme programming (XP), treating development as the customer of testing and emphasizing a test-first design paradigm.",
    category: "agile-testing",
    relatedTerms: ["test-driven-development", "behavior-driven-development"],
    seeAlso: ["continuous-integration", "exploratory-testing"],
  },
  {
    id: "test-driven-development",
    term: "Test-driven Development",
    abbreviation: "TDD",
    definition:
      "A software development technique in which the test cases are developed, and often automated, before the software is developed to run those test cases. The cycle is: write a failing test, write code to pass it, refactor.",
    category: "agile-testing",
    relatedTerms: ["behavior-driven-development", "agile-testing-type", "unit-testing"],
    seeAlso: ["test-automation"],
  },
  {
    id: "behavior-driven-development",
    term: "Behavior-driven Development",
    abbreviation: "BDD",
    definition:
      "A collaborative approach to software development that bridges the communication gap between business and IT. BDD uses examples written in a natural language to illustrate the behavior the customer wants.",
    category: "agile-testing",
    relatedTerms: ["test-driven-development", "agile-testing-type", "acceptance-testing"],
    seeAlso: ["keyword-driven-testing"],
  },
  {
    id: "acceptance-test-driven-development",
    term: "Acceptance Test-driven Development",
    abbreviation: "ATDD",
    definition:
      "A development methodology based on communication between the business, developers and testers. Acceptance tests are written before the developers begin coding, defining the criteria that the software must meet.",
    category: "agile-testing",
    relatedTerms: ["test-driven-development", "behavior-driven-development", "acceptance-testing"],
    seeAlso: ["agile-testing-type"],
  },
  {
    id: "user-story",
    term: "User Story",
    abbreviation: null,
    definition:
      "A high-level user or business requirement commonly used in agile software development, typically following the format: As a [role], I want [feature], so that [benefit].",
    category: "agile-testing",
    relatedTerms: ["acceptance-criteria", "agile-testing-type"],
    seeAlso: ["acceptance-testing"],
  },
  {
    id: "acceptance-criteria",
    term: "Acceptance Criteria",
    abbreviation: null,
    definition:
      "The criteria that a component or system must satisfy in order to be accepted by a user, customer, or other authorized entity. Acceptance criteria define the boundaries and parameters of a user story.",
    category: "agile-testing",
    relatedTerms: ["user-story", "acceptance-testing"],
    seeAlso: ["definition-of-done"],
  },
  {
    id: "definition-of-done",
    term: "Definition of Done",
    abbreviation: "DoD",
    definition:
      "A shared understanding within the Scrum Team of what it means for a product backlog item to be considered complete. The definition of done typically includes coding, testing, and documentation standards.",
    category: "agile-testing",
    relatedTerms: ["acceptance-criteria", "agile-testing-type"],
    seeAlso: ["exit-criteria"],
  },
  {
    id: "sprint",
    term: "Sprint",
    abbreviation: null,
    definition:
      "A time-boxed iteration in Scrum, typically lasting one to four weeks, during which a potentially releasable product increment is created. Testing activities occur within each sprint.",
    category: "agile-testing",
    relatedTerms: ["agile-testing-type", "definition-of-done"],
    seeAlso: [],
  },
  {
    id: "session-based-test-management",
    term: "Session-based Test Management",
    abbreviation: "SBTM",
    definition:
      "A method for measuring and managing session-based exploratory testing. Testing is conducted in defined time-boxed sessions with specific missions, and results are reported in session sheets.",
    category: "agile-testing",
    relatedTerms: ["exploratory-testing", "agile-testing-type"],
    seeAlso: [],
  },

  // ── Additional Key Terms ──
  {
    id: "sdlc",
    term: "Software Development Lifecycle",
    abbreviation: "SDLC",
    definition:
      "The process of planning, creating, testing, and deploying an information system. The SDLC provides a structured approach to software development and includes various models such as Waterfall, Agile, and V-Model.",
    category: "test-management",
    relatedTerms: ["stlc", "testing"],
    seeAlso: ["agile-testing-type"],
  },
  {
    id: "stlc",
    term: "Software Testing Lifecycle",
    abbreviation: "STLC",
    definition:
      "The sequence of activities carried out during the testing process. The STLC includes requirement analysis, test planning, test case development, environment setup, test execution, and test closure.",
    category: "test-management",
    relatedTerms: ["sdlc", "test-plan", "test-execution"],
    seeAlso: [],
  },
  {
    id: "v-model",
    term: "V-Model",
    abbreviation: null,
    definition:
      "A software development model in which each development phase has a directly associated testing phase. The V-Model illustrates the relationships between each phase of the development lifecycle and its associated phase of testing.",
    category: "test-management",
    relatedTerms: [
      "sdlc",
      "unit-testing",
      "integration-testing",
      "system-testing",
      "acceptance-testing",
    ],
    seeAlso: [],
  },
  {
    id: "test-data",
    term: "Test Data",
    abbreviation: null,
    definition:
      "Data that exists (for example, in a database) before a test is executed, and that affects or is affected by the component or system under test. Test data includes inputs, expected outputs, and database contents.",
    category: "test-management",
    relatedTerms: ["test-case", "data-driven-testing"],
    seeAlso: ["test-environment"],
  },
  {
    id: "api-testing",
    term: "API Testing",
    abbreviation: null,
    definition:
      "Testing performed at the application programming interface (API) level to validate the functionality, reliability, performance, and security of the interface. API testing bypasses the user interface and communicates directly with the application.",
    category: "test-tools-automation",
    relatedTerms: ["integration-testing", "functional-testing"],
    seeAlso: ["end-to-end-testing"],
  },
  {
    id: "contract-testing",
    term: "Contract Testing",
    abbreviation: null,
    definition:
      "A testing approach where each party of an integration point verifies that it conforms to a shared contract. Contract testing ensures that services can communicate with each other without full integration testing.",
    category: "test-tools-automation",
    relatedTerms: ["api-testing", "integration-testing"],
    seeAlso: [],
  },
  {
    id: "mutation-testing",
    term: "Mutation Testing",
    abbreviation: null,
    definition:
      "A technique to evaluate the quality of test cases by introducing small changes (mutations) to the source code and checking if the test suite detects these changes. A mutation that is not caught indicates a gap in testing.",
    category: "test-design",
    relatedTerms: ["code-coverage", "test-case"],
    seeAlso: ["white-box-testing"],
  },
  {
    id: "chaos-engineering",
    term: "Chaos Engineering",
    abbreviation: null,
    definition:
      "The discipline of experimenting on a system in order to build confidence in the system's capability to withstand turbulent conditions in production. Chaos engineering proactively tests failure scenarios.",
    category: "test-tools-automation",
    relatedTerms: ["stress-testing"],
    seeAlso: ["performance-testing-type"],
  },
];
