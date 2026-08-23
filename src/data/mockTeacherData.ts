import { PracticeQuestion, StudentStruggleRecord, TopicStruggle } from '../types';

export const INITIAL_STUDENTS: StudentStruggleRecord[] = [
  {
    id: 'std-101',
    name: 'Aisha K.',
    board: 'NCERT',
    subject: 'Mathematics',
    grade: 'Class 10',
    urgency: 'critical',
    signals: 6,
    topics: ['Quadratic Equations — Splitting Middle Term', 'Trigonometric Ratios & Identities'],
    lastActive: '2 hours ago',
    helpfulPercentage: 20,
    recentDoubts: [
      'How to find the roots when the discriminant b²-4ac is not a perfect square?',
      'Why does sin²θ + cos²θ = 1 and how do I use it in proofs?',
      'Word problem: speed of a motorboat going upstream and downstream.'
    ],
    suggestedIntervention: 'Provide a 10-minute quadratic formula comparison visual chart and assign 3 scaffolded factoring drills.'
  },
  {
    id: 'std-102',
    name: 'Rohan V.',
    board: 'TSCERT',
    subject: 'Physical Science',
    grade: 'Class 10',
    urgency: 'critical',
    signals: 5,
    topics: ['Chemical Reactions & Equations — Redox & Balancing', 'Refraction at Curved Surfaces'],
    lastActive: 'Yesterday',
    helpfulPercentage: 25,
    recentDoubts: [
      'Why is respiration called an exothermic reaction?',
      'How do I know which element got oxidized and which got reduced in Fe2O3 + 3CO?',
      'Lens maker formula sign conventions for concave surfaces.'
    ],
    suggestedIntervention: 'Review oxidation state loss/gain of electrons with a color-coded table before Thursday lab.'
  },
  {
    id: 'std-103',
    name: 'Meher P.',
    board: 'TSCERT',
    subject: 'Mathematics',
    grade: 'Class 10',
    urgency: 'elevated',
    signals: 4,
    topics: ['Trigonometric Ratios of Specific Angles', 'Coordinate Geometry — Section Formula'],
    lastActive: '3 hours ago',
    helpfulPercentage: 40,
    recentDoubts: [
      'Is tan 90° undefined because cos 90° is zero?',
      'How to remember sin and cos table values easily without memorizing?'
    ],
    suggestedIntervention: 'Share the hand trick visual mnemonic for 0°, 30°, 45°, 60°, 90° values.'
  },
  {
    id: 'std-104',
    name: 'Sana T.',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 9',
    urgency: 'elevated',
    signals: 4,
    topics: ['Atoms and Molecules — Writing Chemical Formulas & Mole Concept'],
    lastActive: '1 day ago',
    helpfulPercentage: 35,
    recentDoubts: [
      'What is the criss-cross method for valencies in aluminium oxide?',
      'How many moles are there in 52g of Helium?'
    ],
    suggestedIntervention: 'Provide physical ion cards (Al³⁺, O²⁻) to practice formula balancing.'
  },
  {
    id: 'std-105',
    name: 'Vivaan S.',
    board: 'TSCERT',
    subject: 'Biological Science',
    grade: 'Class 10',
    urgency: 'elevated',
    signals: 3,
    topics: ["Heredity — Mendel's Laws & Punnett Square", 'Sex Determination in Humans'],
    lastActive: '5 hours ago',
    helpfulPercentage: 45,
    recentDoubts: [
      'Why did dwarf traits disappear in F1 generation and reappear in F2?',
      'Does the mother or father determine the biological sex of a baby?'
    ],
    suggestedIntervention: 'Walk through a 2x2 Punnett square on the board with green vs yellow seed traits.'
  },
  {
    id: 'std-106',
    name: 'Diya M.',
    board: 'TSCERT',
    subject: 'Mathematics',
    grade: 'Class 9',
    urgency: 'watch',
    signals: 2,
    topics: ['Polynomials — Zeroes and Remainder Theorem'],
    lastActive: '2 days ago',
    helpfulPercentage: 55,
    recentDoubts: [
      'What does it mean geometrically when p(x) has a zero at x = 3?'
    ],
    suggestedIntervention: 'Show graph intersection on the x-axis.'
  },
  {
    id: 'std-107',
    name: 'Karthik R.',
    board: 'NCERT',
    subject: 'Mathematics',
    grade: 'Class 9',
    urgency: 'watch',
    signals: 2,
    topics: ['Real Numbers & Decimal Expansion Rationalisation'],
    lastActive: '1 day ago',
    helpfulPercentage: 50,
    recentDoubts: [
      'Why is π irrational if 22/7 is rational?'
    ],
    suggestedIntervention: 'Clarify that 22/7 is only an approximate fraction used for practical calculation.'
  },
  {
    id: 'std-108',
    name: 'Ishaan N.',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 10',
    urgency: 'watch',
    signals: 2,
    topics: ['Light — Spherical Mirrors & Ray Diagrams'],
    lastActive: '6 hours ago',
    helpfulPercentage: 60,
    recentDoubts: [
      'Where is the image formed when object is placed at Center of Curvature (C)?'
    ],
    suggestedIntervention: 'Reinforce ray tracing rule #1 and rule #2 for concave mirrors.'
  }
];

export const INITIAL_TOPICS: TopicStruggle[] = [
  {
    name: 'Quadratic Equations — Factorisation & Roots',
    subject: 'Mathematics',
    grade: 'Class 10',
    board: 'NCERT',
    count: 24,
    trend: [8, 11, 14, 17, 20, 24],
    students: 9,
    subconcepts: ['Splitting middle term', 'Discriminant test (D < 0)', 'Word problem framing']
  },
  {
    name: 'Trigonometric Ratios & Angle Values',
    subject: 'Mathematics',
    grade: 'Class 10',
    board: 'TSCERT',
    count: 19,
    trend: [5, 8, 11, 13, 16, 19],
    students: 8,
    subconcepts: ['Standard values (30°, 45°, 60°)', 'Complementary angles', 'sin² + cos² identity']
  },
  {
    name: 'Light — Reflection & Refraction (Mirrors & Lenses)',
    subject: 'Science',
    grade: 'Class 10',
    board: 'NCERT',
    count: 17,
    trend: [10, 11, 12, 14, 15, 17],
    students: 7,
    subconcepts: ['Sign convention (+/-)', 'Lens formula vs Mirror formula', 'Power in Dioptres']
  },
  {
    name: 'Chemical Reactions — Balancing & Redox',
    subject: 'Physical Science',
    grade: 'Class 10',
    board: 'TSCERT',
    count: 15,
    trend: [6, 8, 10, 12, 13, 15],
    students: 6,
    subconcepts: ['Law of conservation of mass', 'Identifying reducing agents', 'Precipitation reactions']
  },
  {
    name: "Heredity — Mendel's Monohybrid Cross",
    subject: 'Biological Science',
    grade: 'Class 10',
    board: 'TSCERT',
    count: 12,
    trend: [4, 5, 7, 8, 10, 12],
    students: 5,
    subconcepts: ['Phenotype vs Genotype 3:1 ratio', 'Dominant vs Recessive alleles', 'Sex chromosomes']
  },
  {
    name: 'Atoms and Molecules — Mole Concept & Valency',
    subject: 'Science',
    grade: 'Class 9',
    board: 'NCERT',
    count: 11,
    trend: [7, 8, 8, 9, 10, 11],
    students: 5,
    subconcepts: ['Calculating molar mass', 'Avogadro number conversions', 'Criss-cross valency formulas']
  },
  {
    name: 'Equations of Motion (v=u+at, s=ut+½at²)',
    subject: 'Physical Science',
    grade: 'Class 9',
    board: 'TSCERT',
    count: 9,
    trend: [5, 6, 6, 7, 8, 9],
    students: 4,
    subconcepts: ['Distance vs Displacement vectors', 'Negative acceleration (retardation)', 'Velocity-time area']
  },
  {
    name: 'Real Numbers — Decimal Expansions & Surds',
    subject: 'Mathematics',
    grade: 'Class 9',
    board: 'NCERT',
    count: 9,
    trend: [8, 8, 9, 8, 10, 9],
    students: 4,
    subconcepts: ['Proving √2 is irrational', 'Rationalising binomial denominators', 'p/q representations']
  }
];

export const INITIAL_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // ================= MATHEMATICS CLASS 10 =================
  {
    id: 'q-math-10-easy',
    subject: 'Mathematics',
    grade: 'Class 10',
    chapter: 'Quadratic Equations',
    difficulty: 'Easy',
    question: 'What is the discriminant (D) of the quadratic equation ax² + bx + c = 0?',
    options: ['D = b² - 4ac', 'D = b² + 4ac', 'D = 4ac - b²', 'D = √(b² - 4ac)'],
    correctIndex: 0,
    hint: 'Recall the expression inside the square root of the quadratic formula: x = (-b ± √D) / 2a.',
    explanation: 'The discriminant of standard quadratic equation ax² + bx + c = 0 is defined as D = b² - 4ac. It determines the nature of the roots (real & distinct if D > 0, real & equal if D = 0, no real roots if D < 0).'
  },
  {
    id: 'q-101',
    subject: 'Mathematics',
    grade: 'Class 10',
    chapter: 'Quadratic Equations',
    difficulty: 'Medium',
    question: 'Find the roots of the quadratic equation: 2x² - 5x + 3 = 0 using factorisation.',
    options: ['x = 1 and x = 3/2', 'x = -1 and x = -3/2', 'x = 2 and x = 3', 'x = 1/2 and x = 3'],
    correctIndex: 0,
    hint: 'Split the middle term (-5x) into two numbers whose sum is -5 and product is 2 × 3 = 6 (i.e. -2 and -3).',
    explanation: 'Step 1: Multiply a × c = 2 × 3 = 6.\nStep 2: Find two numbers whose product is 6 and sum is -5. These are -2 and -3.\nStep 3: Split middle term: 2x² - 2x - 3x + 3 = 0.\nStep 4: Group terms: 2x(x - 1) - 3(x - 1) = 0 → (2x - 3)(x - 1) = 0.\nStep 5: Setting each factor to 0 gives x = 1 and x = 3/2.'
  },
  {
    id: 'q-math-10-chal',
    subject: 'Mathematics',
    grade: 'Class 10',
    chapter: 'Quadratic Equations',
    difficulty: 'Challenging',
    question: 'A motorboat whose speed is 18 km/h in still water takes 1 hour more to go 24 km upstream than to return downstream to the same spot. Find the speed of the stream.',
    options: ['6 km/h', '4 km/h', '8 km/h', '5 km/h'],
    correctIndex: 0,
    hint: 'Speed upstream = (18 - x) km/h, Speed downstream = (18 + x) km/h. Form the time difference equation: 24/(18 - x) - 24/(18 + x) = 1.',
    explanation: 'Let speed of stream = x km/h. Speed upstream = 18 - x, Speed downstream = 18 + x.\nTime upstream = 24 / (18 - x), Time downstream = 24 / (18 + x).\nEquation: 24/(18 - x) - 24/(18 + x) = 1\n24[(18 + x) - (18 - x)] = (18 - x)(18 + x)\n24(2x) = 324 - x²\nx² + 48x - 324 = 0\n(x + 54)(x - 6) = 0\nSince speed cannot be negative, x = 6 km/h.'
  },
  {
    id: 'q-trig-10-easy',
    subject: 'Mathematics',
    grade: 'Class 10',
    chapter: 'Introduction to Trigonometry',
    difficulty: 'Easy',
    question: 'If sin θ = 1/2, what is the value of angle θ (where 0° ≤ θ ≤ 90°)?',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 0,
    hint: 'Check the standard trigonometric ratios table for sine values: 0, 1/2, 1/√2, √3/2, 1.',
    explanation: 'From the standard trigonometry table: sin 0° = 0, sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, sin 90° = 1. Hence θ = 30°.'
  },
  {
    id: 'q-trig-10-med',
    subject: 'Mathematics',
    grade: 'Class 10',
    chapter: 'Introduction to Trigonometry',
    difficulty: 'Medium',
    question: 'Evaluate the trigonometric identity: (sin² 30° + cos² 30°) / (1 + tan² 45°).',
    options: ['1/2', '1', '2', '1/√2'],
    correctIndex: 0,
    hint: 'Use the fundamental identity sin²θ + cos²θ = 1 and substitute tan 45° = 1.',
    explanation: 'Numerator: sin² 30° + cos² 30° = 1 (by standard Pythagorean identity).\nDenominator: 1 + tan² 45° = 1 + (1)² = 2.\nResult = 1 / 2.'
  },
  {
    id: 'q-trig-10-chal',
    subject: 'Mathematics',
    grade: 'Class 10',
    chapter: 'Introduction to Trigonometry',
    difficulty: 'Challenging',
    question: 'Prove/Evaluate: If sec θ + tan θ = p, what is the value of sec θ in terms of p?',
    options: ['(p² + 1) / 2p', '(p² - 1) / 2p', '(2p) / (p² + 1)', '(p + 1) / 2'],
    correctIndex: 0,
    hint: 'Use the identity sec²θ - tan²θ = 1 → (sec θ + tan θ)(sec θ - tan θ) = 1 → sec θ - tan θ = 1/p.',
    explanation: 'Equation 1: sec θ + tan θ = p\nSince sec²θ - tan²θ = 1, we get sec θ - tan θ = 1/p (Equation 2).\nAdding Eq 1 and Eq 2: 2 sec θ = p + 1/p = (p² + 1)/p.\nTherefore, sec θ = (p² + 1) / (2p).'
  },

  // ================= SCIENCE & PHYSICAL SCIENCE CLASS 10 =================
  {
    id: 'q-102',
    subject: 'Science',
    grade: 'Class 10',
    chapter: 'Light — Reflection and Refraction',
    difficulty: 'Easy',
    question: 'Why are convex mirrors preferred as rear-view mirrors in automobiles?',
    options: [
      'They form an erect, diminished image and give a wider field of view.',
      'They form an inverted, magnified real image.',
      'They focus distant light rays to a single bright point.',
      'They absorb glare from sunlight completely.'
    ],
    correctIndex: 0,
    hint: 'Think about whether you want to see a right-side-up image of a wide area behind your car.',
    explanation: 'Convex mirrors always form an erect (upright) and diminished (smaller) virtual image regardless of object position. Because they curve outward, they cover a significantly wider field of view than flat or concave mirrors, allowing drivers to view much more traffic.'
  },
  {
    id: 'q-light-10-med',
    subject: 'Science',
    grade: 'Class 10',
    chapter: 'Light — Reflection and Refraction',
    difficulty: 'Medium',
    question: 'An object is placed at a distance of 30 cm in front of a concave mirror of focal length 20 cm. Find the image distance (v).',
    options: ['-60 cm', '-30 cm', '+60 cm', '-12 cm'],
    correctIndex: 0,
    hint: 'Use mirror formula 1/f = 1/v + 1/u with Cartesian sign convention: u = -30 cm, f = -20 cm.',
    explanation: 'Mirror formula: 1/f = 1/v + 1/u\n1/v = 1/f - 1/u = 1/(-20) - 1/(-30) = -1/20 + 1/30 = (-3 + 2)/60 = -1/60.\nTherefore v = -60 cm. The negative sign indicates a real, inverted image in front of the mirror.'
  },
  {
    id: 'q-light-10-chal',
    subject: 'Science',
    grade: 'Class 10',
    chapter: 'Light — Reflection and Refraction',
    difficulty: 'Challenging',
    question: 'A convex lens of focal length 20 cm produces a real, inverted image 3 times the size of the object. What is the distance of the object from the lens?',
    options: ['-26.67 cm (-80/3 cm)', '-15 cm', '-30 cm', '-40 cm'],
    correctIndex: 0,
    hint: 'For real image from convex lens, magnification m = v/u = -3 → v = -3u. Substitute into lens formula 1/f = 1/v - 1/u.',
    explanation: 'Given: f = +20 cm, m = v/u = -3 (since image is real, m is negative) → v = -3u.\nLens formula: 1/f = 1/v - 1/u\n1/20 = 1/(-3u) - 1/u = -1/(3u) - 3/(3u) = -4/(3u)\n3u = -80 → u = -80/3 cm ≈ -26.67 cm.'
  },
  {
    id: 'q-chem-10-easy',
    subject: 'Physical Science',
    grade: 'Class 10',
    chapter: 'Chemical Reactions and Equations',
    difficulty: 'Easy',
    question: 'Which of the following is an example of an exothermic reaction?',
    options: [
      'Respiration and burning of natural gas',
      'Photosynthesis in green plants',
      'Thermal decomposition of calcium carbonate',
      'Dissolution of ammonium chloride in water'
    ],
    correctIndex: 0,
    hint: 'Exothermic reactions release energy in the form of heat into the surroundings.',
    explanation: 'Respiration is an exothermic reaction because glucose combines with oxygen in cells to release energy (C6H12O6 + 6O2 → 6CO2 + 6H2O + Energy). Photosynthesis and thermal decomposition absorb heat/energy and are endothermic.'
  },
  {
    id: 'q-chem-10-med',
    subject: 'Physical Science',
    grade: 'Class 10',
    chapter: 'Chemical Reactions and Equations',
    difficulty: 'Medium',
    question: 'In the reaction: CuO + H2 → Cu + H2O, which substance is oxidized and which is reduced?',
    options: [
      'H2 is oxidized (gains oxygen), CuO is reduced (loses oxygen)',
      'CuO is oxidized, H2 is reduced',
      'Cu is oxidized, H2O is reduced',
      'Neither is oxidized; this is a neutralization reaction'
    ],
    correctIndex: 0,
    hint: 'Oxidation is gain of oxygen (or loss of electrons), reduction is loss of oxygen (or gain of electrons).',
    explanation: 'In CuO + H2 → Cu + H2O: CuO loses oxygen to become Cu (Reduction), and H2 gains oxygen to become H2O (Oxidation). Thus H2 is the reducing agent and CuO is the oxidizing agent.'
  },
  {
    id: 'q-chem-10-chal',
    subject: 'Physical Science',
    grade: 'Class 10',
    chapter: 'Chemical Reactions and Equations',
    difficulty: 'Challenging',
    question: 'Balance the redox equation in acidic condition: MnO4⁻ + Fe²⁺ + H⁺ → Mn²⁺ + Fe³⁺ + H2O. What are the stoichiometric coefficients?',
    options: [
      '1 MnO4⁻, 5 Fe²⁺, 8 H⁺ → 1 Mn²⁺, 5 Fe³⁺, 4 H2O',
      '2 MnO4⁻, 5 Fe²⁺, 16 H⁺ → 2 Mn²⁺, 5 Fe³⁺, 8 H2O',
      '1 MnO4⁻, 3 Fe²⁺, 4 H⁺ → 1 Mn²⁺, 3 Fe³⁺, 2 H2O',
      '1 MnO4⁻, 2 Fe²⁺, 8 H⁺ → 1 Mn²⁺, 2 Fe³⁺, 4 H2O'
    ],
    correctIndex: 0,
    hint: 'Mn changes oxidation state from +7 to +2 (5 electrons gained). Fe²⁺ goes to Fe³⁺ (1 electron lost). Balance electron transfer with a 1:5 ratio.',
    explanation: 'Reduction half-reaction: MnO4⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H2O.\nOxidation half-reaction: 5(Fe²⁺ → Fe³⁺ + e⁻).\nCombining both: MnO4⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H2O.'
  },

  // ================= BIOLOGICAL SCIENCE CLASS 10 =================
  {
    id: 'q-105',
    subject: 'Biological Science',
    grade: 'Class 10',
    chapter: 'Heredity',
    difficulty: 'Easy',
    question: 'In human beings, which parent determines the biological sex of the child?',
    options: [
      'The father, because sperms carry either an X or a Y chromosome.',
      'The mother, because egg cells carry both X and Y chromosomes.',
      'Both parents equally, through random genetic mutation.',
      'The environmental temperature during embryonic development.'
    ],
    correctIndex: 0,
    hint: 'Females have two X chromosomes (XX), while males have one X and one Y chromosome (XY).',
    explanation: 'All female ovum/egg cells carry a single X chromosome (22+X). Half of male sperm cells carry an X chromosome (22+X) and the other half carry a Y chromosome (22+Y). If an X-bearing sperm fertilizes the egg, the child is XX (female). If a Y-bearing sperm fertilizes the egg, the child is XY (male). Therefore, the father’s sperm determines biological sex.'
  },
  {
    id: 'q-bio-10-med',
    subject: 'Biological Science',
    grade: 'Class 10',
    chapter: 'Heredity',
    difficulty: 'Medium',
    question: 'When a pure tall pea plant (TT) is crossed with a pure dwarf pea plant (tt), what is the phenotypic ratio in the F2 generation?',
    options: ['3 Tall : 1 Dwarf', '1 Tall : 2 Medium : 1 Dwarf', 'All Tall', '1 Tall : 1 Dwarf'],
    correctIndex: 0,
    hint: 'F1 generation is all Tt (Tall). Self-pollinating Tt × Tt gives TT, Tt, Tt, tt.',
    explanation: 'In Mendel’s monohybrid cross, the F1 plants are all heterozygous tall (Tt). Crossing Tt × Tt produces genotypes 1 TT : 2 Tt : 1 tt. Because T is dominant, TT and Tt appear tall, yielding a phenotypic ratio of 3 Tall : 1 Dwarf.'
  },
  {
    id: 'q-bio-10-chal',
    subject: 'Biological Science',
    grade: 'Class 10',
    chapter: 'Heredity',
    difficulty: 'Challenging',
    question: 'In a dihybrid cross of pea plants (Round Yellow RrYy × Round Yellow RrYy), what proportion of the offspring are expected to have wrinkled green seeds (rryy)?',
    options: ['1/16', '3/16', '9/16', '1/4'],
    correctIndex: 0,
    hint: 'Mendel’s dihybrid ratio is 9:3:3:1 (Round Yellow : Round Green : Wrinkled Yellow : Wrinkled Green).',
    explanation: 'The classic phenotypic ratio in F2 of a dihybrid cross is 9:3:3:1. The double recessive phenotype (wrinkled green, genotype rryy) represents 1 out of the 16 total combinations (1/16 or 6.25%).'
  },

  // ================= CLASS 9 QUESTIONS =================
  {
    id: 'q-sci-9-easy',
    subject: 'Science',
    grade: 'Class 9',
    chapter: 'Atoms and Molecules',
    difficulty: 'Easy',
    question: 'What is the standard unit used to express atomic mass?',
    options: ['Unified atomic mass unit (u)', 'Kilogram (kg)', 'Gram (g)', 'Pound (lb)'],
    correctIndex: 0,
    hint: 'According to IUPAC, atomic mass is measured relative to 1/12th of carbon-12 atom.',
    explanation: 'Atomic mass is measured in unified atomic mass units (u), previously known as amu. 1 u is defined as equal to 1/12th the mass of an unbound neutral carbon-12 atom.'
  },
  {
    id: 'q-103',
    subject: 'Science',
    grade: 'Class 9',
    chapter: 'Atoms and Molecules',
    difficulty: 'Medium',
    question: 'What is the chemical formula for Aluminium Oxide?',
    options: ['Al2O3', 'AlO', 'Al3O2', 'AlO2'],
    correctIndex: 0,
    hint: 'Aluminium has a valency of +3 and Oxygen has a valency of -2. Use the criss-cross rule.',
    explanation: 'Step 1: Write down symbols: Al and O.\nStep 2: Write down valencies: Al is 3, O is 2.\nStep 3: Criss-cross valencies: the subscript for Al becomes 2 and for O becomes 3.\nResulting formula: Al₂O₃.'
  },
  {
    id: 'q-sci-9-chal',
    subject: 'Science',
    grade: 'Class 9',
    chapter: 'Atoms and Molecules',
    difficulty: 'Challenging',
    question: 'Calculate the number of moles and particles present in 52 g of Helium (He) gas. (Atomic mass of He = 4 u, N₀ = 6.022 × 10²³).',
    options: [
      '13 moles and 7.828 × 10²⁴ atoms',
      '52 moles and 3.13 × 10²⁵ atoms',
      '4 moles and 2.408 × 10²⁴ atoms',
      '26 moles and 1.565 × 10²⁴ atoms'
    ],
    correctIndex: 0,
    hint: 'Number of moles (n) = Given mass (m) / Molar mass (M) = 52 / 4. Number of particles = n × N₀.',
    explanation: 'Molar mass of Helium = 4 g/mol.\nNumber of moles (n) = 52 g / 4 g/mol = 13 moles.\nNumber of atoms = 13 × 6.022 × 10²³ = 78.286 × 10²³ = 7.828 × 10²⁴ atoms.'
  },
  {
    id: 'q-104',
    subject: 'Physical Science',
    grade: 'Class 9',
    chapter: 'Motion',
    difficulty: 'Medium',
    question: 'A car starting from rest accelerates uniformly at 2 m/s² for 5 seconds. What is its final velocity?',
    options: ['10 m/s', '25 m/s', '7 m/s', '20 m/s'],
    correctIndex: 0,
    hint: 'Use the first equation of motion: v = u + at, where initial velocity u = 0 since the car started from rest.',
    explanation: 'Given: u = 0 m/s (from rest), a = 2 m/s², t = 5 s.\nUsing v = u + at:\nv = 0 + (2 × 5) = 10 m/s.'
  },
  {
    id: 'q-mot-9-easy',
    subject: 'Physical Science',
    grade: 'Class 9',
    chapter: 'Motion',
    difficulty: 'Easy',
    question: 'What is the SI unit of acceleration?',
    options: ['m/s²', 'm/s', 'km/h', 'm²·s'],
    correctIndex: 0,
    hint: 'Acceleration is the rate of change of velocity with time: (m/s) / s.',
    explanation: 'The SI unit of velocity is meters per second (m/s). Acceleration is rate of change of velocity (m/s per second), giving meters per second squared (m/s²).'
  },
  {
    id: 'q-mot-9-chal',
    subject: 'Physical Science',
    grade: 'Class 9',
    chapter: 'Motion',
    difficulty: 'Challenging',
    question: 'A train starts from rest and attains a speed of 72 km/h in 5 minutes. Assuming uniform acceleration, find the distance traveled by the train in this time.',
    options: ['3 km (3000 m)', '1.5 km', '6 km', '7.2 km'],
    correctIndex: 0,
    hint: 'Convert 72 km/h to m/s (72 × 5/18 = 20 m/s) and 5 minutes to seconds (300 s). Then use s = ut + 1/2 at² or v² = u² + 2as.',
    explanation: 'u = 0 m/s, v = 72 × (5/18) = 20 m/s, t = 5 × 60 = 300 s.\nAcceleration a = (v - u)/t = (20 - 0)/300 = 1/15 m/s².\nDistance s = ut + ½at² = 0 + ½(1/15)(300)² = ½(1/15)(90000) = 3000 m = 3 km.'
  }
];

export const MOCK_DOUBT_LOGS = [
  {
    id: 'log-1',
    studentName: 'Aisha K.',
    grade: 'Class 10',
    board: 'NCERT',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    question: 'How to find the roots when the discriminant b²-4ac is not a perfect square?',
    time: '12 mins ago',
    helpful: false,
    language: 'English'
  },
  {
    id: 'log-2',
    studentName: 'Rohan V.',
    grade: 'Class 10',
    board: 'TSCERT',
    subject: 'Physical Science',
    topic: 'Chemical Reactions',
    question: 'Why is respiration called an exothermic reaction? Please give equation in Telugu.',
    time: '35 mins ago',
    helpful: true,
    language: 'Telugu'
  },
  {
    id: 'log-3',
    studentName: 'Meher P.',
    grade: 'Class 10',
    board: 'TSCERT',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    question: 'Is tan 90° undefined because cos 90° is zero? Easy way to remember table values.',
    time: '1 hour ago',
    helpful: true,
    language: 'English'
  },
  {
    id: 'log-4',
    studentName: 'Sana T.',
    grade: 'Class 9',
    board: 'NCERT',
    subject: 'Science',
    topic: 'Atoms & Molecules',
    question: 'What is the criss-cross method for valencies in aluminium oxide?',
    time: '2 hours ago',
    helpful: true,
    language: 'Hindi'
  },
  {
    id: 'log-5',
    studentName: 'Vivaan S.',
    grade: 'Class 10',
    board: 'TSCERT',
    subject: 'Biological Science',
    topic: 'Heredity & Genetics',
    question: 'Why did dwarf traits disappear in F1 generation and reappear in F2 in 3:1 ratio?',
    time: '3 hours ago',
    helpful: true,
    language: 'English'
  },
  {
    id: 'log-6',
    studentName: 'Diya M.',
    grade: 'Class 9',
    board: 'TSCERT',
    subject: 'Mathematics',
    topic: 'Polynomials',
    question: 'What does it mean geometrically when p(x) has a zero at x = 3?',
    time: '4 hours ago',
    helpful: true,
    language: 'Telugu'
  },
  {
    id: 'log-7',
    studentName: 'Aisha K.',
    grade: 'Class 10',
    board: 'NCERT',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    question: 'Why does sin²θ + cos²θ = 1 and how do I use it in proofs without getting stuck?',
    time: '5 hours ago',
    helpful: false,
    language: 'English'
  },
  {
    id: 'log-8',
    studentName: 'Karthik R.',
    grade: 'Class 9',
    board: 'NCERT',
    subject: 'Mathematics',
    topic: 'Real Numbers',
    question: 'Why is π irrational if 22/7 is rational? Are they different numbers?',
    time: 'Yesterday',
    helpful: true,
    language: 'English'
  },
  {
    id: 'log-9',
    studentName: 'Ishaan N.',
    grade: 'Class 10',
    board: 'NCERT',
    subject: 'Science',
    topic: 'Light - Mirrors',
    question: 'Where is the image formed when object is placed at Center of Curvature (C)?',
    time: 'Yesterday',
    helpful: true,
    language: 'Hindi'
  },
  {
    id: 'log-10',
    studentName: 'Rohan V.',
    grade: 'Class 10',
    board: 'TSCERT',
    subject: 'Physical Science',
    topic: 'Refraction Curved Surfaces',
    question: 'Lens maker formula sign conventions for concave surfaces in SSC exams.',
    time: '2 days ago',
    helpful: false,
    language: 'English'
  }
];
